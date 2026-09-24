import unittest
from src.nexo.dependency_closure_evaluator import evaluate_claim

def base_claim():
    return {
        "claim_id":"stop-proof",
        "protected_function":"emergency-stop enforcement",
        "assurance_level":"I4",
        "components":[
            {"component_id":"gate","role":"enforcement","dependency_refs":["host-a","root-x"],"trust_roots":["root-x"]},
            {"component_id":"verifier","role":"verification","dependency_refs":["host-b","root-x"],"trust_roots":["root-x"]},
        ],
        "dependencies":[
            {"dependency_id":"host-a","domain":"host","state":"KNOWN","failure_domain":"fd-a"},
            {"dependency_id":"host-b","domain":"host","state":"KNOWN","failure_domain":"fd-b"},
            {"dependency_id":"root-x","domain":"trust_root","state":"KNOWN","failure_domain":"root"},
        ],
        "failure_domains":[],
        "trust_roots":["root-x"],
        "authority_domains":[],
        "policy_version":"p1",
        "invariant_version":"i1",
        "dependency_graph_version":"g1",
        "unknown_dependency_policy":"BLOCK",
        "review":{"review_epoch":1,"expires_at":"2099-01-01T00:00:00Z"},
    }

class EvaluatorTests(unittest.TestCase):
    def test_transitive_closure(self):
        c=base_claim()
        c["dependencies"].append({"dependency_id":"runtime","domain":"runtime","state":"KNOWN","failure_domain":"fd-r"})
        c["dependencies"][0]["depends_on"]=["runtime"]
        r=evaluate_claim(c)
        self.assertEqual(r["dependency_closure"]["gate"],["host-a","root-x","runtime"])
        self.assertEqual(r["dependency_closure"]["verifier"],["host-b","root-x"])

    def test_shared_trust_root_is_correlated(self):
        r=evaluate_claim(base_claim())
        self.assertFalse(r["admissible"])
        self.assertEqual(r["maximum_admissible_assurance"],"I2")
        self.assertTrue(any(x["code"]=="CORRELATED_COMPONENTS" for x in r["findings"]))
        self.assertFalse(r["authority_granted"])
        self.assertFalse(r["effects_executed"])

    def test_unknown_dependency_blocks_high_assurance(self):
        c=base_claim()
        c["dependencies"][0]["state"]="UNKNOWN"
        r=evaluate_claim(c)
        self.assertEqual(r["maximum_admissible_assurance"],"I1")
        self.assertFalse(r["admissible"])
        self.assertIn("host-a",r["unknown_dependencies"])

    def test_compromise_collapses_ceiling(self):
        c=base_claim()
        c["dependencies"][1]["state"]="COMPROMISED"
        r=evaluate_claim(c)
        self.assertEqual(r["maximum_admissible_assurance"],"I0")
        self.assertFalse(r["admissible"])

    def test_shared_failure_domain_is_correlated_through_transitive_closure(self):
        c=base_claim()
        c["dependencies"].append({
            "dependency_id":"shared-host",
            "domain":"host",
            "state":"KNOWN",
            "failure_domain":"shared-fd",
        })
        c["dependencies"][0]["depends_on"]=["shared-host"]
        c["dependencies"][1]["depends_on"]=["shared-host"]
        r=evaluate_claim(c)
        self.assertTrue(any(
            set(x["components"]) == {"gate","verifier"} and "failure_domain" in x["reasons"]
            for x in r["correlated_component_pairs"]
        ))
        self.assertEqual(r["maximum_admissible_assurance"],"I2")

    def test_unknown_transitive_dependency_blocks_high_assurance(self):
        c=base_claim()
        c["dependencies"].append({
            "dependency_id":"shared-runtime",
            "domain":"runtime",
            "state":"UNKNOWN",
            "failure_domain":"fd-runtime",
        })
        c["dependencies"][0]["depends_on"]=["shared-runtime"]
        r=evaluate_claim(c)
        self.assertIn("shared-runtime",r["unknown_dependencies"])
        self.assertEqual(r["maximum_admissible_assurance"],"I1")
        self.assertFalse(r["admissible"])

    def test_unrelated_compromised_dependency_does_not_poison_claim_scope(self):
        c=base_claim()
        c["dependencies"].append({
            "dependency_id":"unrelated",
            "domain":"storage",
            "state":"COMPROMISED",
            "failure_domain":"unrelated-fd",
        })
        r=evaluate_claim(c)
        self.assertNotIn("unrelated", r["compromised_dependencies"])
        self.assertEqual(r["maximum_admissible_assurance"],"I2")
        self.assertFalse(r["admissible"])

    def test_missing_dependency_is_blocking(self):
        c=base_claim()
        c["components"][0]["dependency_refs"].append("missing")
        r=evaluate_claim(c)
        self.assertFalse(r["admissible"])
        self.assertEqual(r["maximum_admissible_assurance"],"I0")
        self.assertTrue(any(x["code"]=="MISSING_DEPENDENCY" for x in r["findings"]))

    def test_fingerprint_is_deterministic(self):
        a=evaluate_claim(base_claim())
        b=evaluate_claim(base_claim())
        self.assertEqual(a["graph_fingerprint"],b["graph_fingerprint"])


    def test_canonical_component_graph_fixture(self):
        import json
        from pathlib import Path
        fixture = json.loads(Path("docs/nexo/fixtures/PG-009_COMPONENT_DEPENDENCY_GRAPH_V1.json").read_text())
        claim = base_claim()
        claim["components"] = fixture["components"]
        claim["dependencies"] = fixture["dependencies"]
        claim["assurance_level"] = fixture["expected"]["requested_assurance"]
        result = evaluate_claim(claim)
        self.assertEqual(result["dependency_closure"]["safety_gate"], fixture["expected"]["safety_gate_closure"])
        self.assertEqual(result["dependency_closure"]["recovery_verifier"], fixture["expected"]["recovery_verifier_closure"])
        self.assertEqual(result["dependency_closure"]["executor"], fixture["expected"]["executor_closure"])
        trust_pairs = {
            tuple(x["components"])
            for x in result["correlated_component_pairs"]
            if "trust_root" in x["reasons"]
        }
        self.assertIn(tuple(fixture["expected"]["shared_trust_root_components"]), trust_pairs)

    def test_schema_missing_field_is_blocking(self):
        c=base_claim()
        del c["policy_version"]
        r=evaluate_claim(c)
        self.assertEqual(r["maximum_admissible_assurance"],"I0")
        self.assertTrue(any(x["code"]=="SCHEMA_REQUIRED_FIELD" for x in r["findings"]))

if __name__=="__main__":
    unittest.main()
