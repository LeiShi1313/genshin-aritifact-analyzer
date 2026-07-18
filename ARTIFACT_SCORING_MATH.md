# Artifact Scoring: Math and Experiments

This is the durable evidence notebook for Build Match, Potential, and Rarity. It records mechanics, assumptions, candidate formulas, experiments, rejected approaches, and calibrated defaults. `CONTEXT.md` remains the short domain glossary; this file explains why the algorithms and defaults were chosen.

## Evidence rules

- Separate confirmed game mechanics from empirical assumptions and product defaults.
- Prefer exact enumeration or dynamic programming when the state space is small. Monte Carlo is used to compare population behavior, not as the production algorithm.
- Convert observed displayed totals through the canonical roll-value lookup. Do not divide rounded display values by an average or exact roll value.
- Keep realized utility, future outcome distributions, stage-relative prospect rarity, and raw acquisition odds conceptually distinct even when they share one probability engine.
- Record enough inputs that every experiment can be reproduced.

## Unified public Score calibration (2026-07-14)

**Status: selected for the simplified public UI.** This section supersedes the earlier public-UI recommendations to lead with Build Match, Prospect Rarity, P10/P90, and one global 55% selection gate. The exact Match, Potential PMF, and population engines remain useful foundations; this section changes which result is promoted to users and how the defaults are interpreted.

### One absolute ruler, two stage labels

For artifact state `a_L` at level `L` and enabled Build `b`, define:

```text
CurrentScore_b(a_L) = 100 * BuildMatch_b(a_L)

Potential_b(a_L) = E[CurrentScore_b(a_20) | observed state a_L]
```

For an unfinished artifact, select one Build by maximum expected final score, using current Match and then stable Build order as deterministic tie-breakers:

```text
b* = argmax_b Potential_b(a_L)
```

The public primary number is:

```text
PublicScore(a_L) = Potential_b*(a_L),  when L < 20
PublicScore(a_20) = CurrentScore_b*(a_20), when L = 20
```

This is `max_b E[Score_b]`, not `E[max_b Score_b]`: the displayed forecast and any secondary current value are bound to the same Build. At +20 the conditional distribution has one outcome, so Potential equals current Score and the two definitions meet exactly.

The labels are deliberately different even though the ruler is the same:

- below +20: **Potential 78** means the exact mechanics-weighted average final Score is 78 if this state is repeatedly upgraded;
- at +20: **Score 84** means the artifact currently realizes 84 points of the selected Build's perfect outcome;
- neither number is a probability or percentile, so the UI does not append `%`.

The selected Build name must remain visible. A best-of-many score is meaningful only as, for example, “84 for Neuvillette,” not as a Build-independent property of the artifact.

### Exact 100 and integer presentation

Only the exact preferred-main, maximum-useful-roll outcome is allowed to display 100. The public integer conversion is:

```text
toPublicScore(x) =
  100,                                  if x = 1 exactly
  min(99, floor(100 * x + machine epsilon)), otherwise
```

where `x` is Match or expected final Match on `[0, 1]`. The exact equality is intentional: 100 is reserved for the mechanically perfect outcome, while every non-perfect floating-point value is capped at 99. The tiny machine epsilon only prevents multiplication noise at ordinary integer boundaries; it is far too small to promote a near-perfect value. Flooring makes the integer a truthful lower bound: displayed 75 means the raw value is at least 75.0, and an integer threshold can compare the displayed integer without disagreeing with the card. Ordinary rounding was rejected because it makes 74.6 display as 75 and can make a non-perfect 99.6 look perfect unless several additional special cases are added.

### Main-stat eligibility remains explicit

A wrong-main artifact can score at most `9 / 17 = 52.9412`, while a preferred-main artifact with no useful substats scores `8 / 17 = 47.0588`. These ranges overlap, so no score threshold can perfectly stand in for main-stat compatibility.

The score therefore stays soft, but recommendation and automatic selection first require `isPreferredMain`. A wrong-main card may still show its lower score for comparison, but it receives an explicit **Main stat mismatch** state and never a “worth upgrading/keeping” badge merely by crossing a numeric threshold.

### Public quality bands and action defaults

The stable bands describe absolute Build fit, not rarity:

| Public score | Quality label |
|---:|---|
| 0--59 | Weak |
| 60--69 | Ordinary |
| 70--79 | Good |
| 80--89 | Excellent |
| 90--99 | Exceptional |
| 100 | Perfect |

Action wording is stage-specific even though the score formula is not:

| State | Rule after preferred-main gate | Default UI action |
|---|---:|---|
| Below +20 | Potential 70--74 | Consider upgrading / test roll |
| Below +20 | Potential >= 75 | Worth upgrading |
| Below +20 | Potential >= 80 | High-priority upgrade |
| +20 | Score 70--79 | Good/usable; keep depends on replacement needs |
| +20 | Score >= 80 | Worth keeping |
| Any | Score >= 90 | Exceptional |

The 75 upgrade and 80 finished-retention defaults each select approximately the top 20% of their respective unselected normal-drop baselines when all 104 shipped presets are enabled. They are simple recommendation defaults, not destructive deletion rules and not claims about a user's resin budget. Potential is a calibrated endpoint expectation; it intentionally does not mix in upgrade cost, risk tolerance, set scarcity, or replacement value.

The 70--74 unfinished gray zone protects the discovery use case. A classic two-useful-line starter often has Potential around 68--70, while three useful lines usually clear 75. The tool should keep the gray zone visible and sortable even when only the >=75 group gets the strong recommendation badge.

### Experiment A: exact scale consistency

The exact normal-source population was generated for:

- all 104 valid shipped preset profiles;
- all five positions;
- all six milestones `0, 4, 8, 12, 16, 20`;
- normal five-star main-stat/type/tier/upgrade probabilities;
- the explicit `P(four-line start) = 0.20` assumption.

This evaluated 3,120 Build/position/milestone inputs, collapsing to 3,000 unique population calculations after identical profile signatures were cached. Each Build/position pair was weighted equally. The all-main population includes wrong-main outcomes and is therefore a scale invariant check, not the action-threshold training set.

| Milestone | Exact population mean Potential/Score |
|---:|---:|
| +0 | 38.793 |
| +4 | 38.793 |
| +8 | 38.793 |
| +12 | 38.793 |
| +16 | 38.793 |
| +20 | 38.793 |

The equality is the law of total expectation, measured here by exact enumeration rather than Monte Carlo drift. It proves that Potential and finished Score are calibrated on the same absolute ruler. As upgrades reveal information, the distribution spreads and eventually becomes realized Score, but its unconditional mean does not jump merely because the level changed.

All 491 valid +20 artifacts in the GOOD scan independently satisfied `Potential - current Score = 0` at numeric precision.

### Experiment B: unselected best-of-104 baseline

Threshold defaults used a joint Monte Carlo baseline because the card chooses the best enabled Build and the maximum of 104 marginal distributions cannot be reconstructed by multiplying or independently combining their CDFs.

Reproduction inputs:

- PRNG: `mulberry32`, primary seed `0x85c0ffee`;
- 5,000 artifacts per `(milestone, position)` cell;
- 6 milestones x 5 positions = 150,000 artifacts total, 25,000 per milestone;
- secondary stability run: seed `0x12345678`, 2,000 per cell, 60,000 total;
- main stat sampled from the repository's position weights;
- four-line start sampled with probability 0.20; otherwise three-line start;
- substat types sampled without replacement using weights 150/100/75 after excluding main stat;
- initial, reveal, and upgrade tiers sampled uniformly from canonical points `{7, 8, 9, 10}`;
- every upgrade target sampled uniformly among four lines;
- each artifact evaluated against all 104 validated presets, taking maximum expected final Match below +20 and maximum current Match at +20;
- five positions mixed equally, with raw inclusive thresholds before integer display.

| Milestone | Median | 80th percentile | 90th percentile | P(score >= 75) | P(score >= 80) |
|---:|---:|---:|---:|---:|---:|
| +0 | 69.1 | 75.1 | 78.1 | 20.4% | 4.9% |
| +4 | 70.8 | 77.2 | 80.3 | 30.6% | 10.8% |
| +8 | 71.3 | 77.9 | 81.2 | 33.1% | 13.1% |
| +12 | 71.7 | 78.5 | 81.6 | 35.0% | 14.5% |
| +16 | 71.9 | 79.0 | 82.2 | 36.4% | 16.5% |
| +20 | 72.2 | 79.6 | 83.0 | 38.2% | 18.8% |

Thus +0 Potential 75 is approximately an unselected top-20% starter, while +20 Score 80 is approximately an unselected top-19% finished result. The stability run produced 80th percentiles 75.30 and 79.58 at +0/+20, within 0.20 and 0.02 points of the primary run. At `n = 25,000` and `p ~= 0.20`, the 95% binomial sampling uncertainty of the tail share is approximately +/-0.5 percentage points.

A single action threshold was rejected: 75 has the intended selectivity for starting Potential but accepts 38.2% of random +20 outcomes; 80 has the intended finished selectivity but accepts only 4.9% of +0 starters.

### Experiment C: real GOOD inventory sanity check

`/tmp/good.json` is a private real inventory scan used only for aggregate validation. No artifact data is copied into the repository.

| Input classification | Count |
|---|---:|
| All artifacts | 2,307 |
| Exactly scorable five-star artifacts | 2,276 |
| Unsupported four-star artifacts | 15 |
| Invalid five-star +20 artifacts with only three visible lines | 16 |
| Unfinished scorable artifacts | 1,785 |
| Finished scorable artifacts | 491 |

Eleven artifacts were at non-multiple-of-four levels. Scoring correctly maps them to the preceding enhancement milestone because no substat event happens between milestones; the calibration grouping made that normalization explicit without changing their score.

| Real retained inventory | P25 | Median | P75 | P90 | Maximum |
|---|---:|---:|---:|---:|---:|
| Unfinished Potential | 68.4 | 72.4 | 77.6 | 81.5 | 92.4 |
| +20 Score | 74.8 | 80.8 | 85.3 | 88.3 | 93.4 |

In this inventory, 39.0% of unfinished artifacts reach Potential 75 and 53.8% of finished artifacts reach Score 80. These rates are deliberately higher than the unselected baseline: upgraded artifacts are survivors, retained +0 artifacts are user-filtered, and discarded fodder is absent. The scan validates that the chosen bands occupy useful parts of a real inventory; its median must not be used to fit the defaults.

Lock and equip state were tested as possible automatic labels and rejected:

- +0 Potential predicting locked: AUC approximately 0.57;
- +20 Score predicting locked: AUC 0.565;
- +20 Score predicting equipped: AUC 0.557.

An AUC near 0.5 is close to random ordering. Lock/equip state also mixes set needs, rare mains, character occupancy, historical habits, and an unobserved population of already-destroyed artifacts.

### Experiment D: useful-line and start-class behavior

For +0 scan artifacts, a useful line is a distinct visible substat whose importance is positive in that artifact's same best-Expected Build after excluding the actual main-stat type.

| +0 start | Useful visible lines | Median Potential | P(Potential >= 75) | P(Potential >= 80) |
|---|---:|---:|---:|---:|
| Three-line | 2 | 69.5 | 0.0% | 0.0% |
| Three-line | 3 | 77.0 | 78.4% | 7.1% |
| Four-line | 2 | 69.5 | 5.8% | 0.0% |
| Four-line | 3 | 80.3 | 95.2% | 52.9% |
| Four-line | 4 | 87.9 | 100.0% | 100.0% |

Across all +0 artifacts, three-line Potential had median 70.9 and four-line Potential median 78.1. Potential already rewards the extra starting roll and extra upgrade opportunity. A separate start-class normalization would erase real value and was again rejected.

For each unfinished artifact, the exact conditional PMF was evaluated for the same best-Expected Build. In the retained scan, Potential buckets had these median finish chances:

| Potential bucket | Median P(final Score >= 75) | Median P(final Score >= 80) |
|---:|---:|---:|
| 70--74 | 34% | 11% |
| 75--79 | 67% | 35% |
| 80--84 | 90% | 65% |
| 85--89 | approximately 100% | approximately 100% |

These are mechanics-derived conditional probabilities, not outcomes fitted from the finished inventory. They support “consider” at 70, a strong upgrade recommendation at 75, and high priority at 80 without exposing probability tables in the normal UI.

### Pressure tests and rejected alternatives

#### Prospect percentile or a composite public score

The current Prospect population mixes wrong-main outcomes, rare-main acquisition, position, and Build-relative quality. On the GOOD scan its median best-Build Prospect percentile was approximately 97. There were 449 artifacts with absolute score below 70 but percentile at least 90, and Spearman correlation with absolute score was only 0.662.

