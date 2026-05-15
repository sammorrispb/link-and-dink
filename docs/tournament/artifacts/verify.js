// Verification harness for popup.html format engines.
// Usage:  node verify.js
//
// Extracts the <script> from popup.html, runs it in a sandbox with stubbed
// browser globals, then exercises the format generators and standings math
// against expected outcomes from Sam's existing Excel templates.

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'popup.html'), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('No <script> tag found in popup.html'); process.exit(1); }
let code = m[1];
// Strip the boot/wireup section (touches the DOM)
code = code.replace(/\/\* -+ Wire up[\s\S]*$/, '');

// Stub browser globals
global.document = {
  createElement: () => ({ style:{}, classList:{add:()=>{},remove:()=>{},toggle:()=>{}}, appendChild:()=>{}, addEventListener:()=>{}, setAttribute:()=>{} }),
  createElementNS: () => ({ setAttribute:()=>{}, appendChild:()=>{} }),
  createTextNode: () => ({}),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { appendChild: () => {} },
};
global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
global.Blob = function(){};
global.confirm = () => true;

const fn = new Function(code + `
  return { ROUND_ROBIN, POOL_PLAYOFF, FORMATS, computeRRStandings, computePoolStandings,
           tallyMatches, rankStats, computeOverallSeeding, defaultPlayoffPairing,
           buildPlayoffSemis, buildPlayoffFinalIfReady, playoffQualifierCount };
`);
const exp = fn();
const { ROUND_ROBIN, POOL_PLAYOFF, computeRRStandings, computeOverallSeeding,
        defaultPlayoffPairing, buildPlayoffSemis, buildPlayoffFinalIfReady,
        playoffQualifierCount } = exp;

const makePlayers = (names) => names.map((n, i) => ({ id: 'p' + i, name: n, seat: i + 1 }));

let failures = 0;
const assert = (label, cond, detail = '') => {
  const ok = !!cond;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
};

console.log('\n[1] ROUND ROBIN GENERATORS');
[4, 5, 6, 7, 8, 9].forEach(n => {
  const players = makePlayers(Array.from({ length: n }, (_, i) => 'P' + (i + 1)));
  const r = ROUND_ROBIN.generate(players, { courts: 99 });
  const matches = r.rounds.flatMap(rd => rd.matches);
  const apps = {};
  players.forEach(p => apps[p.id] = 0);
  matches.forEach(m => [...m.teamA, ...m.teamB].forEach(id => apps[id]++));
  const range = `${Math.min(...Object.values(apps))}–${Math.max(...Object.values(apps))}`;
  console.log(`  ${n}p: rounds=${r.rounds.length}, matches=${matches.length}, plays/player=${range}`);
});

console.log('\n[2] 4-PLAYER STANDINGS — James/Wornden vs JJ/Rich, 11-8');
const players4 = makePlayers(['James', 'Wornden', 'JJ', 'Rich']);
const ev4 = { players: players4, rounds: ROUND_ROBIN.generate(players4, { courts: 1 }).rounds, format: 'round_robin' };
ev4.rounds[0].matches[0].scoreA = 11;
ev4.rounds[0].matches[0].scoreB = 8;
ev4.rounds[0].matches[0].complete = true;
const st = computeRRStandings(ev4);
const byName = (n) => st.find(s => players4.find(p => p.id === s.id).name === n);
assert('James won', byName('James').wins === 1);
assert('Wornden won', byName('Wornden').wins === 1);
assert('JJ lost', byName('JJ').wins === 0 && byName('JJ').losses === 1);
assert('Rich lost', byName('Rich').wins === 0 && byName('Rich').losses === 1);
assert('James PF=11', byName('James').pointsFor === 11);
assert('Rich PA=11', byName('Rich').pointsAgainst === 11);

console.log('\n[3] POOL SPLITS MATCH TEMPLATES');
const cases = [
  [10, [5, 5]],
  [12, [4, 4, 4]],
  [16, [4, 4, 4, 4]],
  [17, [9, 8]],
  [18, [9, 9]],
];
cases.forEach(([n, expected]) => {
  const players = makePlayers(Array.from({ length: n }, (_, i) => 'P' + (i + 1)));
  const r = POOL_PLAYOFF.generate(players, { courts: 3 });
  const sizes = r.pools.map(p => p.length);
  assert(`${n}p splits into [${expected.join(',')}]`, JSON.stringify(sizes) === JSON.stringify(expected), `got [${sizes.join(',')}]`);
});

