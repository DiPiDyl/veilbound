import { runAllAITests } from './engine/aiCombatTests';

console.log('====================================================');
console.log('VEILBOUND 2 — AUTOMATED COMBAT & AI TEST SUITE');
console.log('====================================================');

const { results, aiVsAi, allPassed } = runAllAITests();

results.forEach(res => {
  const mark = res.passed ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${mark} ${res.testName}`);
  console.log(`    -> ${res.message}`);
});

console.log('\n----------------------------------------------------');
console.log('AI VS AI AUTO-DUEL SIMULATION REPORT');
console.log('----------------------------------------------------');
console.log(`Winner: ${aiVsAi.winner.toUpperCase()}`);
console.log(`Turns Elapsed: ${aiVsAi.turnsTaken}`);
console.log(`Cards Played: ${aiVsAi.totalCardsPlayed}`);
console.log(`Damage Dealt: ${aiVsAi.totalDamageDealt}`);
console.log(`Player Final Health: ${aiVsAi.finalPlayerHealth}`);
console.log(`Opponent Final Health: ${aiVsAi.finalOpponentHealth}`);
console.log(`Simulation Complete: ${aiVsAi.success ? 'YES' : 'NO'}`);
console.log('====================================================');
console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✓' : 'SOME TESTS FAILED ✗'}`);
console.log('====================================================');