This is not a monotonic rescaling of quality. It answers a different question and can inflate an ordinary artifact into an apparently elite public score. Percentile, rarity, acquisition odds, and Match therefore must not be averaged or multiplied into `PublicScore`.

The current exact population API also merges main-stat branches before returning its PMF. A future hidden recommendation layer based on relative scarcity must add an explicit concrete-main or preferred-main-conditioned population and must evaluate the joint maximum over the user's enabled Builds. It cannot reuse the existing all-main Prospect percentile as a keep rule.

#### Best-of-Build inflation

On the real inventory, the unified-score median rose from approximately 59 with one randomly enabled preset to 68 with five, 71 with twenty, and 74 with all 104. This is expected optionality, not a scoring bug, but it proves why the selected Build name and enabled-Build scope are part of the score's meaning.

#### Slot replacement pressure

The real scan's median scores differed materially by position:

| Position | +0 Potential median | +20 Score median |
|---|---:|---:|
| Flower | 76.0 | 83.1 |
| Plume | 76.2 | 84.9 |
| Sands | 68.6 | 77.6 |
| Goblet | 68.5 | 76.7 |
| Circlet | 68.4 | 76.7 |

An absolute score intentionally measures Build fit rather than replacement scarcity. The fixed 75/80 badges are useful simple defaults, but they must not drive automatic deletion: a 78 Goblet may be much harder to replace than an 82 Flower. If a later product version needs a fully automatic “worth keeping” policy, use a separate, hidden Build/position/stage/preferred-main population rule and show only its plain-language recommendation—not a second public number.

#### Same expectation, different upgrade decision

Two real states provided a concrete counterexample. A +0 artifact with Potential 75.00 had a 5.63-point final standard deviation and a 23.5% chance to reach 80. A +16 artifact with Potential 75.23 had a 2.14-point standard deviation and zero chance to reach 80, with only one event remaining. Potential is correctly calibrated in both cases, but one mean cannot also encode variance, remaining cost, and a user's target.

The normal UI can hide P10/P90 and still stay simple. It must merely avoid claiming that the recommendation badge is a complete economic optimizer.

### Simplified UI contract implied by calibration

The ordinary artifact card should reduce to:

```text
Unfinished:  Potential 78  | Worth upgrading | For [Build]
Finished:    Score 84      | Worth keeping   | For [Build]
```

- Show one primary integer, no percent sign.
- Below +20, bind Potential and all secondary context to the best-Expected Build.
- At +20, show only Score; Potential is identical and redundant.
- Keep current Match, P10/P90, finish chances, and Prospect percentile out of the default card. They may remain available in an explicitly advanced diagnostic view.
- Apply the explicit main-stat mismatch state before any action badge.
- Use Potential 75 and Score 80 as the strong default actions; keep 70--74 unfinished artifacts discoverable as “consider/test.”
- Treat set compatibility as a separate filter/highlight.
- Translate every label, tooltip, empty state, filter, and accessibility name through i18n.

## Set compatibility and off-piece rarity experiment (2026-07-14)

**Status: the mechanics-derived off-piece model is accepted as a recommendation input for a single four-piece requirement. Folding it into the public 0--100 Score is rejected.** Stat Score and Potential stay linear and set-independent; set compatibility changes the recommendation/combination role instead.

### Evidence boundary

This experiment deliberately did **not** read `/tmp/good.json`. No inventory statistic, preset frequency, lock state, or equipped state was used to fit a parameter.

The pressure-test matrix contained:

- all 104 valid shipped Build profiles, used as coverage for varied main-stat and substat requirements rather than as a training distribution;
- all five positions and Match targets 70, 75, 80, 85, and 90;
- 520 exact +20 score populations and 15,600 acquisition-rate records;
- four-line-start probabilities from 0% through 100%;
- a separate exhaustive cross-product of all 5 Sands, 12 Goblet, and 7 Circlet single-main-stat choices: 420 mechanically legal combinations.

The exact population engine enumerates main stats, three/four-line starts, weighted substat type selection, roll tiers, and upgrade targets. Monte Carlo was used only as an independent check of the closed-form last-arrival result.

### Single-four-piece acquisition model

For Build `b`, position `p`, and a common quality target `q`, let the inclusive exact-population tail be:

```text
R_b,p(q) = P(Match_b >= q | position p)
```

For ordinary farming of one target set from a two-set domain, the qualifying on-set acquisition rate per five-star drop is:

```text
lambda_b,p(q)
  = P(position p) * P(target set) * R_b,p(q)
  = (1 / 5) * (1 / 2) * R_b,p(q)
  = 0.1 * R_b,p(q)
```

At every tested target `q >= 70`, wrong-main outcomes are already absent from the tail because their mathematical ceiling is `9 / 17 = 52.94%`. The main-stat probability is therefore included automatically rather than added as a manual slot weight.

If `T_p` is the wait for the first qualifying on-set item in position `p`, Poisson splitting gives independent exponential waits:

```text
T_p ~ Exp(lambda_p)
```

For a four-piece set, the natural off-piece is the position that would otherwise finish last. Its prior probability is:

```text
Q_p(q) = P(T_p = max_j T_j)
```

with exact inclusion-exclusion form:

```text
Q_p(q) = sum over S subset of positions other than p:
           (-1)^|S| * lambda_p / (lambda_p + sum_{j in S} lambda_j)
```

The common position/set factors cancel from relative `Q`, so the four-piece position result does not depend on a player's inventory or on an arbitrary hand-authored Flower/Sands/Goblet weight. `1 / lambda_p` is useful as the expected number of five-star drops. It is not a primary card metric, but may appear in the set-role tooltip when its source assumptions are shown alongside it.

### Main result at Match 80

The following summaries are over the 104 coverage profiles with equal Build/position cells. Their averages and medians are validation statistics, not production constants:

| Position | Median accepted-main probability | Median P(Score >= 80 \| accepted main) | Median five-star drops for an on-set 80 | Mean `Q` | Share where position is hardest |
|---|---:|---:|---:|---:|---:|
| Flower | 100% | 2.95% | 339 | 0.43% | 0% |
| Plume | 100% | 3.05% | 328 | 0.37% | 0% |
| Sands | 26.66% | 1.73% | 2,243 | 16.88% | 7.69% |
| Goblet | 5.00% | 1.84% | 7,337 | 52.36% | 78.85% |
| Circlet | 20.00% | 1.46% | 3,781 | 29.96% | 13.46% |

Goblet plus Circlet account for 82.32% of the mechanics-derived off-piece probability; Flower plus Plume account for only 0.80%. This validates the broad Goblet/Circlet intuition, but not a hard-coded position rule.

At target 75, median `Q` values were Flower 0.23%, Plume 0.23%, Sands 12.11%, Goblet 56.69%, and Circlet 24.67%. Goblet was the highest-`Q` position for 80 Builds, Circlet for 18, Sands for 6, and Flower/Plume for none. At target 80 the counts were 82/14/8/0/0. Across targets 70 through 100, only 61 of 104 Builds (58.7%) kept the same highest-`Q` position, which is direct evidence against a fixed slot penalty.

### Threshold and four-line-start sensitivity

Mean `Q` by Match target with `P(four-line start) = 20%`:

| Match target | Flower | Plume | Sands | Goblet | Circlet | Goblet + Circlet |
|---:|---:|---:|---:|---:|---:|---:|
| 70 | 0.54% | 0.46% | 17.22% | 53.27% | 28.50% | 81.77% |
| 75 | 0.47% | 0.39% | 17.16% | 52.64% | 29.33% | 81.98% |
| 80 | 0.43% | 0.37% | 16.88% | 52.36% | 29.96% | 82.32% |
| 85 | 0.58% | 0.56% | 15.79% | 51.52% | 31.54% | 83.06% |
| 90 | 1.02% | 1.35% | 13.98% | 47.77% | 35.88% | 83.66% |

Changing the four-line-start prior from 0% to 100% moved any position's mean `Q` by at most about 0.59 percentage points at Match 80. Within the more plausible 10%--30% range, the largest movements were 0.12 points for Sands, 0.08 for Goblet, and 0.19 for Circlet. The off-piece ordering is robust to this uncertain prior.

Absolute acquisition cost is not robust to that prior. For Match 80, moving the prior from 10% to 30% changed the median Goblet cost from 8,455 to 6,481 five-star drops, Circlet from 4,325 to 3,352, and Sands from 2,527 to 2,007. Therefore any displayed farming-cost number would have to expose its source assumptions even though the simpler off-piece role is stable.

### Coverage beyond one example Build

The initial Furina screen was only a prototype smoke test. Production conclusions were checked across every Build and the full legal main-stat cross-product.

Representative exact Match-80 results demonstrate why the calculation must be Build-specific:

| Build shape | Flower | Plume | Sands | Goblet | Circlet | Highest-`Q` position |
|---|---:|---:|---:|---:|---:|---|
| Hu Tao-like | small | small | 4.47% | 53.49% | 41.88% | Goblet |
| Triple EM / Kazuha-like | small | small | 9.18% | 56.69% | 34.13% | Goblet |
| Raiden-like | small | small | 51.57% | 17.89% | 29.53% | Sands |
| Neuvillette-like, multiple mains | small | small | 36.22% | 37.22% | 23.16% | Goblet, narrowly |
| Bennett support-like | small | small | 55.72% | 26.33% | 17.86% | Sands |

Triple EM is a particularly useful pressure test. EM main-stat rates are approximately 10% on Sands, 2.5% on Goblet, and 4% on Circlet, so its mechanics-derived off-piece probabilities are about 9.2%, 56.7%, and 34.1% respectively. It is calculated from those fixed rates, not copied from Furina or a generic “Goblet/Circlet” prior.

The independent 420-combination, main-stat-only enumeration produced mean `Q` values Flower 0.54%, Plume 0.54%, Sands 17.58%, Goblet 53.14%, and Circlet 28.21%. Goblet plus Circlet remained 81.35%. Equal weighting here is only exhaustive coverage; it is not a claim about Build popularity and none of these means becomes a production weight.

### Rejected unified-score mappings

The candidate mapping attempted to convert a wrong-set artifact back onto the public score scale:

```text
r(q)     = P(Match >= q)
r_eff(q) = min(1, r(q) / Q_p(q))
setScore = inverseInclusiveTail(r_eff)
```

Its general direction looked attractive: a likely off-piece position receives less penalty. Exact support-point auditing found that it is not monotonic because `Q_p(q)` itself moves with `q`.

Concrete failures from an exact +20 population:

- Sands raw 70.6887 mapped to about 47.06, but the better raw 70.8178 mapped down to about 43.60.
- Flower raw 91.0934 mapped to about 54.47, but the better raw 91.1557 mapped down to about 52.35.

Thus a useful upgrade can lower the mapped result, better artifacts can sort below worse ones, and expected mapped Potential can violate first-order stochastic dominance. Discrete-CDF clamps also create large plateaus, and inversion below 52.94 can compare a preferred-main candidate against the wrong-main region of the population.

The aggregate presentation was also poor. A wrong-set raw 75 mapped at the median to approximately Flower 47, Plume 47, Sands 59, Goblet 72, Circlet 67; raw 80 mapped to 47/47/70/77/75. Mixing target-set and non-target-set outcomes approximately halved the share crossing the existing 75/80 action lines, so preserving selection volume would require lowering the public thresholds and admitting weaker on-set items.

A farming-cost percentile was also rejected. It largely uniformizes the population, can assign a high percentile to a rare but low-Match outcome, loses the linear meaning of 100, and answers rarity rather than Build fit.

### Selected product boundary

Keep the public ruler unchanged:

```text
Score     = 100 * Match
Potential = E[Score at +20 | observed state]
```

Consequences:

- 100 still means preferred main stat plus the maximum useful substat outcome.
- A useful upgrade can never reduce Score.
- The calibrated 75 Potential and 80 finished-Score defaults remain meaningful.
- Set rarity does not masquerade as better or worse substat quality.

Use set information in the recommendation/combination layer:

- an on-set artifact can be labelled `Set match` when its stats cross the normal action rule;
- an off-set artifact can be labelled `Off-piece candidate` or `Uses the off-piece slot`, based on its Build/position role;
- normal UI should not promote `Q`, tail probabilities, expected drops, or percentiles as competing card metrics; expected five-star drops may appear in the set-role tooltip with explicit assumptions;
- sorting should preserve the linear Score first within the same recommendation role and use the existing stable Build order for exact ties;
- the final five-position optimizer must enforce exactly one off-piece and maximize the same linear scores subject to the set constraint.

