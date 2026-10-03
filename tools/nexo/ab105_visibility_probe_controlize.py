from pathlib import Path

p = Path("server-common/src/main/java/org/apache/kafka/server/common/NexoVisibilityRecorder.java")
s = p.read_text()

sentinel = "private static final Object CONTROL_SENTINEL = new Object();"
if sentinel not in s:
    s = s.replace(
        "private static final ThreadLocal<State> STATE = new ThreadLocal<>();",
        "private static final ThreadLocal<State> STATE = new ThreadLocal<>();\n    " + sentinel,
        1,
    )

s = s.replace(
    "if (s != null) s.record(1, cache, 0);",
    "if (s != null) s.record(1, CONTROL_SENTINEL, 0);",
    1,
)
s = s.replace(
    "if (s != null) s.record(2, cache, correlationId);",
    "if (s != null) s.record(2, CONTROL_SENTINEL, correlationId);",
    1,
)

p.write_text(s)
print("CONTROL_SOURCE_READY")