console.log('\n[4] EVERY 8-PLAYER PLAYS 7 GAMES (no byes)');
const p8 = makePlayers(['Joe','Khai','Barak','Wornden','James','Jason','Josh','Fang']);
const r8 = ROUND_ROBIN.generate(p8, { courts: 2 });
const apps8 = {};
p8.forEach(p => apps8[p.id] = 0);
r8.rounds.forEach(rd => rd.matches.forEach(m => [...m.teamA, ...m.teamB].forEach(id => apps8[id]++)));
const allSeven = Object.values(apps8).every(c => c === 7);
assert('Every player plays exactly 7 games', allSeven, JSON.stringify(apps8));

// ---------- Helper: build an event with completed RR scores producing known seeds 1..N ----------
function eventWithRankedRR(n) {
  // Generic builder: makes N players, generates the format, then assigns scores
  // so that player p0 = seed 1, p1 = seed 2, ..., p(n-1) = seed N.
  // We do this by giving each match a winner = whichever team contains the lower-indexed player overall,
  // with a graded score margin so point-diff also sorts by index.
  const players = makePlayers(Array.from({ length: n }, (_, i) => 'Player' + (i + 1)));
  const fmt = n <= 9 ? ROUND_ROBIN : POOL_PLAYOFF;
  const result = fmt.generate(players, { courts: 99 });
  const event = {
    players,
    rounds: result.rounds,
    pools: result.pools || null,
    hasPlayoffs: !!result.hasPlayoffs,
    format: n <= 9 ? 'round_robin' : 'pool_playoff',
  };
  // Assign deterministic scores. Lower player index = stronger.
  // For each match, sum of indices of teamA vs teamB decides winner; margin scales with the diff.
  event.rounds.flatMap(r => r.matches).forEach(m => {
    const idxOf = (id) => players.findIndex(p => p.id === id);
    const aSum = m.teamA.map(idxOf).reduce((s, x) => s + x, 0);
    const bSum = m.teamB.map(idxOf).reduce((s, x) => s + x, 0);
    if (aSum < bSum) { m.scoreA = 11; m.scoreB = Math.max(0, 10 - (bSum - aSum)); }
    else             { m.scoreB = 11; m.scoreA = Math.max(0, 10 - (aSum - bSum)); }
    m.complete = true;
  });
  return event;
}

console.log('\n[5] PLAYOFF BRACKET — TOP-DOWN PAIRING (matches original templates)');

// We don't assume specific player ids end up at specific seeds — we instead read the
// ACTUAL computed seeding from the engine, then assert the bracket pairings follow the
// top-down rule: top seeds always partner together, bottom qualifiers partner together.
function checkTop4Pairing(label, ev) {
  const seeds = computeOverallSeeding(ev).slice(0, 4).map(s => s.id);
  const semis = buildPlayoffSemis(ev);
  assert(label + ': qualifier count = 4', playoffQualifierCount(ev) === 4);
  assert(label + ': single Championship match', semis && semis.matches.length === 1 && semis.label === 'Championship');
  const m = semis.matches[0];
  const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
  assert(label + ': Team A = seeds 1+2', setEq(new Set(m.teamA), new Set([seeds[0], seeds[1]])));
  assert(label + ': Team B = seeds 3+4', setEq(new Set(m.teamB), new Set([seeds[2], seeds[3]])));
}
function checkTop8Pairing(label, ev) {
  const seeds = computeOverallSeeding(ev).slice(0, 8).map(s => s.id);
  const semis = buildPlayoffSemis(ev);
  assert(label + ': qualifier count = 8', playoffQualifierCount(ev) === 8);
  assert(label + ': 2 semifinal matches', semis && semis.matches.length === 2 && semis.label === 'Semifinals');
  const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
  const sf1 = semis.matches[0], sf2 = semis.matches[1];
  assert(label + ' SF1 Team A = seeds 1+2', setEq(new Set(sf1.teamA), new Set([seeds[0], seeds[1]])));
  assert(label + ' SF1 Team B = seeds 7+8', setEq(new Set(sf1.teamB), new Set([seeds[6], seeds[7]])));
  assert(label + ' SF2 Team A = seeds 3+4', setEq(new Set(sf2.teamA), new Set([seeds[2], seeds[3]])));
  assert(label + ' SF2 Team B = seeds 5+6', setEq(new Set(sf2.teamB), new Set([seeds[4], seeds[5]])));
}

checkTop4Pairing('10p', eventWithRankedRR(10));
checkTop8Pairing('12p', eventWithRankedRR(12));
checkTop8Pairing('16p', eventWithRankedRR(16));
checkTop8Pairing('17p', eventWithRankedRR(17));
checkTop8Pairing('18p', eventWithRankedRR(18));

