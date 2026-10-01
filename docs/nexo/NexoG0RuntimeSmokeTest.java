package org.apache.kafka.server;

import org.apache.kafka.common.test.KafkaClusterTestKit;
import org.apache.kafka.common.test.TestKitNodes;
import org.apache.kafka.common.security.auth.SecurityProtocol;
import org.junit.jupiter.api.Test;

public class NexoG0RuntimeSmokeTest {
    @Test
    public void startsTestKit() throws Exception {
        TestKitNodes nodes = new TestKitNodes.Builder()
            .setNumBrokerNodes(1)
            .setNumControllerNodes(1)
            .setBrokerSecurityProtocol(SecurityProtocol.SASL_PLAINTEXT)
            .build();
        try (KafkaClusterTestKit cluster = new KafkaClusterTestKit.Builder(nodes).build()) {
            cluster.format();
            cluster.startup();
            cluster.waitForReadyBrokers();
        }
    }
}
