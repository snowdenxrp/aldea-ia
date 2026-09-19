import test from "node:test";
import assert from "node:assert/strict";
import { createRandom } from "../src/random.js";
import { chooseOption } from "../src/decision.js";

const context = {
  needs: { hunger: 50, thirst: 50, energy: 70, social: 70 },
  knowledge: [],
  relationships: [],
  memories: [],
  recentAction: null
};

const options = [
  { name: "rest", baseValue: 0, effects: { energy: 1.2 } },
  { name: "explore_area", baseValue: 0.28, explorationValue: 0.7, novelty: 0.8, distance: 5 }
];

test("same seed produces the same random sequence", () => {
  const a = createRandom("lumina-test-1");
  const b = createRandom("lumina-test-1");
  assert.deepEqual(
    Array.from({ length: 20 }, () => a()),
    Array.from({ length: 20 }, () => b())
  );
});

test("different seeds produce different sequences", () => {
  const a = createRandom("lumina-test-1");
  const b = createRandom("lumina-test-2");
  assert.notDeepEqual(
    Array.from({ length: 10 }, () => a()),
    Array.from({ length: 10 }, () => b())
  );
});

test("decision choice can use an injected seeded random source", () => {
  const a = createRandom(12345);
  const b = createRandom(12345);
  const choicesA = Array.from({ length: 20 }, () => chooseOption(context, options, 1, a)?.name);
  const choicesB = Array.from({ length: 20 }, () => chooseOption(context, options, 1, b)?.name);
  assert.deepEqual(choicesA, choicesB);
});
