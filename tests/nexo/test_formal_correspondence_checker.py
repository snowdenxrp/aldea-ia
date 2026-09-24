import unittest
from src.nexo.formal_correspondence_checker import check_correspondence

class CorrespondenceTests(unittest.TestCase):
    def claim(self):
        return {
            "claim_id": "x",
            "assurance_level": "I4",
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

    def test_detects_unmapped_domain(self):
        m = self.mapping()
        m["domain_mapping"].pop("host")
        r = check_correspondence(self.claim(), m)
        self.assertFalse(r["consistent"])
        self.assertTrue(any(f["code"] == "FORMAL_DOMAIN_UNMAPPED" for f in r["findings"]))

if __name__ == "__main__":
    unittest.main()
