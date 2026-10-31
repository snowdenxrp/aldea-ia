import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';
import * as realFs from 'node:fs/promises';
import { createNexoContinuityStore } from '../../src/nexo/core/continuity-store.mjs';

function snapshot(missionId, stepId) {
  return {
    schema: 'NEXO_OPERATIONAL_CONTINUITY',
    schemaVersion: 1,
    missions: [{ missionId, steps: [{ id: stepId, action: 'noop', dependsOn: [] }] }],
    attempts: [], doNotRepeat: [], executions: [], effectJournal: []
  };
}
function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}
class Gate {
  constructor() {
    this.opened = false;
    this.promise = new Promise((resolve) => { this.resolve = resolve; });
  }
  open() { if (!this.opened) { this.opened = true; this.resolve(); } }
  async wait() { if (!this.opened) await this.promise; }
}
const settle = (promise) => promise.then(
  (value) => ({ status: 'fulfilled', value }),
  (reason) => ({ status: 'rejected', reason })
);
function normalizePath(value) {
  if (typeof value === 'string') return path.resolve(value);
  if (value instanceof URL) return path.resolve(value.pathname);
  return value;
}
function bytes(value) {
  if (value == null) return new Uint8Array();
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === 'string') return new TextEncoder().encode(value);
  if (typeof value === 'object') return new TextEncoder().encode(JSON.stringify(value));
  return new TextEncoder().encode(String(value));
}
function sameBytes(a, b) {
  return Boolean(a && b) && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
}
async function readOrNull(filePath) {
  try { return await realFs.readFile(filePath); } catch { return null; }
}
function equalSnapshots(a, b) {
  try { assert.deepStrictEqual(a, b); return true; } catch { return false; }
}
async function currentIfLoaded(store) {
  const result = await settle(store.loadCurrent());
  return result.status === 'fulfilled' && result.value?.status === 'loaded'
    ? { ok: true, value: result.value }
    : { ok: false, result };
}
function classify(result, label) {
  if (result.status === 'rejected') return { label, outcome: 'rejected', reason: result.reason };
  const value = result.value;
  const status = value?.status;
  return {
    label,
    outcome: ['committed', 'conflict', 'failed', 'unknown'].includes(status) ? status : 'invalid',
    value
  };
}
function instrumentFs(hooks, observed) {
  const fsModule = { constants: fsConstants };
  for (const name of Object.getOwnPropertyNames(realFs)) {
    const original = realFs[name];
    if (typeof original !== 'function') { fsModule[name] = original; continue; }
    fsModule[name] = async (...args) => {
      const p0 = normalizePath(args[0]);
      const p1 = normalizePath(args[1]);
      observed.calls.push({ name, path: p0, to: p1 });
      if (name === 'access' || name === 'writeFile' || name === 'rename') {
        const isAccess = name === 'access';
        const isWrite = name === 'writeFile';
        const info = isAccess ? { path: p0, args }
          : isWrite ? { path: p0, data: args[1], options: args[2], args }
            : { from: p0, to: p1, args };
        const hook = hooks[name];
        if (isWrite) observed.writes.push(info);
        if (name === 'rename') observed.renames.push(info);
        if (hook?.before) await hook.before(info);
        if (hook?.shouldHold?.(info)) {
          await hook.onHold?.(info);
          if (hook.gate) await hook.gate.wait();
        }
        try {
          const result = await original.apply(realFs, args);
          if (isAccess) observed.accessResults.push({ path: p0, status: 'success' });
          if (isWrite) observed.writeFileResults.push({ path: p0, status: 'success' });
          if (name === 'rename') observed.renameResults.push({ from: p0, to: p1, status: 'success' });
          return result;
        } catch (error) {
          if (isAccess) observed.accessResults.push({ path: p0, status: 'error', error });
          if (isWrite) observed.writeFileResults.push({ path: p0, status: 'error', error });
          if (name === 'rename') observed.renameResults.push({ from: p0, to: p1, status: 'error', error });
          throw error;
        }
      }
      return original.apply(realFs, args);
    };
  }
  fsModule.promises = fsModule;
  return fsModule;
}
async function makeEnv(t, configureHooks = () => ({})) {
  const root = await realFs.mkdtemp(path.join(tmpdir(), 'ncs-fb04-qwen-'));
  const filePath = path.join(root, 'continuity.snapshot');
  const tempPath = filePath + '.tmp';
  const observed = {
    calls: [], writes: [], renames: [],
    accessResults: [], writeFileResults: [], renameResults: []
  };
  const fsModule = instrumentFs(configureHooks({ root, filePath, tempPath }), observed);
  for (const method of ['access', 'writeFile', 'rename', 'mkdir', 'opendir', 'rm',
    'rmdir', 'unlink', 'stat', 'lstat', 'readFile']) {
    assert.equal(typeof fsModule[method], 'function', 'fsModule no expone ' + method + '().');
  }
  // lockWaitMs es duración. Sin lockDeadline, el store crea el deadline monotónico.
  const store = createNexoContinuityStore({ filePath, fsModule, lockWaitMs: 20_000 });
  assert.equal(typeof store.loadCurrent, 'function');
  assert.equal(typeof store.initialize, 'function');
  assert.equal(typeof store.commitIfCurrent, 'function');
  t.after(async () => { await realFs.rm(root, { recursive: true, force: true }).catch(() => {}); });
  return { root, filePath, tempPath, store, observed };
}

