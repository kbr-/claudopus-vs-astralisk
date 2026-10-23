# Balance methodology

The battle is a stochastic, alternating-turn, zero-sum Markov game. A* has no
single deterministic goal path here: an opponent chooses replies and damage is
random. The shared planner uses Monte Carlo tree search (UCT) with sampled chance
outcomes, adversarial selection, and tactical rollouts through the end of the
fight. The deployed opponent uses 192 simulations per decision, eight explicit
search plies, and up to 100 rollout plies. Both self-play sides use the same
planner and budgets. Search operates on copies, never the real battle state.

## Validated settings and results

Works on My Machine: 27 → 32 power. One More Patch: 35 → 39 power, with recoil
6 → 7. Claudopus, healing, PP, confidence, guards, and HP are unchanged.

| Policy / run | Games | Claudopus score | Astralisk score |
| --- | ---: | ---: | ---: |
| MCTS, 192 simulations, calibration | 6,000 | 49.75% | 50.25% |
| MCTS, 384 simulations, deeper check | 1,200 | 48.63% | 51.37% |
| MCTS, 192 simulations, frozen holdout | 6,000 | 50.65% | 49.35% |
| Previous weighted CPU policy | 10,000 | 48.50% | 51.50% |
| One-step tactical policy | 10,000 | 59.06% | 40.94% |
| Uniform useful random moves | 10,000 | 38.94% | 61.06% |

The holdout contains 3,024 Claudopus wins, 2,946 Astralisk wins, and 30 draws.
Claudopus’s approximate 95% sampling interval is 49.38–51.92%. This meets the
49–51% point-estimate calibration target and is consistent with an even matchup;
it does not establish exact equality. The doubled-budget check also includes
50% in its sampling interval.

Policies matter: the results are not 50–50 under random or one-step play. The
calibration prioritizes the stronger adversarial planner, which is now used by
the live opponent. In the holdout, Claudopus won 90.47% when moving first and
Astralisk won 89.53% when moving first. Player-first initiative is intentionally
retained; character balance is measured with both opening positions equally
represented. Human-versus-CPU win rates are not claimed to be 50%.

## Benchmark contract

- Equal numbers of games with Claudopus and Astralisk moving first.
- Independent seeded random streams for decisions and combat outcomes.
- Draws score one half to each side; raw wins and draws are retained.
- A 49–51% score is the calibration target, not a claim about every human strategy.
- Check different rollout policies and double the search budget, then freeze the
  parameters and run a new seed range for the final holdout.
- The live game retains player-first initiative. This is a substantial player
  advantage; an aggregate 50% character score does not imply a 50% human win rate.
- JSON results include opening-position counts and approximate 95% sampling
  intervals. Finite self-play is evidence about these policies, not an optimal-play
  proof. No win probability is forced by hidden difficulty adjustments.

## Reproduce

No dependencies beyond Node.js. From the repository root:

```sh
node tools/balance.cjs '{"games":10000,"policies":["tactical","cpu","random"]}'
node tools/balance-parallel.cjs '{"policy":"mcts","games":6000,"budget":192,"seed":900001,"output":"balance-results/holdout.json"}'
```

The parallel runner uses six workers by default and requires a game count divisible
by twice the worker count. `cpu` is the old weighted-random policy retained as a
benchmark; the live opponent uses `planner.js`. `tactical` uses deterministic
one-step heuristics. `random` samples useful legal moves uniformly. All strategies
execute the production engine, not a reimplementation of the fight.

Original settings can be reproduced with `tuning` set to
`{"machine":27,"patch":35,"recoil":6,"caveat":21,"review":34}`. The original
2,000-game weighted-CPU run scored 72.95% for Claudopus; 2,000 tactical games scored
93.65%. The original 200-game MCTS screen scored 96.75% (193 wins, 6 losses,
1 draw). These explain the initial imbalance; the small MCTS baseline is not a
high-precision estimate.

Parameter experiments and final validation are retained under `balance-results/`.
