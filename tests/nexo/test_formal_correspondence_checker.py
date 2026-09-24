import unittest
from src.nexo.formal_correspondence_checker import check_correspondence

class CorrespondenceTests(unittest.TestCase):
    def claim(self):
        return {
            "claim_id": "x",
            "assurance_level": "I4",
            "components": [{"component_id": "c1", "dependency_refs": ["d1"]}],
            "dependencies": [
                {"dependency_id": "d1", "domain": "host", "state": "KNOWN"},
                {"dependency_id": "d2", "domain": "trust_root", "state": "COMPROMISED"},
            ],
        }

    def mapping(self):
        return {
            "version": "1",
            "domain_mapping": {"host": "Domains", "trust_root": "Domains"},
            "state_mapping": {"KNOWN": "dependencyState", "COMPROMISED": "compromisedDependencies"},
            "assurance_mapping": {"I4": "assuranceState"},
            "component_mapping": {"c1": {"dependency_refs": "ComponentDependencyRefs"}},
            "dependency_relation": {"d1": "DependencyDependsOn", "d2": "DependencyDependsOn"},
            "failure_domain_mapping": {},
            "trust_root_mapping": {},
            "coverage": {
                "component_to_domain": "PARTIAL",
                "transitive_closure": "PARTIAL",
                "graph_fingerprint": "UNMAPPED",
                "finding_taxonomy": "UNMAPPED",
            },
        }

    def test_detects_declared_partial_coverage(self):
        r = check_correspondence(self.claim(), self.mapping())
        self.assertTrue(r["consistent"])
        self.assertFalse(r["formally_equivalent"])
        self.assertTrue(any(f["code"] == "FORMAL_COVERAGE_GAP" for f in r["findings"]))

    def test_detects_stale_coverage_even_when_recursive_closure_exists(self):
        m = self.mapping()
        m["coverage"]["transitive_closure"] = "MAPPED"
        r = check_correspondence(self.claim(), m)
        self.assertTrue(any(
            f["code"] == "FORMAL_COVERAGE_GAP" and "graph_fingerprint" in f["message"]
            for f in r["findings"]
        ))

    def test_canonical_fixture_has_no_relation_mapping_gaps(self):
        import json
        from pathlib import Path
        fixture = json.loads(Path("docs/nexo/fixtures/PG-009_COMPONENT_DEPENDENCY_GRAPH_V1.json").read_text())
        mapping = json.loads(Path("docs/nexo/fixtures/PG-009_FORMAL_CORRESPONDENCE_V2.json").read_text())
        claim = {
            "claim_id": fixture["fixture_id"],
            "assurance_level": fixture["expected"]["requested_assurance"],
            "components": fixture["components"],
            "dependencies": fixture["dependencies"],
        }
        result = check_correspondence(claim, mapping)
        self.assertTrue(result["consistent"])
        self.assertFalse(any(
            f["code"] in {
                "FORMAL_COMPONENT_UNMAPPED",
                "FORMAL_COMPONENT_RELATION_UNMAPPED",
                "FORMAL_DEPENDENCY_RELATION_UNMAPPED",
                "FORMAL_FAILURE_DOMAIN_UNMAPPED",
            }
            for f in result["findings"]
        ))

    def test_detects_unmapped_domain(self):
        m = self.mapping()
        m["domain_mapping"].pop("host")
        r = check_correspondence(self.claim(), m)
        self.assertFalse(r["consistent"])
        self.assertTrue(any(f["code"] == "FORMAL_DOMAIN_UNMAPPED" for f in r["findings"]))

if __name__ == "__main__":
    unittest.main()
