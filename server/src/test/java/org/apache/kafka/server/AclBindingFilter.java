package org.apache.kafka.server;

import org.apache.kafka.common.acl.AccessControlEntryFilter;
import org.apache.kafka.common.resource.ResourcePatternFilter;

/**
 * Workflow-local adapter so the existing witness source remains unchanged.
 * No Kafka production source is modified.
 */
final class AclBindingFilter extends org.apache.kafka.common.acl.AclBindingFilter {
    AclBindingFilter(ResourcePatternFilter patternFilter, AccessControlEntryFilter entryFilter) {
        super(patternFilter, entryFilter);
    }
}