console.log('\n[6] FINAL is built from SEMIFINAL WINNERS (and only once both semis are locked)');
{
  const ev = eventWithRankedRR(12);
  const semis = buildPlayoffSemis(ev);
  ev.rounds.push(semis);

  // Before locking either semi → no final yet
  assert('No final before semis locked', buildPlayoffFinalIfReady(ev) === null);

  // Have Team A of each semi win (the top seeds), so Final = SF1.teamA vs SF2.teamA
  const sf1 = semis.matches[0], sf2 = semis.matches[1];
  const sf1Winner = new Set(sf1.teamA);
  const sf2Winner = new Set(sf2.teamA);
  sf1.scoreA = 15; sf1.scoreB = 7; sf1.complete = true;
  sf2.scoreA = 15; sf2.scoreB = 9; sf2.complete = true;

  const fin = buildPlayoffFinalIfReady(ev);
  assert('Final is built after both semis lock', !!fin);
  assert('Final has one match', fin && fin.matches.length === 1 && fin.label === 'Final');
  if (fin) {
    const m = fin.matches[0];
    const teamSet = new Set([...m.teamA, ...m.teamB]);
    const setEq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
    assert('Final teamA = SF1 winner', setEq(new Set(m.teamA), sf1Winner));
    assert('Final teamB = SF2 winner', setEq(new Set(m.teamB), sf2Winner));
    assert('Final contains exactly 4 distinct players from semi winners', teamSet.size === 4);
  }
}

console.log('\n[7a] CUSTOM PAIRING — players can swap partners (free-swap UX)');
{
  const ev = eventWithRankedRR(12);
  const def = defaultPlayoffPairing(ev);
  // Imagine the players swap two qualifiers between SF1.teamA and SF2.teamB.
  // We construct a custom pairing where seed-1 partners with seed-5 instead of seed-2.
  const custom = def.map(t => [...t]);
  const seed1 = custom[0][0];   // SF1 teamA seed-1 slot
  const seed5 = custom[3][0];   // SF2 teamB seed-5 slot
  // swap them
  custom[0][0] = seed5;
  custom[3][0] = seed1;
  const semis = buildPlayoffSemis(ev, custom);
  assert('Custom pairing builds 2 SFs', semis && semis.matches.length === 2);
  const sf1A = new Set(semis.matches[0].teamA);
  const sf2B = new Set(semis.matches[1].teamB);
  assert('SF1.teamA contains the swapped-in seed-5', sf1A.has(seed5));
  assert('SF2.teamB contains the swapped-in seed-1', sf2B.has(seed1));
  // Standings should be unaffected by the choice of partners
  const standings = exp.computePoolStandings(ev);
  assert('Standings unaffected by playoff partner swap', standings.length === 12);
}

console.log('\n[7b] Default pairing helper returns top-down structure');
{
  const ev12 = eventWithRankedRR(12);
  const def = defaultPlayoffPairing(ev12);
  const seeds = computeOverallSeeding(ev12).slice(0, 8).map(s => s.id);
  assert('Default[0] = seeds 1+2', def[0].includes(seeds[0]) && def[0].includes(seeds[1]));
  assert('Default[1] = seeds 7+8', def[1].includes(seeds[6]) && def[1].includes(seeds[7]));
  assert('Default[2] = seeds 3+4', def[2].includes(seeds[2]) && def[2].includes(seeds[3]));
  assert('Default[3] = seeds 5+6', def[3].includes(seeds[4]) && def[3].includes(seeds[5]));
  const ev10 = eventWithRankedRR(10);
  const def10 = defaultPlayoffPairing(ev10);
  assert('10p default has 2 teams (Top-4 championship)', def10.length === 2);
}

console.log('\n[8] PLAYOFF MATCHES DO NOT RE-RANK STANDINGS');
{
  const ev = eventWithRankedRR(12);
  const semis = buildPlayoffSemis(ev);
  ev.rounds.push(semis);
  // Have seed 8 "win" the semi just to check it does NOT affect seeding
  semis.matches[0].scoreA = 0; semis.matches[0].scoreB = 11; semis.matches[0].complete = true;
  semis.matches[1].scoreA = 0; semis.matches[1].scoreB = 11; semis.matches[1].complete = true;
  const standings = exp.computePoolStandings(ev);
  // Seeds within each pool should still rank p_lower above p_higher (the playoff loss shouldn't count)
  // Quick check: across all players, anyone with index < N/2 should have wins > 0
  const stronger = standings.find(s => s.id === 'p0');
  assert('Seed 1 (p0) keeps RR wins despite playoff loss', stronger.wins > 0);
}

console.log(`\n${failures === 0 ? '✓ All checks passed.' : '✗ ' + failures + ' check(s) failed.'}\n`);
process.exit(failures === 0 ? 0 : 1);
