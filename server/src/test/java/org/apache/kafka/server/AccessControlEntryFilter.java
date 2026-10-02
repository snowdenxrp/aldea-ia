package org.apache.kafka.server;

/**
 * Workflow-local name adapter for the existing witness source.
 */
final class AccessControlEntryFilter {
    static final org.apache.kafka.common.acl.AccessControlEntryFilter ANY =
        org.apache.kafka.common.acl.AccessControlEntryFilter.ANY;

    private AccessControlEntryFilter() {}
}