For a stable single-artifact recommendation, compute any role prior at the fixed action target for that stage (Potential 75 below +20, Score 80 at +20), not at the candidate's continuously changing score. This prevents a better roll from changing the threshold definition underneath itself. The exact role rule remains separate from the public number.

### Build-derived set eligibility

**Status: selected recommendation rule for a standard single four-piece plan; public Score/Potential remain unchanged.**

Let `X` be the existing public integer score for the reference acquisition population:

- for every unfinished artifact, use the new-drop `+0` Potential population and base `t = 75`;
- for a finished artifact, use the `+20` Score population and base `t = 80`.

The unfinished rule deliberately reuses the +0 acquisition baseline at levels +4 through +16. Recomputing the reference population after every enhancement event makes the rule move underneath the artifact: in the exact sensitivity run, the +0 to +4 integer cutoff changed by a median 1 point, P90 3 points, and as much as 5 points. Sixty of 492 comparable Build/position cells moved by more than two points. A fixed +0 baseline means an unfinished recommendation changes only because the artifact's own Potential changes.

For Build `b` and position `p`, calculate the joint base tail:

```text
A_p(t) = P(preferred main and X >= t | Build b, position p)
```

Use the five `A_p(t)` values to calculate the last-arrival off-piece probability `Q_p(t)`. The position's off-piece demand share is `Q_p`; its on-set demand share is `1 - Q_p`. Under the canonical ordinary-domain assumption that target-set and paired non-target-set supply are equal, the supply/demand balancing factor is:

```text
k_p = min(1, Q_p / (1 - Q_p))
```

The cap is an explicit product rule: even when one position is more likely than not to be the natural off-piece, set mismatch may remove a penalty but never lower the normal 75/80 stat-quality floor.

The wrong-set recommendation budget is:

```text
u_p = k_p * A_p(t)
```

Aggregate the reference population into complete public-integer buckets, then choose
`T_p >= t` with the calibrated under-budget rule:

1. Visit buckets from the highest score downward.
2. Include the next complete bucket only while the cumulative included probability remains `<= u_p`.
3. Set `T_p` to the lowest included bucket and accept `X >= T_p`.
4. If `u_p > 0` but the highest attainable bucket alone is larger than the budget, include that highest bucket as an explicit maximum-outcome guarantee.

The fourth step is deliberately the only allowed budget overshoot. Without it, one triple-EM +0 Flower case rejects even the theoretical maximum Potential 91 because that top tied bucket is already larger than its tiny wrong-set budget. Whole buckets ensure equal displayed scores always receive the same decision; the exception ensures the mechanically best attainable wrong-set artifact remains eligible. If `u_p = 0`, no wrong-set bucket is admitted. If any of the five `A_p(t)` values is zero, the last-arrival model for that Build and stage is unavailable and returns no wrong-set recommendation rather than inventing a fallback cutoff.

The action rule for one Build is therefore:

```text
wrong main                         -> Main-stat mismatch
set matches and public score >= t -> Recommended / set match
set mismatches and score >= T_p   -> Recommended / off-piece candidate
otherwise                          -> Not recommended for this Build
```

Choose the highest original Score/Potential among Builds that pass these eligibility rules. Do not compare `Q`, rarity, or “points above the set cutoff” between Builds.

#### Fixed-gate calibration

The exact experiment covered 104 Builds, five positions, all six milestones as sensitivity inputs, both direct-`Q` and odds gates, raw and public-integer cutoffs, and 12,480 monotonicity checks. There were zero recommendation reversals and every selected cutoff remained above the wrong-main ceiling 52.9.

Public integer odds cutoffs across the 104 coverage Builds:

| Stage and statistic | Flower | Plume | Sands | Goblet | Circlet |
|---|---:|---:|---:|---:|---:|
| Below +20, P10 | 83 | 84 | 77 | 75 | 76 |
| Below +20, median | 91 | 91 | 81 | 75 | 79 |
| Below +20, P90 | 92 | 92 | 84 | 78 | 83 |
| +20, P10 | 91 | 91 | 83 | 80 | 81 |
| +20, median | 93 | 93 | 86 | 80 | 83 |
| +20, P90 | 96 | 96 | 89 | 84 | 85 |

These summaries validate behavior; they are not hard-coded slot thresholds. Representative Build-derived cutoffs show the intended variation:

| Build shape | Below +20 Flower/Plume/Sands/Goblet/Circlet | +20 Flower/Plume/Sands/Goblet/Circlet |
|---|---:|---:|
| ATK Sands, elemental Goblet, double-Crit Circlet | 91 / 91 / 80 / 75 / 78 | 94 / 94 / 86 / 80 / 83 |
| Triple EM | 84 / 84 / 80 / 75 / 77 | 92 / 92 / 86 / 80 / 82 |
| ER Sands, elemental Goblet, double-Crit Circlet | 92 / 92 / 77 / 76 / 79 | 95 / 95 / 83 / 81 / 84 |
| Multiple accepted mains, Neuvillette-like | 83 / 90 / 77 / 77 / 79 | 89 / 92 / 82 / 82 / 84 |

Among artifacts already crossing the ordinary stat floor, the wrong-set gate retained these exact-population shares:

| Stage | Flower | Plume | Sands | Goblet | Circlet | Overall |
|---|---:|---:|---:|---:|---:|---:|
| +0 Potential >= 75 | 0.36% | 0.27% | 18.20% | 63.12% | 30.63% | 3.29% |
| +20 Score >= 80 | 0.20% | 0.20% | 15.00% | 57.26% | 34.87% | 3.95% |

The odds gate was selected over three alternatives:

- `k = Q` double-penalizes high-`Q` positions by an extra `1 - Q` factor and lacks a stable supply interpretation;
- accepting only the maximum-`Q` position rejects exceptional artifacts in every other slot;
- accepting every position with `Q >= 20%` introduces an arbitrary discontinuity and commonly allows about two positions.

This rule is mechanics- and Build-derived under a clearly named paired-domain source model, but it is not the unique universal set value. In general the factor also contains `c_on / c_off`; off-set supply from other domains, bosses, or the strongbox depends on player activity. Source-aware inventory optimization may supersede the canonical gate later.

#### Farming-rarity tooltip

For the fixed base recommendation line, the expected number of five-star drops is:

```text
D_p(t) = 1 / [P(position p) * P(target set) * A_p(t)]
       = 1 / [0.20 * 0.50 * A_p(t)]
       = 10 / A_p(t)
```

The set-role tooltip presents only one short line:

```text
On average, about 1 qualifying on-set artifact per N five-star drops;
expected, not guaranteed.
```

The UI rounds `N` to two significant digits. The notebook, rather than the tooltip, records the source assumptions:

- ordinary two-set domain, position 20%, target set 50%;
- the configured four-line-start probability, default 20%;
- main stat, substat types, roll tiers, and upgrade hits are included;
- the result is an expectation, not a guarantee.

Do not label `D` as 20-resin domain runs. Exact conversion needs the distribution of one-versus-two five-star rewards per claim; dividing by an average yield is only a rare-event approximation. Condensed Resin, strongbox conversion, 2+2 sources, and alternative farming plans require separate source models.

### 2+2 identifiability experiment

The closed-form `Q` above is validated for one four-piece requirement. A 2+2 requirement was separately tested with an exact continuous-time state model.

For target set classes A and B, a state is `(maskA, maskB)`, where each five-bit mask records positions for which at least one qualifying item of that class has arrived. A state absorbs when there is an assignment of two distinct A positions and two distinct B positions across four distinct slots. The fifth slot is the off-piece; if the first absorbing event permits several equally early off-piece choices, probability mass is divided equally among them. The complete state space has at most `2^5 * 2^5 = 1,024` states.

The experiment evaluated all 104 profiles, five quality targets, and nine effective A:B source-rate ratios from 0.01 through 100: 4,680 normalized DP cases.

With equal effective A/B rates at Match 80, the 2+2 and four-piece position results were almost identical:

- all 104 profiles selected the same highest-probability off-piece position;
- mean total-variation distance was 0.097 percentage points;
- mean Goblet probability moved from 52.36% to 52.32%;
- mean Circlet probability moved from 29.96% to 29.93%.

This is a useful baseline, but it is not a universal 2+2 answer. A:B effective rate depends on which domains or strongbox sources are used and how farming time is allocated. At a 0.01 A:B ratio, mean total-variation distance from the four-piece result rose to 23.1 percentage points: mean Goblet probability fell to 35.71% and Sands rose to 25.04%. In representative profiles, a Goblet role moved from 53.48% to 37.05%, and one Circlet role moved from 84.26% to 37.70%.

Therefore the exact 2+2 off-piece distribution is **not identifiable from artifact mechanics and the Build alone**. Equal-rate DP is a sensitivity baseline, not a production weight. A production 2+2 farming model would need explicit source availability and farming-allocation inputs; an inventory optimizer instead needs only the actual candidate sets and the hard “two of A plus two of B” constraint.

The repository's current Suit encoding also needs migration before set-aware scoring can rely on `count` arithmetically:

- 256 encoded Suit alternatives contain 188 single-combo four-piece shapes and 68 multi-combo shapes treated by current UI/domain helpers as 2+2;
- among those 68, 60 legacy records still encode counts as `4+4`, while only 8 say `2+2`;
- 55 Builds expose at least one such 2+2-style option;
- expanding equivalent two-piece effects makes 16 of 68 pairs overlap, and one record repeats the same set.

Multiple alternative set plans need explicit OR semantics. They must not silently reuse the single-four-piece completion formula, and the current `count` field cannot be the sole discriminator.

Reproduction artifacts for this experiment are disposable files under `/tmp` and are intentionally not product code. Durable conclusions and rejection reasons live here.

## Confirmed five-star artifact mechanics

A five-star artifact starts with three or four substat lines and has five enhancement events at displayed levels +4, +8, +12, +16, and +20.

- A four-line start receives five upgrade hits and finishes with nine total substat rolls: four initial rolls plus five upgrades.
- A three-line start reveals its fourth line at +4, then receives four upgrade hits and finishes with eight total substat rolls.

Sources:

