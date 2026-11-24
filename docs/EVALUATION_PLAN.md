# AutiConnect evaluation plan

## Research questions

- Does reviewed long-term memory improve grounding and relevance beyond static preferences?
- Can a fitted preference model outperform simple history baselines, and does updating it improve performance after a preference change?
- Does shared context produce consistent behaviour across chat and daily planning while respecting scopes and corrections?
- If M11 runs, can an adapter improve grounding or format adherence at an acceptable cost?

## Comparative conditions

| Condition | Available context | What to compare |
| --- | --- | --- |
| **A · Generic LLM** | Same task, base model and bounded current-turn context for all suitable cases. | Reference response behaviour and latency. |
| **B · Static preferences** | A plus the task's matching confirmed format setting, if present. | Effect of explicit static settings relative to A. |
| **C · Reviewed memory and RAG** | B plus the same eligible memory collection and agreed retrieval pipeline. | Added effect of long-term memory and retrieval relative to B. |
| **D · RAG and incremental preference model** | C plus an eligible account model estimate, subject to confirmed settings and abstention. | Additional effect of learned adaptation relative to C. |
| **E · Optional fine-tuned LLM** | Identical to C, including the same retrieved evidence, with a synthetic or appropriately approved adapter on the same base model. | C versus E isolates the adapter. A, C and E form the base, RAG and RAG-plus-adapter comparison. |

Use paired synthetic tasks for each comparable condition. Fix the base model revision, task prompt, synthetic conversation history, decoding settings and scoring rubric. Keep gold evidence and choice labels outside the runtime prompt. Conditions with retrieval share the same index state and evidence budget. Keep confirmed settings identical across B–E. Include cases with and without confirmed settings so the added value of estimates and the override rule can both be tested.

Construct held-out task and conversation families covering no relevant memory, irrelevant distractors, expired and superseded records, duplicates, contradictions, corrections, deletion and foreign-account records. Split task templates and near duplicates away from development and adapter training. Pair stable and changing preference streams across conditions. Use the point-in-time and prequential protocols in the [training plan](ML_TRAINING_PLAN.md). A model sees prior feedback only after it becomes available.

## Measures and reporting

| Measure | Definition and denominator |
| --- | --- |
| Memory extraction and retrieval accuracy | Compare typed extracted values and source references with annotated facts. Report precision and recall for extraction. Report retrieval precision@k and recall@k against eligible gold memory IDs, plus obsolete and foreign-owner retrieval counts. Count empty-result tasks independently. |
| Memory retrieval relevance | Grade each eligible hit against the current task and report nDCG@k on tasks with graded evidence. Record the correct abstention rate on tasks with no relevant evidence. |
| Preference prediction accuracy | Report accuracy, macro F1, per-class support, confusion matrix and log loss on held-out independently chosen formats. For the service policy, add coverage and accuracy on served predictions. Compare paired results with frozen starter, majority, recent-choice and other documented baselines. |
| Preference adaptation | Predict before observing each outcome and report performance before and after a scripted shift. Count choices needed to reach a validation-defined recovery criterion, cases that fail to recover and false alarms in stable streams. Compare with a frozen model and recency baseline. |
| Unsupported preference inference | Count turns that assert a personal preference without an eligible confirmed source or that present a model estimate as confirmed, divided by scored turns. Also report the count and example failure categories. |
| Personalisation relevance and response quality | Blind-review paired answers for grounding, effective-format adherence, task completion, relevance of personalisation and unsupported personal claims. Score with a versioned rubric and report disagreements if a second reviewer is available. |
| Cross-module consistency | Report the proportion of matched chat and planning task pairs that apply the same authorised preference and current revision when scope matches. Score intentional scope differences and correction/delete propagation with separate checks. Count cross-account or cross-purpose disclosures. |
| Response latency | Measure request-to-complete-response p50 and p95 by condition. Record retrieval and provider time, warm/cold state, hardware, provider and repetitions. Use the same setup for paired comparisons where possible. |
| Training cost | Record fit and update wall time, CPU/GPU time where applicable, peak memory, artifact size and consumed compute or API cost if available. Report initial and incremental costs separately. |

Set rubric anchors, decision thresholds and sample counts on validation where applicable. Report the fixed protocol, denominators, class and scenario counts, seed and split manifests, artifact versions, paired deltas and illustrative failures. Estimate uncertainty by resampling whole synthetic users or task families when sample sizes support it. A foreign-account disclosure, reappearance of deleted evidence or prohibited inference fails the scripted regression checks independently of mean scores.

## Optional adapter experiment

Use an available base model with suitable licensing and compute, and a versioned LoRA or QLoRA adapter. Train on synthetic or specifically approved examples of format adherence and evidence use. Keep evaluation users, scenario families and personal facts outside adapter training. Compare A, C and E using the same base checkpoint, retrieval for C and E, decoding and rubric. Record adapter configuration, training manifest, base revision, validation procedure, hardware and cost. M13 can report A–D if M11 is infeasible. [Hugging Face PEFT quantization guide](https://huggingface.co/docs/peft/developer_guides/quantization)

## Synthetic and future human evaluation

The initial work tests reproducibility, information isolation, retrieval and model adaptation under controlled simulations. Synthetic preferences and shifts are generator assumptions. Results apply to those settings and cannot establish clinical effectiveness, real-world satisfaction or accessibility for every user.

Future human work would need an appropriate institutional review process, accessible consent and withdrawal, approved data and retention controls, and a separately agreed protocol. That study could evaluate whether people find the controls understandable and personalisation helpful. Report its participant measures separately from the synthetic benchmark.

**M0 status.** Conditions, metrics and limitations are specified. No training or evaluation results have been measured.
