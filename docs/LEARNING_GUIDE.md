# AutiConnect learning guide

A synthetic user may choose a checklist for planning and numbered steps for learning. The project tests whether AutiConnect can remember a confirmed choice, learn from repeated choices and use that evidence appropriately.

## AI and learning

| Concept | Plain-language meaning | In AutiConnect |
| --- | --- | --- |
| Artificial intelligence | A broad term for techniques that perform tasks such as interpreting language, finding relevant information and making predictions. | The LLM reads and writes language, memory search finds evidence, and a separate classifier predicts format. |
| Machine learning | Fitting a model to examples so its future predictions depend on patterns in those examples. | The classifier learns which formats users choose in different contexts and how recent choices relate to later ones. |
| Model training and inference | Training adjusts a model's parameters using examples. Inference uses the fitted parameters to predict an answer for a new input. | A background command updates a candidate. Chat reads the active version to estimate a format for the current task. |
| Feature engineering | Turning raw observations into consistent measurements the model can use. | A recent checklist count and a planning task category are features. Use only choices that were already available at prediction time. |
| Supervised learning | Learning from examples that pair inputs with a known outcome, called a label. | The label is the independently selected format. A record might pair a planning task and recent choices with a newly selected checklist. |
| Incremental learning | Updating a fitted model with batches of new examples. | `partial_fit` changes the parameters of an account candidate. An evaluation gate checks the candidate before it can serve. [scikit-learn SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html) |
| Concept drift | The relationship between inputs and outcomes changes over time. | A synthetic user may switch from numbered steps to checklists. Drift tests measure how quickly a candidate recovers and how often the detector signals change during stable periods. |

## Language and memory

| Concept | Plain-language meaning | In AutiConnect |
| --- | --- | --- |
| Large language model | A model trained to process and generate language. | A provider adapter uses it to propose memory candidates and construct responses. The initial system uses pretrained LLM weights. |
| Embeddings | Lists of numbers representing content so a system can compare likely similarity. | The encoder maps a task query and reviewed memory into comparable vectors. A similarity score helps rank candidates. |
| Vector database | A database that stores and searches those numeric representations. | PostgreSQL uses pgvector to compare embeddings after filtering by owner, scope and memory validity. [pgvector](https://github.com/pgvector/pgvector) |
| Retrieval-augmented generation (RAG) | Finding relevant information and including it in the input to a generator. | Relevant confirmed memories and preferences can guide the LLM when answering a task. A correction changes what retrieval can find. |
| Long-term AI memory | Saved information that the application can use again in a future interaction. | Reviewed facts, episodes, procedures, preferences and goals live in user-controlled records. Working memory covers the current session. |
| Fine-tuning | Further training a pretrained model, or a small added part of it, on examples for a specific behaviour. | The optional experiment could improve adherence to a requested format or use of provided evidence. Personal facts stay in the retrieval store. |
| LoRA and QLoRA | LoRA trains small added weights while holding the base model fixed. QLoRA uses a lower-precision base model to reduce memory use during that training. | M11 may compare a LoRA or QLoRA adapter with the same base model and retrieved evidence. [Hugging Face PEFT quantization guide](https://huggingface.co/docs/peft/developer_guides/quantization) |

## Evaluation

| Concept | Plain-language meaning | In AutiConnect |
| --- | --- | --- |
| Model evaluation | Measuring performance on examples that did not fit the model, alongside a baseline and checks for mistakes. | Held-out format choices show accuracy, coverage and recovery after change. Separate retrieval tests check whether the correct current memory was selected. Timings and failure cases help interpret the scores. |

A single interaction can use all three layers. A reviewed memory can supply evidence for a response. A classifier may estimate a format if enough information exists. A confirmed format controls the final choice. A consented independent selection can become a future training example. See the [AI design](AI_ARCHITECTURE.md) and [evaluation plan](EVALUATION_PLAN.md) for how those steps are tested.