- [Datamined artifact level configuration](https://github.com/DimbreathBot/AnimeGameData/blob/82e74382e7788e318ad41fca926739a752c0bed6/ExcelBinOutput/ReliquaryExcelConfigData.json)
- [Genshin Optimizer five-star constants](https://github.com/frzyc/genshin-optimizer/blob/0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2/libs/gi/consts/src/artifact.ts)

### Five-star substat roll tiers

| Stat | Tier 1 | Tier 2 | Tier 3 | Tier 4 / maximum |
|---|---:|---:|---:|---:|
| HP | 209.13 | 239.00 | 268.88 | 298.75 |
| ATK | 13.62 | 15.56 | 17.51 | 19.45 |
| DEF | 16.20 | 18.52 | 20.83 | 23.15 |
| HP% | 4.08% | 4.66% | 5.25% | 5.83% |
| ATK% | 4.08% | 4.66% | 5.25% | 5.83% |
| DEF% | 5.10% | 5.83% | 6.56% | 7.29% |
| Elemental Mastery | 16.32 | 18.65 | 20.98 | 23.31 |
| Energy Recharge | 4.53% | 5.18% | 5.83% | 6.48% |
| Crit Rate | 2.72% | 3.11% | 3.50% | 3.89% |
| Crit Damage | 5.44% | 6.22% | 6.99% | 7.77% |

The four tiers are treated as equiprobable, and an upgrade target is uniform among the four current lines. Genshin Optimizer's probability implementation independently uses both probabilities as `1 / 4`.

- [Datamined substat tiers](https://github.com/DimbreathBot/AnimeGameData/blob/82e74382e7788e318ad41fca926739a752c0bed6/ExcelBinOutput/ReliquaryAffixExcelConfigData.json)
- [Genshin Optimizer probability implementation](https://github.com/frzyc/genshin-optimizer/blob/0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2/libs/gi/util/src/artifact/rollProbabilityUtil.ts)

Substat types are selected without replacement after excluding the main stat and existing lines. The repository uses equivalent relative weights:

- Flat HP, ATK, DEF: 150
- HP%, ATK%, DEF%, EM, ER: 100
- Crit Rate, Crit Damage: 75

The production probability of a four-line start is not present in the checked client tables. Experiments currently use the community-standard `P(four-line) = 0.20` and must label it as a configurable assumption.

### Canonical displayed roll value

Artifact exports do not preserve the datamined internal total. They preserve the rounded value shown by the game, and this repository then stores it in a protobuf `float`. For example, a maximum Crit Rate roll is internally approximately 3.89% but is imported as the displayed 3.9%. Directly calculating `3.9 / 3.89` would make one maximum roll larger than one roll equivalent, while repeated display rounding can make a perfect aggregate slightly smaller than its mathematical ceiling.

The implementation-safe unit is the nominal tier value:

```text
tier 1 = 0.7 roll
tier 2 = 0.8 roll
tier 3 = 0.9 roll
tier 4 = 1.0 roll
```

An exhaustive enumeration generated every ordered one- through six-roll sequence for every five-star substat using the game's float32 accumulation and display correction rules. For every possible displayed aggregate, all compatible histories had the same total nominal tier value:

| Stat | Distinct displayed totals | Conflicting roll values |
|---|---:|---:|
| HP | 51 | 0 |
| ATK | 52 | 0 |
| DEF | 52 | 0 |
| HP% / ATK% | 58 each | 0 |
| DEF% | 56 | 0 |
| Elemental Mastery | 51 | 0 |
| Energy Recharge | 59 | 0 |
| Crit Rate | 53 | 0 |
| Crit Damage | 58 | 0 |

For example, displayed Crit Rate 10.9% can be produced by tier histories `[1.0, 1.0, 0.8]` or `[0.7, 0.7, 0.7, 0.7]`; both equal 2.8 roll equivalents. Displayed Crit Rate 19.4% can come from five maximum rolls or a compatible six-roll history, and both equal 5.0 roll equivalents.

This was cross-checked against Genshin Optimizer's generated five-star roll lookup, including its exceptional display corrections:

- [Roll lookup generator](https://github.com/frzyc/genshin-optimizer/blob/0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2/libs/gi/dm/src/dm/artifact/artifactSubstatRolls.ts)
- [Generated roll lookup](https://github.com/frzyc/genshin-optimizer/blob/0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2/libs/gi/stats/Data/Artifacts/artifact_sub_rolls.json)
- [Exceptional display corrections](https://github.com/frzyc/genshin-optimizer/blob/0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2/libs/gi/stats/Data/Artifacts/artifact_sub_rolls_correction.json)

The maximum difference between an exact tier divided by its exact maximum and its nominal 0.7/0.8/0.9/1.0 value is 0.000926 roll, on the minimum Energy Recharge tier. Across a complete artifact this changes Build Match by less than approximately 0.05 percentage points, while the canonical lookup guarantees all of the important invariants:

- one displayed maximum roll is exactly one roll equivalent;
- a perfect nine-roll artifact is exactly 100%;
- the same displayed aggregate always receives the same value;
- all dynamic-programming state keys can be integers instead of floating-point equality keys.

## Build Match

### Goals and invariants

Build Match measures realized usefulness for one build. It should satisfy:

1. A preferred main stat plus the build's maximum legal four-line +20 substat outcome is 100%.
2. A wrong main stat remains softly ranked through substats, but is always lower than a preferred-main artifact passing the default threshold.
3. A useful roll always increases the score by an amount proportional to its canonical nominal tier value and manual importance.
4. Artifact level alone does not change Build Match.
5. The same observed aggregate stat value receives the same Build Match regardless of whether it came from an initial roll or an upgrade.
6. A fifth or sixth useful stat adds optionality without enlarging the four-line ceiling.

### Roll-equivalent units

For substat `s`, use the canonical lookup to obtain the total nominal tier points compatible with its displayed aggregate:

```text
q_s = canonical_roll_points(displayed_value_s) / 10
```

A maximum-tier roll contributes `1.0`; the other tiers contribute exactly `0.7`, `0.8`, and `0.9` scoring units. The exact datamined values remain the source for generating and validating the display lookup; rounded totals are never divided directly.

### Deriving the main-stat budget

Variable-slot +20 main stats are almost exactly eight maximum-tier substat rolls of the same stat:

| Main stat | Local +20 value | Maximum substat roll | Equivalent rolls |
|---|---:|---:|---:|
| HP% | 46.5% | 5.83% | 7.976 |
| ATK% | 46.5% | 5.83% | 7.976 |
| DEF% | 58.2% | 7.29% | 7.984 |
| Elemental Mastery | 186.2 | 23.31 | 7.988 |
| Energy Recharge | 51.8% | 6.48% | 7.994 |
| Crit Rate | 31.0% | 3.89% | 7.969 |
| Crit Damage | 62.1% | 7.77% | 7.992 |

Mean: `7.983`; population standard deviation: `0.009`. The scoring model therefore reserves eight units for the main stat. A perfect four-line artifact has nine substat-roll opportunities, producing the mechanically grounded split:

```text
main share = 8 / 17 = 47.0588%
substat share = 9 / 17 = 52.9412%
```

### Manual substat importance

Let `w_s` be the build's manual relative value of one maximum roll of stat `s`. Only weight ratios matter.

The previous implementation had two weight layers: a visible build slider multiplied by hidden global multipliers of `0.5` for flat stats, `1.0` for most stats, and `1.333` for Crit Rate and Crit Damage. Those multipliers were present from the initial scoring implementation and had no cited or experimental calibration.

Once exact maximum-roll units are used, the hidden multipliers are utility preferences rather than unit conversions. A direct-damage sanity check also rejects a universal `1.333x` Crit rule. With a total ATK multiplier of `2.0` and a 70%/140% Crit baseline, one maximum roll changes simplified expected damage by approximately:

- ATK%: 2.92%
- Crit Rate: 2.75%
- Crit Damage: 2.75%

The relative result changes with the current build, team, reactions, and ER thresholds. Therefore selected stats default to equal manual importance, and the visible build weights are the source of truth.

### Chosen formula

For artifact main stat `a`, define:

```text
V = sum(w_s * q_s) over observed legal desired substats

D(a, w) = sum(w_s for up to four highest-weight legal distinct substat types s)
          + 5 * max(legal w_s)

BuildMatch = [8 * I(preferred main) + 9 * V / D(a, w)] / 17
```

If fewer than four legal desired stats exist, all available desired weights are used in the first term of `D`. Equal numerical weights on different substat types are each counted; "distinct" describes the stat types, not the weight values. A fifth or later desired stat is an alternative line and does not enlarge `D`.

Consequences:

- Preferred main with no useful substats: 47.1% for every build breadth.
- Wrong main with a legal perfect substat outcome: at most 52.9%.
- Preferred main with a legal perfect four-line +20 outcome: 100%.
- Multiplying all manual weights by the same constant changes nothing.
- For a fixed build, every observed roll contributes linearly.

### Three-line-start ceiling

A three-line-start artifact finishes with eight total substat rolls, while the absolute perfect reference has nine. Let `S` be the sum of the four highest legal desired weights, using every legal desired weight if fewer than four exist, and let `m` be the largest legal weight. Its best possible weighted substat value and denominator are:

```text
V_three_max = S + 4m
D = S + 5m

BuildMatch_three_max = [8 + 9 * (S + 4m) / (S + 5m)] / 17
```

Because `S <= 4m`, this is at most `16 / 17 = 94.1176%`. Equality holds only when the top four legal desired weights are equal. With narrower or unequal-weight builds, the build-specific ceiling is lower; for weights `1.0, 0.5, 0.5, 0.5`, it is `79 / 85 = 92.9412%`.

Normalizing three-line and four-line starts separately to 100% was rejected for the primary Build Match:

- one maximum roll would be worth `1 / 8` of the substat segment for a three-line start but `1 / 9` for a four-line start;
- identical final displayed stats could receive different scores based on an invisible acquisition history;
- GOOD and Mona exports do not preserve the original starting-line count after enhancement;
- the resulting score would measure roll efficiency rather than absolute realized build value.

The raw weighted numerator is one maximum top-weight roll short of the corresponding four-line perfect result. The normalized percentage gap is build-dependent and is at least `1 / 17`; it is exactly `1 / 17` only for four equal top weights. Prospect Rarity still recognizes an eight-perfect-roll artifact as exceptional. If roll efficiency is ever shown, it must be a separate diagnostic rather than changing Build Match.

### Rejected normalization models

#### Current-level denominator

Normalizing against the number of rolls available so far violates monotonicity. A perfect +0 value of `4 / 4 = 100%` becomes `4.7 / 5 = 94%` after a useful minimum-tier upgrade. It measures efficiency so far, not accumulated build value.

#### One total build-specific denominator

The candidate formula was:

```text
[8 * I(preferred main) + V] / [8 + D(a, w)]
```

For equal-weight builds with one through four legal useful stats, `D` is 6, 7, 8, and 9. The preferred-main-only baseline becomes 57.1%, 53.3%, 50.0%, and 47.1%. At a 60% threshold, those builds require only 0.4, 1.0, 1.6, and 2.2 maximum-roll equivalents. Narrow builds therefore receive a denominator subsidy.

The chosen fixed main/substat split preserves a constant 47.1% main baseline while still allowing a truly perfect outcome for a focused build to reach 100%.

### Preset breadth audit

The 104 shipped presets declare:

| Selected useful substats | Presets |
|---:|---:|
| 3 | 15 |
| 4 | 47 |
| 5 | 41 |
| 6 | 1 |

Across 653 preferred-main variants, excluding a desired substat when it conflicts with the selected main leaves:

| Legal useful substats | Variants |
|---:|---:|
| 2 | 52 |
| 3 | 206 |
| 4 | 277 |
| 5 | 115 |
| 6 | 3 |

This confirms that two- and three-stat calibration is a normal case, not an edge case.

### Breadth simulation

Monte Carlo inputs:

- 500,000 correct-main five-star artifacts
- `P(four-line) = 0.20`, `P(three-line) = 0.80`
- Repository substat-type weights: 150 / 100 / 75
- Uniform upgrade target among four current lines
- Uniform roll tier among approximately 0.70 / 0.80 / 0.90 / 1.00
- Equal manual importance within representative one- through five-stat desired sets
- Chosen fixed-split Build Match formula

Results at +20:

| Legal useful stats | Mean Match | P(Match >= 70%) | P(Match >= 80%) |
|---:|---:|---:|---:|
| 1 | 51.6% | 5.1% | 0.3% |
| 2 | 54.8% | 7.3% | 1.3% |
| 3 | 58.2% | 12.9% | 2.2% |
| 4 | 60.8% | 17.9% | 2.7% |
| 5 | 64.6% | 30.1% | 6.7% |

Broader builds are not penalized by their extra desired stats. Their additional line options naturally increase realized scores, while focused builds no longer receive a higher main-stat baseline.

A one-stat build can still reach 100%, but only when a four-line artifact contains that stat, its initial roll is maximum tier, all five upgrades target it, and every upgrade is maximum tier. Conditional on the useful line already being present, the target-and-tier sequence has probability:

```text
(1 / 4)^5 upgrade targets * (1 / 4)^6 roll tiers
= 1 / 4,194,304
```

The four-line-start, main-stat, and substat-type probabilities make the complete acquisition probability smaller. This is a perfect match and an exceptionally rare outcome; Rarity should express the latter rather than suppressing its Build Match.

### Historical v1 current-Match gate (superseded for public selection)

The first exact-engine UI selected 55% as a current-Match-only gate. The boundary remains useful mathematical evidence, but the 2026-07-14 unified public Score calibration above replaces it with stage-aware Potential/Score recommendations and an explicit main-stat gate.

For an equal-weight build with four or more legal useful stats, a correct-main +0 artifact with average-tier visible rolls scores:

| Useful visible lines | Build Match |
|---:|---:|
| 0 | 47.1% |
| 1 | 52.1% |
| 2 | 57.1% |
| 3 | 62.1% |
| 4 | 67.1% |

The 55% cutoff:

- remains above the 52.9% theoretical wrong-main ceiling;
- rejects an ordinary one-useful-line starter;
- includes a +0 starter with two meaningfully weighted useful lines;
- comfortably includes three- and four-line prospects;
- lets manual importance reject artifacts whose only matches are low priority.

## Potential experiments

Potential is the complete probability distribution of final +20 Build Match conditioned on the artifact's observed state. It does not change the realized Build Match formula.

### Exact future-event model

For four known substat lines, let `n` be the remaining enhancement events:

```text
n = 5 - floor(level / 4)
```

For each event, the target line and tier form 16 equiprobable branches. In canonical roll points the mean tier is exactly `0.85` for every stat. Let `mu_i = 0.85`. Then:

```text
E[V_20] = V_current + n / 4 * sum(w_i * mu_i)
```

For a three-line +0 artifact, enumerate every legal fourth-line type `x` with its weighted-without-replacement probability and all four reveal tiers. The reveal is followed by four upgrades:

```text
E[V_20] = V_current
          + sum(existing w_i * mu_i)
          + 2 * E_x[w_x * mu_x]
```

The factor of two for the new line contains its reveal roll plus its expected share of the four later upgrades.

Production should use exact dynamic programming for the full distribution rather than only these expectation formulas. Representative cases compressed to approximately 90--6,000 distinct states, despite the largest raw path tree containing more than one million paths.

From the exact distribution calculate:

- Expected +20 Match
- P10, median, and P90 final Match
- chance to reach a configurable target
- best reachable Match as secondary detail

At +20 the distribution contains one state, so Expected +20 Match and every percentile equal realized Build Match.

### Representative four-stat experiment

Build: preferred main with equal-priority Crit Rate, Crit Damage, ATK%, and ER. Current visible values use representative near-mean tiers. Reveal probabilities use the repository's weighted substat-type selection.

This was an early direction-finding run. Its original script did not preserve the exact main stat, dead-line types, and tier choices, so the table is retained as historical motivation only and is **not** accepted as reproducible calibration or regression evidence. The fully specified golden vectors later in this document supersede it.

| +0 starter | Expected +20 | P10 | P90 | Best | P(final >= 75%) |
|---|---:|---:|---:|---:|---:|
| Four-line, 1 useful | 58.3% | 52.1% | 65.0% | 81.5% | 0.09% |
| Four-line, 2 useful | 69.6% | 61.8% | 77.1% | 86.5% | 17.8% |
| Four-line, 3 useful | 80.8% | 73.8% | 87.4% | 91.5% | 88.1% |
| Four-line, 4 useful | 92.1% | 90.0% | 94.1% | 96.5% | 100% |
| Three-line, 2 useful | 69.6% | 61.8% | 78.2% | 86.5% | 22.3% |
| Three-line, 3 useful | 78.2% | 71.5% | 85.6% | 91.5% | 74.8% |

The different three-line results include the exact probability that the reveal is useful. In the representative cases that probability was 25% with two useful visible lines and 11.76% with three useful visible lines.

Best-case Potential is unsuitable for ranking. A one-useful-line starter can have an 81.5% mathematical ceiling while having only a 0.09--2.17% chance of reaching 75%.

### Manual-importance experiment

For a four-line +0 build with weights `1.0, 1.0, 0.5, 0.5`:

| Visible useful lines | Expected +20 | P10--P90 | P(final >= 75%) |
|---|---:|---:|---:|
| Two top-priority | 72.4% | 63.6--80.8% | 34.4% |
| One top, one lower | 66.0% | 58.8--73.0% | 5.5% |
| Two lower-priority | 59.7% | 55.3--63.9% | 0% |
| All four | 85.0% | 80.5--89.4% | effectively 100% |

The manual weights therefore alter the forecast without another calibration layer.

### Historical v1 Potential-detail calibration

The following choices describe the first technical UI and are retained as experiment history. The unified public Score calibration now hides these diagnostics by default and promotes the expected endpoint directly as integer Potential.

- Primary Potential value: **Expected +20 Match**
- Default artifact sort: **Expected +20 Match descending**
- Displayed uncertainty: **P10--P90**
- Useful absolute decision reference: **75% final Build Match**, configurable
- Current Build Match minimum: **55%**, with no additional Potential filter by default

The 75% target separates two- and three-useful-line prospects without making three-line starters implausible:

| Starter | P(final >= 70%) | P(final >= 75%) | P(final >= 80%) |
|---|---:|---:|---:|
| Four-line, 2 useful | 48.2% | 17.8% | 2.8% |
| Four-line, 3 useful | 98.4% | 88.1% | 61.0% |
| Three-line, 2 useful | 45.8% | 22.3% | 7.1% |
| Three-line, 3 useful | 95.5% | 74.8% | 38.1% |

Two minimum-tier full-priority useful lines already pass the 55% current threshold at approximately 55.29%. Their Expected +20 Match is approximately 67.8%, so low-tier but upgrade-worthy starters remain visible and sort according to their actual outcome distribution.

After calibrating Rarity, the selected adaptive default is the chance to reach the tie-preserving top-10% +20 Build Match group for the same build and position, when that discrete-population target exists. This target is derived from the Rarity policy rather than introducing another absolute product constant. The 75% experiment remains useful as an understandable optional target.

### Intermediate-level behavior

Potential uses the same endpoint distribution at every level. Realized useful hits raise the forecast, misses lower it, and the range narrows as events are consumed. No upgrade-history bonus is needed. In an illustrative four-line path with three useful lines, Expected +20 changed from 80.8% at +0 to 82.1% after a useful +4 hit, then to 78.3% after a miss at +8. At +20 it collapsed to the realized 77.1%.

## Rarity experiments

**Current product status:** the probability work in this section remains valid as an advanced diagnostic, but the 2026-07-14 calibration rejects Prospect percentile as the primary public score or automatic keep/upgrade rule. The population must be preferred-main conditioned before any future hidden recommendation layer reuses it.

Rarity is mechanics-driven after defining the event it measures. The experiment compared exact-history probability, exact displayed-state probability, componentwise acquisition tails, and stage-relative quality tails.

### Fixed inputs and remaining assumption

The probability engine includes:

- main-stat probability for the position;
- substat types selected with weights 150 / 100 / 75 without replacement;
- four equiprobable tiers for every initial, revealed, and upgrade roll;
- uniform upgrade target among four lines;
- all histories compatible with the displayed values.

Potential does not need a three-line/four-line prior because the current line count and level completely determine future events. Rarity models how a random artifact reached the observed stage and therefore needs this prior. The default is the explicitly labeled, configurable assumption:

```text
P(four-line start) = 0.20
P(three-line start) = 0.80
```

The current local export contains 444 four-line and 1,246 three-line unupgraded five-star artifacts, or 26.27% four-line. Retention behavior and acquisition source make this a selected-inventory observation, not an unbiased estimate and not a reason to replace the 20% source assumption.

### Rejected: exact history or exact state

Exact history probability measures unusualness rather than quality:

- Minimum and maximum tiers are each one of four equally likely outcomes.
- Five upgrades into Crit and five upgrades into a useless line have the same target probability.
- Two equally perfect artifacts can have different exact-state probabilities because one allocation has more equivalent orderings.

For a representative ATK% Sands build wanting equal-priority CR, CD, ER, and EM:

- a perfect four-line +0 starter has exact probability approximately `1 / 1.97 million`;
- a perfect +20 with five upgrades concentrated into CR has exact aggregate-state probability approximately `1 / 2.07 trillion`;
- the same 100% Match with target counts `[2, 2, 1, 0]` has 30 equivalent target orderings and exact state probability approximately `1 / 68.9 billion`;
- summing every compatible 100% outcome gives a quality-tail probability approximately `1 / 2.02 billion`.

The 30x exact-probability difference between two 100% outcomes is irrelevant to their build quality.

A deterministic two-million-artifact experiment found that mean exact-path surprisal mechanically rose from `5.615` to `11.765` decimal digits between +0 and +20, a factor of approximately 1.46 million, while its correlation with Build Match was approximately zero at +0 and only `0.028` at +20.

Therefore raw exact-path likelihood, negative-log exact-state probability, and per-event-normalized likelihood are rejected as the user-facing Rarity rating.

### Optional diagnostic: acquisition odds

An exact build-independent acquisition diagnostic can still answer: "How often does the same position produce this main and substat signature with equal-or-better displayed totals?"

For stat `s`, displayed value `y`, and `n` rolls, precompute:

```text
g_s(y, n) = P(stat s displays exactly y after n rolls)
G_s(y, n) = P(stat s displays at least y after n rolls)
```

Build these tables by convolving all four tiers and applying the game's display rounding/correction rules. Do not select one representative roll parse.

For enhancement milestone `h = floor(level / 4) >= 1`, start class `C`, and four displayed lines, the number of upgrades is:

```text
U = h       for a four-line start
U = h - 1   for a three-line start
```

The conditional displayed-state probability is:

```text
P(y | C) = sum over allocations u_1 + ... + u_4 = U of
           [U! / (4^U * product(u_i!))]
           * product(g_i(y_i, 1 + u_i))
```

Use `G_i` for the componentwise equal-or-better tail. There are at most 56 upgrade allocations, and the unordered type-set probability needs at most 24 permutations, so this computation is small after caching.

Displayed totals are genuinely ambiguous. For example, displayed Crit Rate 10.9% can be produced by six ordered three-roll tier sequences with combined probability `0.09375`, or by four minimum rolls with probability `0.00390625`. Both histories must be included.

Raw acquisition odds are not level-neutral. A 30,000-artifact-per-level experiment produced:

| Level | Median `-log10(P_tail)` | Share with score >= 4 |
|---:|---:|---:|
| +0 | 3.40 | 23% |
| +4 | 3.68 | 36% |
| +12 | 4.57 | 76% |
| +20 | 5.01 | 91% |

Display these odds as optional `1 in N` detail, not as the cross-level filter.

### Selected Rarity: stage-relative prospect percentile

For build `b`, position `p`, and enhancement milestone `L`, define prospect quality:

```text
Q(b, a_L) = E[BuildMatch at +20 | observed artifact a at stage L]
```

This is the artifact's Expected +20 Match. Let `X_L` be a random normal-source five-star artifact at the same position and enhancement milestone. Define:

```text
p_tail = P(Q(b, X_L) >= Q(b, a_L))
Rarity percentile = 100 * (1 - p_tail)
sort score = -log10(p_tail)
```

Rarity therefore answers: "How often is an artifact at this stage at least this promising for this build?"

- At +0 it ranks starting potential, including the fourth-line and five-upgrade advantage.
- At intermediate levels it incorporates every realized hit, miss, and tier together with remaining potential.
- At +20, Expected +20 equals realized Build Match, so it ranks finished outcomes.
- Conditioning on position and milestone makes the percentile comparable across slots and levels.

The population distribution can be generated exactly with the same probability engine: enumerate main stats, start class, weighted type selections, tiers, and upgrade events; compute `Q`; aggregate equal values; and build a survival CDF. Cache it by build-weight signature, position, milestone, and source profile.

When several builds are enabled, calculate the percentile per build. The overall artifact card binds Prospect Rarity to the same Build that gives that artifact its highest Expected +20 Match, with deterministic tie-breaking. It must not take the maximum percentile across Builds: doing so would make a nominal top-10% badge increasingly common merely because more Builds were enabled. Per-Build percentiles remain available in expanded details.

### Level-comparability experiment

The law of total expectation predicts that the population mean of Expected +20 Match remains constant as enhancement information is revealed. A deterministic two-million-artifact experiment produced means of:

```text
+0:  27.219%
+4:  27.218%
+8:  27.217%
+12: 27.213%
+16: 27.212%
+20: 27.212%
```

The small drift is Monte Carlo error. The ordinary inverse-CDF P90 prospect-quality threshold remained in the approximately 62--66% range across milestones; this observation is distinct from the later conservative inclusive-tail finish target.

### Default percentile experiment

Experiment setup:

- deterministic seed `C0FFEE`;
- two million normal-source five-star Sands per stage;
- preferred ATK% main;
- equal-priority CR, CD, ER, and EM;
- 80% three-line / 20% four-line assumption;
- exact type, target, and tier probabilities.

Representative +0 results:

| Starter | Expected +20 | Population tail | Percentile |
|---|---:|---:|---:|
| Three-line, two minimum-tier useful lines + HP | 68.15% | 7.92% | 92.08 |
| Three-line, useful tiers near 0.8 / 0.9 | 69.92% | 3.74% | 96.26 |
| Four-line, two minimum-tier useful lines + two dead lines | 67.79% | 8.27% | 91.73 |
| Four-line, three minimum-tier useful lines | 78.16% | 0.677% | 99.323 |

The historical diagnostic default was:

```text
Rarity percentile >= 90
p_tail <= 10%
sort score >= 1
```

Display the percentile and `1 in round(1 / p_tail)` artifacts. The top-10% default includes two-low-useful-line +0 prospects, matching the discovery goal. A top-5% default already hides some of those starters.

### Derived Potential target

Let `T_top10(b, p)` be the lowest reachable +20 Build Match whose inclusive finished-population tail is no larger than 10%:

```text
T_top10 = min { t in finished support : P(BuildMatch_20 >= t) <= 10% }
```

When this support value exists, the default decision aid becomes:

```text
P(final Build Match >= T_top10 | current artifact)
```

This is deliberately a conservative inclusive-tail target, not the ordinary inverse-CDF P90. In a discrete population the maximum score can itself have more than 10% probability; then no reachable value can define a tie-preserving group of at most 10%, and the target is reported as unavailable. We never split equal scores or invent an unreachable threshold. When available, the result means "chance to reach the tie-preserving top-10% finished group" and reuses the one explicit percentile policy instead of adding another arbitrary target. Absolute targets such as 75% remain configurable.

### Source and validity boundaries

- The default population is a normal-source five-star artifact at the same position; set and slot drop odds are omitted.
- Crafted/transmuted artifacts need a separate source profile because their controlled choices change the probability tree.
- Impossible displayed roll combinations are unscorable, not infinitely rare.
- Canonical integer display and roll-point keys must be used instead of float equality.

## Accepted implementation contract

This section turns the selected mathematics into a code-level contract. It is intentionally part of the same notebook so implementation changes cannot silently drift away from the experiments.

It describes the committed exact-engine v1 cutover. Where its public labels, filters, and defaults conflict with **Unified public Score calibration (2026-07-14)**, the newer section is the next UI contract; the underlying canonical Match and probability-engine contracts remain unchanged.

### Scope decisions

- The first exact implementation scores **five-star artifacts only**. Lower-rarity artifacts use different level caps, roll tiers, and roll counts; they return an explicit `unsupported` result until a separate mechanics-backed model exists. The old arbitrary non-five-star subtraction is removed.
- Artifact-set compatibility is separate metadata and never changes Build Match. The old position-specific off-set subtraction is removed. The UI may filter or highlight on-set artifacts independently.
- The enhancement milestone is `4 * floor(level / 4)`. Levels +0 through +3 share milestone 0, +4 through +7 share milestone 4, and so on.
- Three visible lines are valid only before milestone 4. Four visible lines are valid at every milestone. At milestone 4 or later, the future event count is the same whether the artifact originally started with three or four lines.
- Build Match uses the absolute nine-roll ceiling. A maximum eight-roll three-line-start result is at most `16 / 17`, not 100%; the exact build-specific ceiling follows the manual importance weights.
- The v1 default selection gate is current Build Match `>= 0.55`. Prospect Rarity is a badge and optional filter, not an `OR` path around the main-stat gate. The simplified public UI supersedes this caller policy with Potential/Score actions while retaining the exact engine.

### Module boundary

Replace `src/utils/fitsAndRarity.ts`, `src/utils/probability.ts`, and their matrix-based helper path in one migration. Do not wrap the old formula in a compatibility adapter. The new deep module should live under `src/utils/artifactScoring/` and expose only canonicalization and evaluation operations:

```text
src/utils/artifactScoring/
  index.ts          public contracts and entry points
  mechanics.ts      immutable five-star tiers, type weights, and source profile
  canonicalize.ts   Artifact/Build boundary conversion and validation
  match.ts          current Build Match and closed-form expected +20
  potential.ts      lazy exact conditional PMF and quantiles
  population.ts     exact prospect population CDF and conservative top-10% target
  cache.ts          versioned build/profile/CDF keys
```

The React UI, Redux reducers, and workers must not import the internal files. They consume the `index.ts` contract.

### Canonical inputs

Existing protobuf `Artifact` and `Build` values remain the storage and sharing format. Convert them once at the scoring boundary:

```ts
type UnitInterval = number; // finite value in [0, 1]
type Milestone = 0 | 4 | 8 | 12 | 16 | 20;

type EvaluationIssueSeverity = "warning" | "error";
type EvaluationIssueCode =
  | "UNSUPPORTED_ARTIFACT_STAR_RARITY"
  | "MISSING_MAIN_STAT"
  | "DUPLICATE_SUBSTAT"
  | "SUBSTAT_EQUALS_MAIN_STAT"
  | "INVALID_ARTIFACT_LEVEL"
  | "INVALID_VISIBLE_LINE_COUNT"
  | "IMPOSSIBLE_SUBSTAT_VALUE"
  | "IMPOSSIBLE_TOTAL_ROLL_COUNT"
  | "INVALID_BUILD_MAIN_STAT"
  | "INVALID_BUILD_SUBSTAT"
  | "DUPLICATE_BUILD_SUBSTAT"
  | "INVALID_BUILD_IMPORTANCE"
  | "NO_LEGAL_DESIRED_SUBSTAT"
  | "INVALID_WORKER_REQUEST"
  | "STALE_SCORING_SNAPSHOT";

interface EvaluationIssue {
  code: EvaluationIssueCode;
  severity: EvaluationIssueSeverity;
  artifactIndex?: number;
  buildId?: string;
  details?: Readonly<Record<string, string | number>>;
}

interface CanonicalSubstat {
  readonly type: AttributeType;
  readonly displayValueKey: number;         // integer display unit, never a float key
  readonly rollValuePoints: number;         // aggregate integer total; each roll adds 7/8/9/10
  readonly possibleRollCounts: readonly number[]; // joint validation and acquisition odds
}

declare const canonicalArtifactBrand: unique symbol;
type CanonicalArtifactState = Readonly<{
  position: AttributePosition;
  level: number;
  milestone: Milestone;
  mainStat: AttributeType;
  substats: readonly CanonicalSubstat[];
  [canonicalArtifactBrand]: true;
}>;

declare const validatedBuildProfileBrand: unique symbol;
type BuildScoringProfile = Readonly<{
  id: string;
  preferredMainStats: Partial<
    Record<AttributePosition, readonly AttributeType[]>
  >;
  importanceBySubstat: Readonly<Partial<Record<AttributeType, number>>>;
  [validatedBuildProfileBrand]: true;
}>;

interface NormalSourceFiveStarProfile {
  readonly kind: "normal-five-star";
  readonly fourLineStartProbability: UnitInterval; // default 0.20 assumption
}

type CanonicalizeArtifactResult =
  | { status: "ok"; artifact: CanonicalArtifactState; issues: readonly EvaluationIssue[] }
  | { status: "unsupported" | "invalid"; issues: readonly EvaluationIssue[] };

type ValidateBuildResult =
  | { status: "ok"; profile: BuildScoringProfile; issues: readonly EvaluationIssue[] }
  | { status: "invalid"; issues: readonly EvaluationIssue[] };
```

The brand symbols are private to the module, so callers cannot structurally fabricate mutually inconsistent canonical states. Only the canonicalizer and Build validator construct these readonly values.

Source-profile validation requires a finite four-line probability in `[0, 1]`; its canonical round-trip number string is part of the source signature. The default `0.20` remains a documented population assumption, not a confirmed mechanic.

Percentage `displayValueKey` values use tenths of one percentage point; flat-stat keys use displayed integers. For a percentage input, multiply by ten and accept the nearest integer only when the scaled error is at most `1e-4`, which covers protobuf float32 transport noise but not an off-grid displayed value. Flat displayed stats must already be integers.

Build importance sliders remain stored in `Build.subAttributes[].value`. The boundary accepts finite values in `0.0--1.0` that lie on the UI's `0.1` grid, allowing `1e-5` only for protobuf float32 transport noise, and converts them to integer tenths. It never silently rounds a value such as `0.55` to `0.6`; an off-grid value returns `INVALID_BUILD_IMPORTANCE`. Zero means unselected. Build validation also rejects duplicate or non-substat attributes and illegal position/main-stat combinations. Divide all positive integer weights by their greatest common divisor when building a cache signature because only ratios matter.

Canonicalization generates the one- through six-roll display lookup from the full-precision datamined affix values, float32 accumulation, and pinned display-correction rules. The two-decimal mechanics table near the top of this notebook is explanatory and must not be used as generator input. An exhaustive fixture generated from the pinned Genshin Optimizer commit checks every lookup entry, not only the examples. The generator must assert that every display key maps to exactly one aggregate `rollValuePoints` total. A key with no compatible five-star history returns `IMPOSSIBLE_SUBSTAT_VALUE`; it is never treated as infinite rarity.

Joint validation checks that at least one combination of `possibleRollCounts` matches a legal total roll count. Let `u = floor(level / 4)`. The legal totals are exactly:

```text
three visible lines:  {3}, valid only when u = 0
four visible lines:   {4}, when u = 0
four visible lines:   {3 + u, 4 + u}, when 1 <= u <= 5
```

The two totals after +4 represent three-line and four-line starts. Other boundary failures include an absent main stat, duplicate substat types, a substat equal to the main stat, an out-of-range level, and any invalid visible-line count.

### Integer Build Match core

Let `I_s` be the positive integer importance of a legal desired substat and `R_s` its total canonical roll points. One roll contributes 7, 8, 9, or 10 points. Define:

```text
P = sum(I_s * R_s) over observed legal desired substats

D_I = sum(I_s for up to four highest-weight legal distinct substat types s)
      + 5 * max(legal I_s)

substat_ratio = P / (10 * D_I)

BuildMatch = [8 * I(preferred main) + 9 * substat_ratio] / 17
```

This is algebraically the chosen formula, but its state is integer and a perfect roll contributes exactly ten points. Exclude the actual main-stat type from the legal desired weights even when the main is not preferred. If `D_I = 0`, return zero substat contribution and a `NO_LEGAL_DESIRED_SUBSTAT` issue instead of `NaN`; the main contribution remains well defined.

Return the decomposition so the UI can explain the number:

```ts
interface BuildMatchResult {
  readonly value: UnitInterval;
  readonly isPreferredMain: boolean;
  readonly mainContribution: UnitInterval;
  readonly substatContribution: UnitInterval;
  readonly issues: readonly EvaluationIssue[];
}
```

Set membership, artifact lock state, equipped character, and artifact level are not inputs to this function.

### Closed-form Expected +20

Expected +20 Match is linear, so the batch path does not need a PMF.

For four known lines, let `n = 5 - floor(level / 4)`. With canonical mean tier points `8.5 = 17 / 2`:

```text
E[P_20] = P_current + n * (17 / 8) * sum(I_i over four lines)
```

The factor `17 / 8` is `1 / 4` target probability times `17 / 2` mean tier points.

For a three-line pre-reveal artifact:

```text
E[P_20] = P_current
          + (17 / 2) * sum(I_i over the three existing lines)
          + 17 * E[I_x]
```

`x` is the legal fourth-line type selected with the fixed without-replacement type weights. Its factor 17 contains the mean reveal roll and its expected one hit among the four later upgrades. Converting `E[P_20]` through the same linear Match formula gives Expected +20 Match.

The normal-source four-line-start prior is not an input to either formula.

### Lazy exact Potential PMF

Generate a full final distribution only for a visible, expanded, or explicitly requested artifact/build pair.

For four known lines, every remaining event has 16 equiprobable branches: four targets times four tier points. The DP state needs only the integer weighted point total `P`; branches with equal increments are merged immediately.

For a three-line pre-reveal artifact:

1. enumerate each legal fourth-line type with its weighted-without-replacement probability;
2. enumerate its four equiprobable starting tier points;
3. run four upgrade events using the resulting four line importances;
4. merge equal final weighted point totals.

Use the inverse discrete CDF without interpolation:

```text
quantile(p) = smallest reachable score x with CDF(x) >= p
```

The returned detail is:

```ts
interface PotentialResult {
  readonly expectedFinalMatch: UnitInterval;
  readonly p10FinalMatch: UnitInterval;
  readonly medianFinalMatch: UnitInterval;
  readonly p90FinalMatch: UnitInterval;
  readonly bestReachableFinalMatch: UnitInterval;
}
```

Do not expose or persist the internal PMF. At +20 it must collapse to one state with probability one.

### Prospect population and Rarity

The immutable normal-source mechanics profile contains:

- the position-specific main-stat weights already represented by the repository's 5,000- or 4,000-count tables;
- substat type weights 150 / 100 / 75 without replacement;
- tier points 7 / 8 / 9 / 10, each with probability `1 / 4`;
- uniform target choice among four lines;
- configurable four-line-start probability, default 0.20.

User-editable `rarityWeights`, `standardRarity`, and logarithm bases do not exist in the new model.

Build an exact survival CDF on demand for each normalized Build signature, position, milestone, and source profile. The population cache key is:

```text
algorithmVersion
+ normalized Build scoring signature
+ position
+ milestone
+ source-profile signature
```

Expected +20 Match is the population quality value. Its reveal expectation can have different denominators for different legal type sets, so no fixed decimal scale is assumed. Internal quality keys use reduced exact rationals:

```ts
interface ExactRational {
  readonly numerator: bigint;
  readonly denominator: bigint; // positive; gcd is one
}
```

Normalize signs and divide by the greatest common divisor before keying. Test equality by the normalized numerator/denominator pair and order values by cross multiplication. Aggregate equal rational quality keys before constructing the CDF, and convert to JavaScript `number` only at the public UI boundary.

Probability paths are enumerated rather than sampled. Probability masses use deterministic IEEE-754 doubles with compensated summation, `PROBABILITY_EPSILON = 1e-12`, and a stable iteration order. A PMF/CDF is valid only when its pre-normalization mass differs from one by at most that epsilon; then divide every mass by the measured total. CDF/quantile and `0.10` cutoff comparisons treat values within the same epsilon as equal. This is enumeration-exact with explicitly bounded numeric accumulation, while rational quality keys keep ties collision-free.

For observed quality `q`:

```text
p_tail = P(population quality >= q)
percentile = 1 - p_tail
```

The inclusive tail makes ties conservative. The maximum possible result is generally below 100% by its own probability mass.

Define the conservative finished top-10% target as the lowest reachable `T_top10` whose inclusive survival probability is at most 0.10:

```text
T_top10 = min { t in finished support : P(BuildMatch_20 >= t) <= 0.10 }
```

If the set is nonempty, the lazy Potential PMF provides `P(final Build Match >= T_top10 | observed artifact)`. If it is empty because the maximum-quality tie alone exceeds 10%, the tie-preserving target is unavailable.

```ts
interface ProspectRarityResult {
  readonly percentile: UnitInterval;
  readonly tailProbability: UnitInterval;
  readonly position: AttributePosition;
  readonly milestone: Milestone;
  readonly sourceProfile: NormalSourceFiveStarProfile;
}

type TopTenFinishResult =
  | {
      status: "available";
      targetFinalMatch: UnitInterval;
      probability: UnitInterval;
    }
  | {
      status: "unavailable";
      reason: "TOP_DECILE_CUT_NOT_REACHABLE";
    };
```

Compute results per Build. The card may independently show its best current Build Match, but its Expected +20, Prospect Rarity, and default Potential detail are all bound to the single Build with maximum Expected +20. Break ties by higher current Match, then enabled-Build input order. Expanded details may request other Build pairs. Never take the maximum Prospect Rarity across enabled Builds, because that destroys the stated percentile semantics.

Accordingly, a `>= 90%` badge means "top 10% or better within the displayed Build's comparison population." It is not a claim that the artifact is in the top 10% under a joint population spanning every enabled Build.

### Batch and worker contract

The public single-pair evaluator is discriminated so unsupported and invalid imports cannot masquerade as low scores:

```ts
type ArtifactBuildEvaluation =
  | {
      status: "ok";
      match: BuildMatchResult;
      expectedFinalMatch: UnitInterval;
    }
  | {
      status: "unsupported" | "invalid";
      issues: readonly EvaluationIssue[];
    };
```

The initial 2,112-by-104 summary must not allocate one nested object per pair. It uses transferable columnar arrays with Build ids stored once:

```ts
const BATCH_ENTITY_STATUS = {
  OK: 0,
  UNSUPPORTED: 1,
  INVALID: 2,
} as const;

interface ArtifactEvaluationBatch {
  readonly datasetId: string;
  readonly algorithmVersion: string;
  readonly buildIds: readonly string[];
  readonly artifactCount: number;
  readonly buildCount: number;

  readonly artifactStatus: Uint8Array;      // artifactCount
  readonly artifactIssueFlags: Uint32Array; // artifactCount
  readonly buildStatus: Uint8Array;         // buildCount
  readonly buildIssueFlags: Uint32Array;    // buildCount

  // Pair index = artifactIndex * buildCount + buildIndex.
  readonly match: Float64Array;
  readonly expectedFinalMatch: Float64Array;
  readonly isPreferredMain: Uint8Array;
  readonly pairIssueFlags: Uint32Array;
}
```

Rows or columns whose entity status is not `OK` contain `NaN` in both score arrays. Issue flags use a versioned stable bit assignment; detailed `EvaluationIssue` objects are emitted only for actual failures, never as 219,648 empty arrays. The typed-array buffers are passed in the `postMessage` transfer list instead of structured-cloned.

Summary, Prospect Rarity, and Potential are independent worker phases. Requests and responses are complete discriminated unions:

```ts
interface PairRef {
  readonly artifactIndex: number;
  readonly buildIndex: number;
}

type ScoringWorkerRequest =
  | {
      type: "summary";
      requestId: string;
      datasetId: string;
      artifacts: readonly Artifact[];
      builds: readonly Build[];
    }
  | {
      type: "prospect";
      requestId: string;
      datasetId: string;
      summaryKey: string;
      targets: readonly PairRef[];
      sourceProfile: NormalSourceFiveStarProfile;
    }
  | PotentialWorkerRequest
  | { type: "cancel"; requestId: string };

interface PotentialRequestBase {
  readonly type: "potential";
  readonly requestId: string;
  readonly datasetId: string;
  readonly summaryKey: string;
  readonly targets: readonly PairRef[];
}

type PotentialWorkerRequest = PotentialRequestBase &
  (
    | { finishTarget: { kind: "none" } }
    | {
        finishTarget: {
          kind: "conservative-top-ten";
          sourceProfile: NormalSourceFiveStarProfile;
        };
      }
    | {
        finishTarget: {
          kind: "absolute-match";
          target: ExactRational;
        };
      }
  );

type ProspectDelta =
  | { pair: PairRef; status: "ok"; result: ProspectRarityResult }
  | { pair: PairRef; status: "unsupported" | "invalid"; issues: readonly EvaluationIssue[] };

type FinishChanceResult =
  | { kind: "none" }
  | { kind: "conservative-top-ten"; result: TopTenFinishResult }
  | {
      kind: "absolute-match";
      target: ExactRational;
      targetFinalMatch: UnitInterval;
      probability: UnitInterval;
    };

type PotentialDelta =
  | {
      pair: PairRef;
      status: "ok";
      result: PotentialResult;
      finishChance: FinishChanceResult;
    }
  | { pair: PairRef; status: "unsupported" | "invalid"; issues: readonly EvaluationIssue[] };

type ScoringPhase = "summary" | "prospect" | "potential";
type ScoringWorkerResponse =
  | {
      type: "progress";
      requestId: string;
      phase: ScoringPhase;
      completed: number;
      total: number;
    }
  | {
      type: "summaryComplete";
      requestId: string;
      batch: ArtifactEvaluationBatch;
      summaryKey: string;
      issues: readonly EvaluationIssue[];
    }
  | { type: "prospectChunk"; requestId: string; results: readonly ProspectDelta[] }
  | { type: "prospectComplete"; requestId: string }
  | { type: "potentialChunk"; requestId: string; results: readonly PotentialDelta[] }
  | { type: "potentialComplete"; requestId: string }
  | { type: "cancelled"; requestId: string; phase: ScoringPhase }
  | {
      type: "error";
      requestId: string;
      phase: ScoringPhase;
      issues: readonly EvaluationIssue[];
    };
```

The request union makes the source profile mandatory for a conservative top-10% target and makes every successful Potential delta explicitly state which finish result was returned. Runtime validation still rejects malformed untyped messages with `INVALID_WORKER_REQUEST`. The UI parses an absolute target's decimal input into a reduced `ExactRational`; validation requires `0 <= numerator <= denominator` and a positive denominator. Its chance uses the inclusive comparison `P(final Match >= target)`, by exact cross multiplication, so a reachable score exactly equal to the target is included. `targetFinalMatch` is only the returned display conversion.

The UI tracks `idle | pending | ready | error` independently for each lazy pair/phase and applies chunk deltas without retransmitting the summary batch. It ignores responses whose request id is no longer current. A long-lived Worker processes bounded chunks, yields to its message queue at least every 8 ms of computation, and checks cancellation between chunks. This preserves its caches while allowing a `cancel` message to produce `cancelled`; request ids alone are not treated as cancellation.

Prospect and Potential requests are accepted only when both `datasetId` and `summaryKey` match the retained completed summary. This binds every numeric `PairRef` to the exact artifact order and Build order/profile snapshot that produced it. A mismatch returns `STALE_SCORING_SNAPSHOT`. A new summary request preempts both active and queued lazy work for the old snapshot at the next bounded yield, then replaces its canonical artifact/build state. CDF/detail work is built in request-local scratch state and committed to the shared LRU only after full validation and normalization, so cancellation cannot leave a partial cache entry. Reusable completed population CDF entries remain governed by their content keys and LRU budget.

Lazy calculations use the retained canonical state and exact rational quality; they never feed a `Float64Array` summary value back into a population tie/CDF lookup.

### Performance strategy

The inspected local data set contains 2,112 five-star artifacts and 104 presets, or 219,648 artifact/Build pairs when everything is enabled. Eagerly retaining a 90--6,000-state PMF for every pair would require roughly 20 million to 1.3 billion states and is rejected.

Use three exact phases:

1. Calculate current Match and closed-form Expected +20 for every pair into the columnar batch. This is the initial list and default sort path. Per artifact, select the best current-Match Build and the best Expected +20 Build separately with deterministic ties.
2. In the background, generate Prospect Rarity for the best-Expected Build of each visible card. Cards show an independent pending placeholder until it arrives. If Prospect Rarity sorting or filtering is enabled, calculate that one bound pair for the full inventory with phase progress, then apply the final sort/filter. Expanded per-Build details may request additional CDFs.
3. Generate P10--P90 and Top-10% Finish Chance for only the best-Expected Build on the current page, at most the current page size of 20 pairs. Request another Build only when the user expands it. Cache returned summaries, never internal PMFs.

Use three primary keys plus two composed finish-result keys:

```text
summaryKey = algorithmVersion
           + artifact-collection content hash
           + ordered validated Build-profile signatures

populationKey = algorithmVersion
              + normalized position-specific Build signature
              + position + milestone
              + source-profile signature

finishedPopulationKey = populationKey with milestone fixed to 20

potentialDetailKey = algorithmVersion
                   + canonical artifact signature
                   + normalized position-specific Build signature

topTenFinishKey = potentialDetailKey + finishedPopulationKey

absoluteFinishKey = potentialDetailKey + reduced target numerator/denominator
```

The current-milestone `populationKey` drives Prospect Rarity. The conservative finish target always comes from the same position/Build population at milestone 20, even when the observed artifact is +0 or +12. Changing the four-line-start prior invalidates population-derived Prospect Rarity, conservative targets, and their composed Top-10% Finish results only. It must not invalidate current Match, Expected +20, the conditional Potential PMF, its P10--P90 summary, or absolute-target finish chances.

Population CDFs and small Potential summaries live only in a Worker-owned least-recently-used cache with an initial 32 MiB byte budget. Top-10% Finish results are composed under `topTenFinishKey`, and optional absolute-target results under `absoluteFinishKey`; exact reduced target fractions prevent key or boundary collisions. Transient PMFs are not retained. Entry cost includes typed-array storage and indexed key storage; insertions evict least-recently-used entries until under budget. The retained canonical artifact/Build snapshot is replaced on every accepted summary. CDFs, PMFs, and the LRU never enter Redux or IndexedDB, and terminating the Worker is allowed to discard them. If Workers are unavailable, the main-thread fallback computes only current Match and closed-form Expected +20 in bounded chunks; Prospect Rarity and full Potential remain visibly unavailable instead of synchronously freezing the UI.

The first implementation must include a fixed-seed benchmark fixture with 2,112 legal synthetic artifacts across milestones and 104 validated Build profiles. The ignored local GOOD export is a manual smoke input, not a CI dependency. Record:

- summary compute time and Worker peak memory;
- request structured-clone time, transferable response bytes/time, and main-thread peak memory;
- time until the Expected +20-sorted list becomes interactive;
- cold, hit, and post-eviction CDF times;
- cancellation latency while a cold population calculation is active;
- bytes offered to Redux Persist/IndexedDB, which must be zero for derived scoring data.

For this exact workload, the four summary pair columns plus status columns must remain below 6 MiB of transferable typed-array payload, and active cancellation must be acknowledged within 50 ms at p95 on the benchmark runner. The initial benchmark records hardware-specific time/memory baselines; explicit CI regression budgets must be committed before caller cutover. Initial rendering never waits for conditional PMFs or all population CDFs.

#### Implementation benchmark baseline (2026-07-14)

The committed fixed-seed fixture generates 2,112 legal synthetic five-star artifacts across all six enhancement milestones and 104 validated Build profiles. On Node.js 24.15.0, x86-64, AMD Ryzen 7 5700G, `npm run benchmark:artifact-scoring` recorded:

| Measurement | Baseline |
|---|---:|
| Summary calculation, 219,648 artifact/Build pairs | 441.266 ms |
| Request structured clone | 7.836 ms |
| Transferable response payload | 4,623,688 bytes / 4.409 MiB |
| Transferable response handoff | 0.228 ms |
| Build of the Expected +20 sorted list | 47.392 ms |
| Node heap delta after Summary | 5.280 MiB |
| Cold Prospect population | 53.109 ms |
| Cached Prospect population | 0.003 ms |
| Prospect population after eviction | 23.804 ms |
| Estimated retained Prospect population | 0.964 MiB / 1,837 atoms |
| Browser Worker cancellation, 9 fixed-workload trials | 8.0 ms median / 36.0 ms p95 |
| Derived scoring persistence | Structurally excluded from Redux Persist and IndexedDB |

These timings are hardware-specific observations, not portable pass/fail budgets. The deterministic workload legality and the `< 6 MiB` transfer invariant are automated tests. The cancellation result was measured through the real browser Worker boundary in Chromium against the development build; the nine observations were `36.0, 8.1, 7.6, 7.7, 8.6, 8.0, 7.7, 16.2, 7.3` ms, satisfying the `< 50 ms` p95 acceptance rule. Zero persistence is established structurally by the Redux Persist blacklist, the empty derived-scoring reducer state, the migration, and regression tests rather than by a hard-coded benchmark number.

### Persistence and migration

Keep protobuf Build storage unchanged so existing custom Builds and shared Build links preserve their manual weights. Add a Redux Persist version and a one-time migration that:

- preserves uploads, custom Builds, preset enablement, and `Build.subAttributes[].value` manual importance;
- deletes the old derived `fitsAndRarity` cache and unused `build.weights` cache;
- removes `attributeWeights`, `rarityWeights`, `standardRarity`, `scoreOverhead`, `nonFiveStarSubstractor`, and `nonSuitSubstractors`;
- initializes only mechanics assumptions that are genuinely configurable, currently `fourLineStartProbability: 0.20`.

Do not change the IndexedDB root key, because doing so would discard user uploads and custom Builds. If a derived scoring Redux slice is used, explicitly blacklist it from Redux Persist; Worker CDF/PMF caches are never Redux state. Every derived cache key includes an explicit artifact-scoring algorithm version.

Fix Build editing in the same cutover: capture the old Build's enablement before replacing/deleting its id and restore it under the edited Build id. The current reducer reads the enablement only after deletion and can silently disable an edited Build. A migration test and an ordinary edit regression test both cover this invariant.

### Historical v1 UI and URL migration

This records the already completed exact-engine cutover. The simplified UI contract near the top of this document supersedes these presentation defaults; it must migrate them directly rather than maintaining both public scoring systems.

- Rename `Fitness` to `Build Match`.
- Add `Expected +20 Match`; make it the default descending sort.
- Rename `Rarity` to `Prospect Rarity` and display it as a percentile.
- Show P10--P90 and Top-10% Finish Chance in lazy details.
- Allow an optional absolute final-Match target such as 75% in details, using the same conditional PMF; it is not the default gate or sort.
- Bind the card's Expected +20, Prospect Rarity, badge, and default Potential detail to its best-Expected Build; show that Build name beside the metrics.
- When a conservative top-10% target is unavailable because of a large tie, explain that no tie-preserving top-10% cutoff exists instead of displaying `0%`.
- Use current Match `>= 55%` as the default selection/lock gate.
- Show a top-10% badge at Prospect Rarity `>= 90%`; leave the Rarity filter disabled by default.
- Keep on-set compatibility as an independent highlight/filter.
- Remove Build editor `Best Score` / `Difficulty` previews and the global attribute/rarity weight editors. The Build's own substat importance sliders are the only utility weights.

Use a typed query parser with these defaults and units:

```text
match=0.55
prospectEnabled=false
prospect=0.90
sort=expectedFinalMatch-desc
```

`match` and `prospect` accept only finite numbers in `[0, 1]`; `prospectEnabled` accepts only an explicit boolean; and `sort` accepts a closed enum. The serializer may omit values equal to defaults, but enabled state is never inferred merely from the presence of `prospect`. Old `fitness`, logarithmic `rarity=8.5`, `sort=potential-desc`, and `sort=rarity-desc` values have no mathematically valid conversion. Unknown or invalid values fall back to the new defaults; do not add a permanent alias layer.

## Golden test vectors

Tests use a preferred ATK% Sands Build with equal importance for Crit Rate, Crit Damage, Energy Recharge, and Elemental Mastery unless stated otherwise. Its legal denominator is `D_I = 9` in relative weight units, so current Match simplifies to `(8 * preferredMain + V) / 17` where `V` is canonical roll equivalents.

### Canonical display lookup

These artifact-boundary values must be exact:

| Displayed value | Canonical roll points | Compatible roll counts |
|---|---:|---|
| Crit Rate 2.7% | 7 | 1 |
| Crit Rate 3.9% | 10 | 1 |
| Crit Rate 8.6% | 22 | 3 |
| Crit Rate 10.9% | 28 | 3 or 4 |
| Crit Rate 19.4% | 50 | 5 or 6 |
| Crit Rate 23.3% | 60 | 6 |
| DEF% 24.1% | 33 | 4 |
| Energy Recharge 38.9% | 60 | 6 |

The generated lookup test must additionally use full-precision pinned mechanics input and assert that every five-star display key for all ten substats matches the exhaustive fixture and maps to exactly one roll-point total. Generating from the rounded table in this document must fail the fixture.

### Build Match

| Case | Exact Match | Decimal |
|---|---:|---:|
| Preferred main, no useful substats | `8 / 17` | 0.470588235294 |
| Wrong main, perfect legal substats | `9 / 17` | 0.529411764706 |
| Preferred main, two minimum useful lines | `9.4 / 17 = 47 / 85` | 0.552941176471 |
| Preferred main, perfect four-line +20 | `17 / 17` | 1.000000000000 |
| Preferred main, equal-weight perfect three-line-start +20 | `16 / 17` | 0.941176470588 |

The two-minimum-line vector proves the default boundary:

```text
wrong-main maximum 52.9412% < 55% <= two-minimum starter 55.2941%
```

Multiplying every positive importance by the same factor must leave the result unchanged. Changing only level, set, lock state, or equipped character must leave current Match unchanged. An artifact with no legal desired substat returns the preferred-main `8 / 17` or wrong-main zero contribution plus an issue, never `NaN`.

For a preferred-main three-line-start +20 artifact whose four maximum useful lines have weights `1.0, 0.5, 0.5, 0.5`, the exact build-specific ceiling is:

```text
[8 + 9 * (2.5 + 4) / (2.5 + 5)] / 17 = 79 / 85 = 0.929411764706
```

This regression prevents the equal-weight `16 / 17` upper bound from being applied to every Build.

### Four-line +0 Potential

Fixture: minimum Crit Rate and minimum Crit Damage, plus two dead lines.

```text
Current Match                 = 47 / 85       = 0.552941176471
Expected +20 Match            = 461 / 680     = 0.677941176471
Best reachable Match          = 72 / 85       = 0.847058823529
P(no score improvement)       = (2 / 4)^5     = 1 / 32
P(best reachable)             = (2 / 16)^5    = 1 / 32768
```

The PMF-derived expectation must equal `461 / 680` within numeric tolerance.

### Three-line pre-reveal Potential

Fixture: minimum Crit Rate, minimum Crit Damage, and dead HP%, with preferred ATK% main. The remaining fourth-line type weight is 750; desired EM plus ER contributes 200, so useful reveal probability is `4 / 15`.

```text
Current Match                 = 47 / 85       = 0.552941176471
Expected +20 Match            = 1733 / 2550   = 0.679607843137
Best reachable Match          = 72 / 85       = 0.847058823529
P(no score improvement)       = 11 / 240
P(best reachable)             = 27 / 327680
```

Changing the population four-line-start assumption from 0.20 to any other valid value must not change this Potential distribution.

### One event remaining

A +16 four-line artifact with one maximum Crit Rate roll equivalent and three dead lines has this complete final distribution:

| Final Match | Probability |
|---:|---:|
| `9 / 17 = 0.529411764706` | `3 / 4` |
| `9.7 / 17 = 0.570588235294` | `1 / 16` |
| `9.8 / 17 = 0.576470588235` | `1 / 16` |
| `9.9 / 17 = 0.582352941176` | `1 / 16` |
| `10 / 17 = 0.588235294118` | `1 / 16` |

Expected +20 is `737 / 1360 = 0.541911764706`. Under the inverse-CDF convention, P10 and median are `9 / 17`, while P90 is `9.9 / 17`.

### Distribution and Rarity invariants

- Every PMF and population distribution has nonnegative probability and total mass one.
- PMF expectation equals the closed-form expectation.
- With nonnegative importance, every final outcome is at least current Match.
- Expected +20 lies between current and best reachable Match.
- At +20, current Match, Expected +20, P10, median, P90, and best reachable are identical.
- A four-line artifact with no useful lines may have many mechanical paths but one scoring state.
- Population mean Expected +20 is identical across milestones within exact numeric tolerance; this is the law of total expectation regression test.
- For a synthetic support with quality/probability `{0.4: 0.1, 0.3: 0.2, 0.2: 0.7}`, quality 0.3 has inclusive tail 0.3 and percentile 0.7; the conservative top-10% target is 0.4. The ordinary inverse-CDF P90 is 0.3, proving the two concepts are not interchangeable. The maximum percentile is 0.9, not 1.0, because its own mass is included.
- When available, the conservative top-10% target has inclusive finished survival `<= 0.10`; the immediately lower support value, when present, has survival `> 0.10`.
- A fixed-main Flower population for a Build with no legal desired substats collapses to one quality atom of mass one. `TopTenFinishResult` is `unavailable` with `TOP_DECILE_CUT_NOT_REACHABLE`, not a fabricated target or zero chance.

### Integration and migration tests

- A four-star artifact returns `unsupported` and is not silently penalized.
- On-set and off-set copies of the same five-star stats return identical scoring results.
- A stale `summaryComplete`, Prospect chunk, or Potential chunk cannot overwrite a newer request id, and cancellation is acknowledged while preserving the long-lived Worker's unrelated caches.
- Lazy requests with the correct `datasetId` but an old `summaryKey` are rejected after Build reorder or edit, so a numeric `PairRef` cannot bind to a different Build snapshot.
- A conservative-top-ten Potential request requires a source profile and returns a required `TopTenFinishResult`; a malformed runtime message returns `INVALID_WORKER_REQUEST`. An absolute-match request for 75% returns its target and probability without a population profile.
- Editing a Build importance changes all relevant profile keys. Changing only the four-line-start assumption changes current/finished `populationKey` and `topTenFinishKey`, but not `summaryKey`, `potentialDetailKey`, or `absoluteFinishKey`.
- A +0, +12, and +20 artifact/build pair all derive their conservative finish target from `finishedPopulationKey` at milestone 20; only Prospect Rarity uses the artifact's current milestone.
- Persisted uploads, custom Builds, and enablement survive migration; old derived caches and obsolete scoring controls do not.
- Editing an enabled Build preserves its enablement under the edited id.
- Derived summary, CDF, and PMF data offer zero bytes to Redux Persist/IndexedDB.
- Typed query parsing defaults invalid legacy sort/filter values to `match=0.55`, `prospectEnabled=false`, `prospect=0.90`, and `sort=expectedFinalMatch-desc`.
- The default selection gate rejects every wrong-main artifact and includes the two-minimum-useful-line starter.

Use Node's built-in `node:test` and `node:assert/strict` through the already installed `tsx` runtime. Add a focused command such as:

```text
npx tsx --test tests/artifact-scoring/*.test.ts
```

Pure integer/rational tests should use exact equality where practical. Public score/probability assertions use absolute tolerance `1e-12`; canonical protobuf percentage-key round trips use the scaled `1e-4` boundary tolerance above. No wider ad hoc tolerance is permitted.

## Implementation sequence and verification gates

1. Canonicalization and Build Match: write the display lookup and golden tests first; replace no callers until they pass.
2. Expected +20 and lazy Potential: prove the closed-form/PMF equality and the three-line reveal cases.
3. Prospect Rarity: implement exact population CDFs, tie policy, the possibly-unavailable conservative top-10% target, cache signatures, and the full-workload benchmark.
4. Cut over the worker, Redux result shape, persistence migration, filters, labels, and cards in one controlled pass; delete the obsolete formulas and settings rather than keeping two scoring systems.
5. Verify focused scoring tests, the production build, one GOOD import, one Mona import, default filtering, Potential sorting, lazy details, cache invalidation, and worker cancellation.

Raw Acquisition Odds are a secondary follow-up after the primary Match/Potential/Rarity cutover. They reuse the compatible-history lookup, but are not required to ship the new quality model and must never block the default discovery workflow.
