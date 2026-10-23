# Character balance and first-move advantage

The current game keeps the player-first flow, but the second mover starts with a
**52% opening shield**. It reduces the first successful damaging hit, then expires.
A miss does not consume it. It does not stack with normal guards: the stronger
protection applies. The intro and status panel show it explicitly.

Claudopus has 181 HP and Astralisk has 180 HP. Works on My Machine has 32 power;
One More Patch has 40 power and 7 recoil. Other move values are unchanged.

## Fresh-seed validation

Both sides use the same adversarial Monte Carlo tree search. Opening positions
are split equally; draws score one half to each side. “Initiative gap” means the
first mover's score minus the second mover's score, in percentage points.

| Run | Games | First mover | Second mover | Initiative gap | Claudopus | Astralisk |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Frozen production settings, 192 simulations | 6,000 | 53.81% | 46.19% | +7.62 pp | 50.24% | 49.76% |
| Double-budget check, 384 simulations | 1,200 | 57.04% | 42.96% | +14.08 pp | 53.46% | 46.54% |
| Otherwise-identical no-shield control, 192 simulations | 1,200 | 89.21% | 10.79% | +78.42 pp | 47.96% | 52.04% |

The final 6,000 games contain 2,992 Claudopus wins, 2,963 Astralisk wins, and
45 draws. First movers won 3,206 games. Approximate 95% sampling intervals:
Claudopus score 48.98–51.51%; initiative gap +5.09–10.14 pp. The deeper check's
initiative interval is approximately +8.48–19.69 pp. These intervals describe
Monte Carlo sampling uncertainty, not uncertainty over all possible strategies.

The deployed opponent uses 192 simulations. Finite self-play supports a much
smaller initiative edge and a near-even character matchup at that budget; it is
not an optimal-play proof or a guarantee of equal human win rates. The deeper
check illustrates the remaining strategy dependence. No outcome or difficulty is
secretly forced according to the character selected.

The previous release's holdout, before opening protection, scored 90.25% for the
first mover and 9.75% for the second (+80.5 pp). Its raw results remain in
`balance-results/holdout.json`; its code is pinned by commit `ebc5e25`. The new
otherwise-identical control separately isolates the opening shield's effect.

## Search and tuning

This is a stochastic, alternating-turn, zero-sum Markov game. A* has no single
deterministic goal path: an opponent chooses replies and damage is random. MCTS
uses UCT, samples chance outcomes, and selects adversarial replies. It expands up
to eight explicit search plies and uses tactical rollouts of up to 100 more plies.
Search uses copies of the real state. Rollout choices mix 12% uniform exploration
with softmax sampling (temperature 4) among heuristic move values, avoiding a sharp
all-or-nothing preference between near-tied attacks. The heuristic accounts for
protection already present when valuing a guard.

Tuning jointly checked initiative and character balance, including temporary
shield strengths that overcorrected in favor of moving second. A 50% shield
initially gave a +12.67 pp initiative gap at 192 simulations, but +22.75 pp in the
doubled-budget test. The selected 52% setting reduced that sensitivity. After
freezing it, the final holdout used a new seed range with no further adjustments.
Raw screens, failed candidates, controls, and validation data remain under
`balance-results/`. Files prefixed `opening-shield-` and early `initiative-0.*`
use the previous greedy rollout policy; `smooth-*` and later initiative files use
the revised rollout sampling. Older character-only calibration files describe the
previous release, rather than the current opening-shield rules.

## Reproduce

Node.js only; no dependencies. All strategies execute the production engine, not
a reimplementation. Independent seeded streams drive decisions and combat.

```sh
node tests/engine.test.cjs
node tests/planner.test.cjs
node tests/opening-shield.test.cjs
node tools/balance-parallel.cjs '{"policy":"mcts","games":6000,"budget":192,"seed":2200001}'
node tools/balance-parallel.cjs '{"policy":"mcts","games":1200,"budget":384,"seed":2100001}'
node tools/balance-parallel.cjs '{"policy":"mcts","games":1200,"budget":192,"seed":1900001,"tuning":{"openingShield":0}}'
```

The parallel runner uses six workers and requires a game count divisible by twice
the worker count. `cpu` in the benchmark is the original weighted policy;
`tactical` is a one-step greedy policy and `random` samples useful moves uniformly.
The live opponent uses `planner.js`.