test('FB-04 Qwen publication adversarial', { concurrency: 1, timeout: 60_000 }, async (t) => {
  await t.test('Carrera access -> rename con escritor externo', async (t) => {
    const counters = { accessFilePath: 0, tempWrite: 0 };
    const tempWrites = [];
    const gate = new Gate();
    const renameSeen = deferred();
    let heldEvidence = null;
    const env = await makeEnv(t, ({ filePath, tempPath }) => ({
      access: { before: ({ path: p }) => { if (p === filePath) counters.accessFilePath++; } },
      writeFile: { before: ({ path: p, data }) => {
        if (p === tempPath) { counters.tempWrite++; tempWrites.push(data); }
      } },
      rename: {
        shouldHold: ({ from, to }) => from === tempPath && to === filePath,
        onHold: (info) => {
          heldEvidence = { call: info, accessFilePath: counters.accessFilePath, tempWrite: counters.tempWrite };
          renameSeen.resolve(info);
        },
        gate
      }
    }));
    const storeSnapshot = snapshot('fb04-race-store', 'step-store');
    const externalContent = JSON.stringify(snapshot('fb04-external-writer', 'step-external'));
    const initPromise = settle(env.store.initialize(storeSnapshot));
    try {
      const reached = await Promise.race([
        initPromise.then(() => 'done'),
        renameSeen.promise.then(() => 'rename')
      ]);
      if (reached !== 'rename') {
        assert.fail('UNKNOWN: initialize() terminó sin alcanzar rename(tempPath,filePath). counters=' +
          JSON.stringify(counters));
      }
      assert.ok(heldEvidence, 'UNKNOWN: rename observado sin evidencia retenida.');
      assert.ok(heldEvidence.accessFilePath > 0, 'UNKNOWN: access(filePath) no observado.');
      assert.ok(heldEvidence.tempWrite > 0, 'UNKNOWN: writeFile(tempPath) no observado.');
      assert.equal(heldEvidence.call.from, env.tempPath);
      assert.equal(heldEvidence.call.to, env.filePath);
      await realFs.writeFile(env.filePath, externalContent, 'utf8');
    } finally {
      gate.open();
    }
    const init = await initPromise;
    const initStatus = init.status === 'fulfilled'
      ? (init.value?.status ?? 'fulfilled-without-status')
      : 'rejected:' + (init.reason?.message ?? String(init.reason));
    const finalBytes = await readOrNull(env.filePath);
    const current = await currentIfLoaded(env.store);
    const rename = env.observed.renameResults
      .filter((r) => r.from === env.tempPath && r.to === env.filePath).at(-1);
    t.diagnostic('initialize(): ' + initStatus);
    t.diagnostic('rename(): ' + (rename?.status ?? 'not-observed'));
    if (!finalBytes) assert.fail('UNKNOWN: no existe archivo final después de la carrera.');
    const finalIsExternal = sameBytes(finalBytes, bytes(externalContent));
    const tempData = tempWrites.at(-1);
    const finalIsTemp = tempData !== undefined && sameBytes(finalBytes, bytes(tempData));
    const currentIsStore = current.ok && equalSnapshots(current.value.snapshot, storeSnapshot);
    if (rename?.status === 'success' && !finalIsExternal && (finalIsTemp || currentIsStore)) {
      assert.fail('VULNERABILITY_REPRODUCED: rename() sobrescribió el archivo externo creado después de access(filePath).');
    }
    if (rename?.status === 'error' && finalIsExternal) {
      return t.skip('INCONCLUSIVE: rename falló y el archivo externo sobrevivió; esto no demuestra por sí solo no-replace.');
    }
    assert.fail('UNKNOWN: no se demostró protección ni vulnerabilidad concluyente. initialize=' + initStatus +
      ', rename=' + (rename?.status ?? 'not-observed') + ', finalIsExternal=' + finalIsExternal +
      ', finalIsTemp=' + finalIsTemp + ', currentIsStore=' + currentIsStore);
  });

  await t.test('Symlink en filePath.tmp para redirigir writeFile', async (t) => {
    let victimPath = '';
    let symlinkCreated = false;
    let symlinkError = null;
    const env = await makeEnv(t, (paths) => {
      victimPath = paths.filePath + '.victim';
      return { writeFile: { before: async ({ path: p }) => {
        if (p !== paths.tempPath) return;
        try {
          await realFs.rm(paths.tempPath, { force: true });
          await realFs.symlink(victimPath, paths.tempPath);
          symlinkCreated = true;
        } catch (error) { symlinkError = error; }
      } } };
    });
    const victimOriginal = JSON.stringify(snapshot('fb04-victim-original', 'step-victim'));
    const candidate = snapshot('fb04-symlink-attack', 'step-attack');
    await realFs.writeFile(victimPath, victimOriginal, 'utf8');
    const init = await settle(env.store.initialize(candidate));
    const attempts = env.observed.writeFileResults.filter((r) => r.path === env.tempPath);
    const lastAttempt = attempts.at(-1);
    if (!symlinkCreated) {
      return t.skip('INCONCLUSIVE: no se pudo crear symlink en filePath.tmp: ' +
        (symlinkError?.message ?? 'desconocido'));
    }
    if (!lastAttempt) return t.skip('INCONCLUSIVE: writeFile(temp) no se ejecutó; initialize=' + init.status);
    const victimFinal = await readOrNull(victimPath);
    if (!victimFinal) assert.fail('UNKNOWN: no se pudo leer la víctima después del intento.');
    const victimIsOriginal = sameBytes(victimFinal, bytes(victimOriginal));
    const tempData = env.observed.writes.filter((w) => w.path === env.tempPath).at(-1)?.data;
    const tempBytes = tempData === undefined ? null : bytes(tempData);
    const victimIsAttack = sameBytes(victimFinal, bytes(JSON.stringify(candidate))) ||
      Boolean(tempBytes && sameBytes(victimFinal, tempBytes));
    let destinationIsSymlink = false;
    let destinationLink = null;
    try {
      const stat = await realFs.lstat(env.filePath);
      destinationIsSymlink = stat.isSymbolicLink();
      if (destinationIsSymlink) destinationLink = await realFs.readlink(env.filePath);
    } catch { /* destino ausente si no hubo publicación */ }
    t.diagnostic('writeFile(temp): ' + lastAttempt.status);
    t.diagnostic('victimOriginal=' + victimIsOriginal + ', victimAttack=' + victimIsAttack +
      ', destinationIsSymlink=' + destinationIsSymlink + ', destinationLink=' + (destinationLink ?? 'n/a'));
    if (lastAttempt.status === 'error') {
      if (!victimIsOriginal) assert.fail('UNKNOWN: writeFile falló pero la víctima cambió; causalidad no demostrada.');
      return t.skip('INCONCLUSIVE: writeFile(temp) falló; no demuestra protección.');
    }
    if (victimIsAttack || destinationIsSymlink) {
      assert.fail('VULNERABILITY_REPRODUCED: el symlink redirigió la escritura a la víctima o terminó publicado en el destino.');
    }
    const renameSucceeded = env.observed.renameResults.some((r) =>
      r.from === env.tempPath && r.to === env.filePath && r.status === 'success');
    const finalBytes = await readOrNull(env.filePath);
    const current = await currentIfLoaded(env.store);
    const initializeCommitted = init.status === 'fulfilled' && init.value?.status === 'committed';
    const finalIsStore = current.ok && equalSnapshots(current.value.snapshot, candidate);
    if (victimIsOriginal && renameSucceeded && finalBytes && initializeCommitted && finalIsStore) {
      t.diagnostic('PROPERTY_VERIFIED: víctima intacta y destino final no es symlink.');
      return;
    }
    assert.fail('UNKNOWN: protección completa no demostrada. initializeCommitted=' + initializeCommitted +
      ', renameSucceeded=' + renameSucceeded + ', finalExists=' + Boolean(finalBytes) +
      ', finalIsStore=' + finalIsStore);
  });

  await t.test('Regresión cooperativa de commitIfCurrent concurrente', async (t) => {
    t.diagnostic('NOTE: concurrencia cooperativa; no cubre escritores externos ni simultaneidad adversarial determinista.');
    const env = await makeEnv(t);
    const initial = await settle(env.store.initialize(snapshot('fb04-initial', 'step-initial')));
    if (initial.status !== 'fulfilled' || initial.value?.status !== 'committed') {
      assert.fail('UNKNOWN: initialize inicial no confirmó committed.');
    }
    const loaded = await currentIfLoaded(env.store);
    if (!loaded.ok) assert.fail('UNKNOWN: loadCurrent inicial no devolvió loaded.');
    const expectedRevision = loaded.value.storeRevision;
    assert.notEqual(expectedRevision, undefined, 'UNKNOWN: falta storeRevision.');
    const writeBaseline = env.observed.writeFileResults.length;
    const renameBaseline = env.observed.renameResults.length;
    const candidateA = snapshot('fb04-candidate-a', 'step-a');
    const candidateB = snapshot('fb04-candidate-b', 'step-b');
    const [settledA, settledB] = await Promise.all([
      settle(env.store.commitIfCurrent(expectedRevision, candidateA)),
      settle(env.store.commitIfCurrent(expectedRevision, candidateB))
    ]);
    const resultA = classify(settledA, 'A');
    const resultB = classify(settledB, 'B');
    t.diagnostic('commitIfCurrent A: ' + resultA.outcome);
    t.diagnostic('commitIfCurrent B: ' + resultB.outcome);
    const committed = [resultA, resultB].filter((r) => r.outcome === 'committed');
    const conflicts = [resultA, resultB].filter((r) => r.outcome === 'conflict');
    if (committed.length !== 1 || conflicts.length !== 1) {
      assert.fail('UNKNOWN: se esperaba un committed y un conflict; A=' + resultA.outcome + ', B=' + resultB.outcome);
    }
    const writes = env.observed.writeFileResults.slice(writeBaseline)
      .filter((r) => r.path === env.tempPath && r.status === 'success');
    const renames = env.observed.renameResults.slice(renameBaseline)
      .filter((r) => r.from === env.tempPath && r.to === env.filePath && r.status === 'success');
    if (writes.length < 1 || renames.length < 1) {
      assert.fail('UNKNOWN: committed sin writeFile(temp) y rename(temp,dest) exitosos observados.');
    }
    const after = await currentIfLoaded(env.store);
    if (!after.ok) assert.fail('UNKNOWN: loadCurrent final no devolvió loaded.');
    assert.equal(after.value.storeRevision, expectedRevision + 1,
      'UNKNOWN: la revisión final no avanzó exactamente una unidad.');
    const winner = committed[0];
    const winningSnapshot = winner.label === 'A' ? candidateA : candidateB;
    const losingSnapshot = winner.label === 'A' ? candidateB : candidateA;
    if (equalSnapshots(after.value.snapshot, winningSnapshot)) {
      t.diagnostic('PROPERTY_VERIFIED: un único committed y revisión +1 (concurrencia cooperativa).');
      return;
    }
    if (equalSnapshots(after.value.snapshot, losingSnapshot)) {
      assert.fail('INCONSISTENT: el commit reportado como ganador no coincide con el snapshot final.');
    }
    assert.fail('UNKNOWN: el snapshot final no coincide con el candidato ganador.');
  });
});
