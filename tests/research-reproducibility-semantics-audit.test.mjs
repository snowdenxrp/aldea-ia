import assert from "node:assert/strict";
import { researchSummary } from "../src/research.js";

const world={research:{topics:[
  {id:"supported",status:"reproduced",contributors:["a","b"],independentReplications:2,experimentCount:4,confidence:.8,supportedCount:4,contradictedCount:0},
  {id:"single",status:"tested",contributors:["a","b"],independentReplications:0,experimentCount:2,confidence:.5,supportedCount:1,contradictedCount:1}
],experiments:[],evidence:[],history:[]},resources:{}};
const summary=researchSummary(world);
assert.equal(summary.reproducedTopics,1,"solo los temas marcados como reproducidos deben contarse como reproducibles");
console.log(JSON.stringify({audit:"research-reproducibility-semantics",reproducedTopics:summary.reproducedTopics,verdict:"PASS"},null,2));
