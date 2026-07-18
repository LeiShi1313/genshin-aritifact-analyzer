# Artifact Evaluation

This context describes how artifacts are compared with character builds and how their present and future value is communicated.

## Language

**Build Match**:
A linear measure of the useful value an artifact has already realized for a build. It uses one absolute five-star +20 ceiling at every enhancement level. A 100% Build Match represents a preferred main stat and the maximum legal desired-substat outcome for a four-line-start artifact: four maximum-tier starting rolls and five maximum-tier enhancement rolls.
_Avoid_: Fitness, fit score

**Match Ceiling**:
The fixed reference outcome used to normalize Build Match. Enhancement level does not redefine this ceiling, so raising an artifact without changing its stats cannot increase or decrease its Build Match.
_Avoid_: Current-level maximum, level-adjusted score

**Main-stat Preference**:
A main stat preferred by a build. An artifact with a different main stat remains matchable, but its Build Match is lower.
_Avoid_: Main-stat requirement, valid main stat

**Substat Roll Equivalent**:
The unique total of nominal 0.7/0.8/0.9/1.0 tier values compatible with an observed in-game displayed substat total. The lookup is generated from exact five-star tiers and display corrections, so one maximum-tier roll is exactly one roll equivalent without dividing rounded exports.
_Avoid_: Average-roll division, direct displayed-value division

**Substat Importance**:
A manual, build-specific relative weight for the value of one maximum roll. Only ratios between a build's weights matter. Stat acquisition rarity is not part of this weight, and there are no hidden stat-type multipliers.
_Avoid_: Roll probability, global Crit multiplier

**Expected +20 Match**:
The probability-weighted Build Match an artifact is expected to have at +20, calculated from its observed stats and the exact distribution of its remaining reveals, upgrade targets, and roll tiers. At +20 it equals Build Match.
_Avoid_: Best-case potential, current-level normalization

**Prospect Rarity**:
The percentile rank of an artifact's Expected +20 Match among ordinary five-star artifacts with the same build, position, and enhancement milestone. At +0 it measures upgrade potential; at +20 it measures finished quality. A 90% Prospect Rarity means the artifact is more promising than about 90% of its comparison population.
_Avoid_: Exact-state rarity, cross-level rarity

**Acquisition Odds**:
An optional estimate of how often an observed artifact state, or a state at least as extreme, occurs under the artifact-generation mechanics. Acquisition Odds can explain an unusual roll history, but they are not the primary quality rating because equally likely roll tiers and upgrade targets can produce very different Build Match.
_Avoid_: Using `1 in N` as the primary quality sort

**Top-10% Finish Chance**:
The conditional probability that an observed artifact will reach the lowest finished +20 Build Match whose inclusive population tail is no larger than 10% for its build and position. This tie-preserving target is stricter than an ordinary P90 and can be unavailable when the best score itself occurs more than 10% of the time.
_Avoid_: Best-case ceiling, fixed 75% success target

## Build Match Model

Build Match reserves eight units for the main stat and nine units for substats. The main-stat share is therefore `8 / 17`, and the substat share is `9 / 17`.

For each legal desired substat, its realized value is its maximum-roll equivalents multiplied by its manual Substat Importance. The substat result is normalized by the best legal four-line outcome for that build: its four highest legal starting-line weights plus five upgrades into its highest-weight line. More than four desired substats add optionality without enlarging the ceiling.

An artifact with a non-preferred main stat receives no main-stat units but retains its substat contribution. Its theoretical Build Match ceiling is therefore `9 / 17`, or about 52.9%.

The default minimum Build Match is 55%. This excludes every wrong-main artifact while including a typical +0 artifact with a preferred main and at least two meaningfully weighted useful lines.

The ceiling is absolute rather than start-relative. A three-line-start artifact has only eight total substat rolls, so its best result is at most `16 / 17`, or about 94.1%; equality requires four equally weighted top substats, and narrower or unequal-weight builds have a lower build-specific ceiling. Normalizing that artifact separately to 100% would make identical final stats score differently based on an acquisition history that imports do not preserve.

## Potential Model

Potential is the exact conditional distribution of the artifact's final +20 Build Match. The primary value is Expected +20 Match; the interface should also expose a useful uncertainty range such as the 10th-to-90th percentiles. Remaining upgrade targets, roll tiers, and a possible fourth-line reveal are enumerated according to their game probabilities. Best-case Match is not used as the primary Potential value because it overvalues outcomes with negligible probability.

The default Potential aid is Top-10% Finish Chance when a tie-preserving top-10% target exists; otherwise the interface explains why that target is unavailable. An absolute target such as 75% Build Match may remain configurable, but it is not the default policy.

## Rarity Model

Rarity is Prospect Rarity: a stage-relative percentile based on Expected +20 Match. The comparison population uses ordinary five-star artifacts with the same build, position, and enhancement milestone. This keeps +0 prospects comparable with other +0 prospects and +20 finished artifacts comparable with other +20 artifacts.

With multiple Builds enabled, the card's Prospect Rarity is evaluated for the same Build that gives the artifact its highest Expected +20 Match. Taking the maximum percentile across Builds is avoided because it would make the nominal top-10% label more common as Builds are added.

A top-10% badge therefore means top 10% within the Build named on that card, not top 10% of a joint population across every enabled Build.

The default rare threshold is the top 10%, expressed as Prospect Rarity of at least 90%. This threshold retains promising +0 artifacts with two useful starting lines while still identifying a selective population.

Raw exact-state probability is not the primary Rarity rating. Minimum- and maximum-tier rolls have equal probability, and an upgrade hitting a useful or useless line has the same target probability; raw likelihood therefore measures unusualness rather than quality. Acquisition Odds may be shown as secondary information.

Potential can be computed entirely from an observed artifact without assuming a population-wide four-line-start rate. Prospect Rarity does require such a population prior. Until a primary source establishes that rate, use a configurable, visibly documented default four-line-start probability of 20% rather than presenting it as a confirmed game constant.
