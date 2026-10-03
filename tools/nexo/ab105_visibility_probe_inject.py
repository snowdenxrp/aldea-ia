from pathlib import Path

helper = Path("server-common/src/main/java/org/apache/kafka/server/common/NexoVisibilityRecorder.java")
helper.parent.mkdir(parents=True, exist_ok=True)
helper.write_text("""package org.apache.kafka.server.common;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public final class NexoVisibilityRecorder {
    private static final ThreadLocal<State> STATE = new ThreadLocal<>();

    private NexoVisibilityRecorder() {}

    public static void init() {
        if (STATE.get() == null) STATE.set(new State());
    }

    public static void w1(Object cache) {
        State s = STATE.get();
        if (s != null) s.record(1, cache, 0);
    }

    public static void auth(Object cache, long correlationId) {
        State s = STATE.get();
        if (s != null) s.record(2, cache, correlationId);
    }

    public static void flush() {
        State s = STATE.get();
        if (s != null) s.flush();
    }

    private static final class State {
        private static final int CAPACITY = 128;
        private final long[] nano = new long[CAPACITY];
        private final int[] kind = new int[CAPACITY];
        private final Object[] cache = new Object[CAPACITY];
        private final long[] correlation = new long[CAPACITY];
        private int size;

        void record(int k, Object value, long correlationId) {
            if (size >= CAPACITY) return;
            int i = size++;
            kind[i] = k;
            nano[i] = System.nanoTime();
            cache[i] = value;
            correlation[i] = correlationId;
        }

        void flush() {
            Path path = Path.of("/tmp",
                "nexo-ab105-visibility-" + Thread.currentThread().getId() + ".log");
            try (BufferedWriter out = Files.newBufferedWriter(path)) {
                out.write("thread=" + Thread.currentThread().getName());
                out.newLine();
                for (int i = 0; i < size; i++) {
                    out.write(kind[i] + " " + nano[i] + " "
                        + System.identityHashCode(cache[i]) + " " + correlation[i]);
                    out.newLine();
                }
            } catch (IOException e) {
                throw new RuntimeException("Nexo visibility flush failed", e);
            }
        }
    }
}
""")

def replace_once(path, old, new):
    p = Path(path)
    s = p.read_text()
    if s.count(old) != 1:
        raise SystemExit(f"marker mismatch: {path}")
    p.write_text(s.replace(old, new, 1))

p = Path("metadata/src/main/java/org/apache/kafka/metadata/authorizer/StandardAuthorizerData.java")
s = p.read_text()
s = s.replace(
    "import org.apache.kafka.server.authorizer.Action;",
    "import org.apache.kafka.server.authorizer.Action;\n"
    "import org.apache.kafka.server.common.NexoVisibilityRecorder;",
    1)
replace_once(
    p,
    "            aclCache = aclCacheSnapshot;",
    "            aclCache = aclCacheSnapshot;\n"
    "            NexoVisibilityRecorder.init();\n"
    "            NexoVisibilityRecorder.w1(aclCacheSnapshot);")
replace_once(
    p,
    "            AclCache aclCacheSnapshot = aclCache;",
    "            AclCache aclCacheSnapshot = aclCache;\n"
    "            if (\"nexo-g0-ordering\".equals(requestContext.clientId()) && "
    "action.operation() == WRITE && "
    "action.resourcePattern().resourceType() == ResourceType.TOPIC && "
    "\"nexo-g0-ordering\".equals(action.resourcePattern().name())) {\n"
    "                NexoVisibilityRecorder.auth(aclCacheSnapshot, requestContext.correlationId());\n"
    "            }")
p.write_text(s)

p = Path("metadata/src/main/java/org/apache/kafka/image/loader/MetadataLoader.java")
s = p.read_text()
s = s.replace(
    "import org.apache.kafka.server.common.ApiMessageAndVersion;",
    "import org.apache.kafka.server.common.ApiMessageAndVersion;\n"
    "import org.apache.kafka.server.common.NexoVisibilityRecorder;",
    1)
replace_once(
    p,
    "    private void maybePublishMetadata(MetadataDelta delta, MetadataImage image, LoaderManifest manifest) {",
    "    private void maybePublishMetadata(MetadataDelta delta, MetadataImage image, LoaderManifest manifest) {\n"
    "        NexoVisibilityRecorder.init();")
shutdown = """            for (Iterator<MetadataPublisher> iter = publishers.values().iterator();
                 iter.hasNext(); ) {
                closePublisher(iter.next());
                iter.remove();
            }
"""
replace_once(p, shutdown, shutdown + "            NexoVisibilityRecorder.flush();\n")
p.write_text(s)

p = Path("core/src/main/scala/kafka/network/SocketServer.scala")
s = p.read_text()
class_pos = s.index("private[kafka] class Processor(")
run_marker = """  override def run(): Unit = {
    try {
"""
run_pos = s.index(run_marker, class_pos)
s = s[:run_pos] + s[run_pos:].replace(
    run_marker,
    """  override def run(): Unit = {
    org.apache.kafka.server.common.NexoVisibilityRecorder.init()
    try {
""", 1)
fin = """    } finally {
      debug(s"Closing selector - processor $id")
      Utils.swallow(this.logger.underlying, Level.ERROR, () => closeAll())
    }
"""
replace_once(
    p,
    fin,
    """    } finally {
      org.apache.kafka.server.common.NexoVisibilityRecorder.flush()
      debug(s"Closing selector - processor $id")
      Utils.swallow(this.logger.underlying, Level.ERROR, () => closeAll())
    }
""")
p.write_text(s)
print("INJECTION_OK")
