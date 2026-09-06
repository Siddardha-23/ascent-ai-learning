# Ascent: your 30-day AI learning curriculum

For Harshith and Aparna · Prepared 5 September 2026

You already bring Python, Flask, APIs, cloud familiarity and some container knowledge. This course connects those skills to AI one layer at a time. A 'day' is a learning unit; pause, split it into sessions and resume whenever you have time. Core estimates total **82.5 hours** (usually 2.5–3 hours per unit). Optional papers, full courses, difficult setup and extension projects add time. A 30-minute session is useful: continue the same unit rather than skipping ahead.

This is a strong practical foundation with advanced topics introduced honestly. It cannot make anyone an expert in every AI discipline in thirty units. The objective is to explain, build, measure and improve useful systems, with evidence of what you can do.

## Your project

Build **Atlas Support**, a fictional software support assistant. It begins as a keyword search program, becomes a cited RAG service, adds tools and LangGraph approvals, and ends as a measured, deployable prototype. The included fictional corpus and evaluation fixtures are for learning only. Baseline labs need no model API or GPU. Use one provider for core live calls and one cloud for deployment; compare other providers architecturally. The learning portal itself must not require an LLM key.

## How to use each day

1. Recall what the previous unit added (10 minutes).
2. Read the bridge and explanation, then the selected core source sections (about 40 minutes). Other links are references, alternatives or optional research.
3. Build the lab (60–110 minutes, depending on the unit).
4. Run the checks and write a short evidence note (20 minutes together with reflection).
5. Answer the checkpoint before opening its explanation. Revisit the prerequisite if the answer feels unfamiliar.

Core completion means doing the required tasks, recording evidence, attempting the checkpoint and reflecting. Clicking a video link alone is not hands-on mastery. If you use a mock or cannot execute a paid/hardware-dependent lab, record that explicitly; do not mark an unrun experiment as verified.

## Course map

| Day | Learning unit | Core estimate |
|---|---|---|
| 1 | Connect your backend knowledge to AI | 120 min |
| 2 | The math behind a prediction, without the mystery | 150 min |
| 3 | Train and evaluate your first machine-learning model | 150 min |
| 4 | Neural networks, weights and backpropagation | 180 min |
| 5 | Deep learning beyond chat | 150 min |
| 6 | Tokens, language modeling and context limits | 150 min |
| 7 | Build the core of a transformer | 180 min |
| 8 | Model lifecycle and the Hugging Face ecosystem | 150 min |
| 9 | Call models like a backend developer | 180 min |
| 10 | Prompting, context engineering and reliable answers | 150 min |
| 11 | Embeddings and semantic search | 150 min |
| 12 | Vector indexes, databases and document ingestion | 180 min |
| 13 | Build a cited RAG assistant | 180 min |
| 14 | Improve retrieval with measured experiments | 180 min |
| 15 | Knowledge graphs from first principles | 150 min |
| 16 | GraphRAG: when relationships improve retrieval | 150 min |
| 17 | Build a tool-using agent in plain Python | 180 min |
| 18 | LangChain with understanding | 150 min |
| 19 | LangGraph: state, nodes, edges and checkpoints | 180 min |
| 20 | Memory and context that stay useful | 150 min |
| 21 | Durable agents and human approvals | 180 min |
| 22 | MCP, A2A and multi-agent systems | 180 min |
| 23 | Evaluate agents and inspect their traces | 180 min |
| 24 | Enterprise architecture, security and governance | 180 min |
| 25 | Caching, latency, cost and scaling | 180 min |
| 26 | Multimodal, voice and document agents | 150 min |
| 27 | Fine-tuning and efficient models | 180 min |
| 28 | Deploy one agent and understand three clouds | 180 min |
| 29 | Capstone: prove the system works | 180 min |
| 30 | Explain, redesign and invent | 150 min |

## Milestones

- **Day 8:** explain weights, training, tokens and attention; run and inspect small models.
- **Day 16:** build retrieval and cited answers; justify when vectors or graphs help.
- **Day 23:** build bounded tools, LangChain/LangGraph workflows, memory and evaluations.
- **Day 30:** demonstrate a tested prototype, explain deployment and design a new experiment.

## Day 01 — Connect your backend knowledge to AI

**Stage:** Foundations · **Core estimate:** 120 minutes · **Prerequisite:** Your existing Python/API familiarity

### Connect to what you know

You already understand Python functions, Flask routes, requests and responses. Keep that model: an AI model is another component behind an API, with different failure modes.

### Understand it

AI is a broad field of systems that perform tasks requiring intelligent behavior. Machine learning learns patterns from examples; deep learning uses multilayer neural networks; generative models produce new content. An LLM predicts language tokens. An agent combines a model with tools and a controlled execution loop. A predictable rules engine remains a good choice for fixed policies. Our project is Atlas Support: it will answer questions about a fictional software service and draft support tickets.

**Real-world connection:** A Flask refund endpoint follows your rules. A classifier predicts a ticket category. A language model writes a reply. An agent looks up a policy and proposes an action. These are four different responsibilities.

**Topics:** AI vs ML vs deep learning vs generative AI; discriminative vs generative models; inference vs training; workflow vs agent; Python environments, typing, testing, JSON.

### By the end, you should be able to

- Explain where a model fits in a normal web request.
- Separate an uncertain prediction from an authorized action.
- Create a reproducible project and baseline before adding AI.

### Read or watch with a purpose

- **Core:** [Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course/) — Google. Select the module matching today's topic; use the exercises, not the whole course.
- **Core:** [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — Anthropic. Read workflows versus agents and the pattern relevant to today's lab.
- **Reference / optional:** [The Python Tutorial](https://docs.python.org/3/tutorial/) — Python Software Foundation. Use only unfamiliar sections: environments, errors, modules and classes.
- **Reference / optional:** [Prerequisites and prework](https://developers.google.com/machine-learning/crash-course/prereqs-and-prework) — Google ML Crash Course. Use the math, NumPy and pandas refreshers only when needed.

### Hands-on lab

1. Create a Python environment, Git repo and folders data/, labs/, app/, evals/. Record Python and package versions. Start with the supplied standard-library baseline lab.
2. Load the supplied fictional support corpus and golden questions. Keep development and final holdout splits separate; never tune against holdout results.
3. Implement or run the keyword retrieval baseline. Return a document ID and an explicit no-match response; do not generate an answer yet.
4. Write one paragraph mapping browser → Flask/API → retrieval/model/tool → response. Save baseline recall and a list of questions the baseline misses.

**Save:** labs/day-01/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Baseline runs without API keys or a GPU.
- [ ] Every dataset record has a stable ID; development and holdout IDs do not overlap.
- [ ] You can explain why retrieval success is not the same as a correct answer.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** A customer asks for an exception to a refund rule. Should the model decide and execute it?

<details><summary>Reveal the explanation after answering</summary>

No. The model can interpret the request or draft a recommendation; application policy and any required human approval authorize the action. An agent's proposed tool call is not permission.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Refine pytest fixtures, Pydantic validation and async HTTP clients if those Python concepts are unfamiliar. Complete only the needed refresher sections.

## Day 02 — The math behind a prediction, without the mystery

**Stage:** Foundations · **Core estimate:** 150 minutes · **Prerequisite:** Day 1; earlier ideas remain available for review

### Connect to what you know

Python lists become vectors; nested lists become matrices. Start with arithmetic and array shapes, then attach mathematical names.

### Understand it

A scalar is one number, a vector an ordered list, a matrix a table, and a tensor the generalization to more dimensions. A weighted sum combines features. Probability represents uncertainty; a distribution lists possible outcomes and their probabilities. A derivative measures how a small input change affects an output, and a gradient collects those rates for many parameters. These concepts will reappear as embeddings, weights, loss and training.

**Real-world connection:** Predicting delivery time can start with distance × a learned coefficient plus preparation time. Training adjusts the coefficient when predictions are wrong.

**Topics:** vectors, matrices, tensors and shapes; dot products and norms; mean, variance, probability and conditional probability; logarithms, entropy intuition; derivative, gradient and loss.

### By the end, you should be able to

- Compute a weighted sum and explain each term.
- Distinguish tensor shape from tensor values.
- Use a loss curve to describe whether learning is improving.

### Read or watch with a purpose

- **Core:** [Dot products and duality](https://www.3blue1brown.com/lessons/dot-products/) — Grant Sanderson / 3Blue1Brown. Watch the numerical/geometric dot-product explanation; duality is optional. [Original video](https://www.youtube.com/watch?v=LyGKycYT2v0).
- **Core:** [NumPy: the absolute basics for beginners](https://numpy.org/doc/stable/user/absolute_beginners.html) — NumPy. Read creating arrays, shapes, indexing and basic operations; reproduce the examples.
- **Reference / optional:** [Gradient descent, how neural networks learn](https://www.3blue1brown.com/lessons/gradient-descent/) — Grant Sanderson / 3Blue1Brown. Watch the visual explanation; pause to sketch a loss curve and one gradient step. [Original video](https://www.youtube.com/watch?v=IHZwWFHWa-w).
- **Reference / optional:** [Linear regression](https://developers.google.com/machine-learning/crash-course/linear-regression) — Google ML Crash Course. Read the model and loss sections; connect each term to the delivery-time experiment.

### Hands-on lab

1. Represent five delivery examples as a NumPy matrix with distance and queue size. Define y_hat = X @ w + b and print all shapes.
2. Calculate mean squared error by hand on three predictions and check it in Python.
3. For a single weight, estimate the derivative using small positive and negative perturbations; take a step in the direction that reduces loss.
4. Plot loss for several weight values; write why a learning rate that is too large can overshoot. Explain probabilities [0.7,0.2,0.1] without treating 0.7 as certainty.

**Save:** labs/day-02/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Manual and NumPy weighted sums agree within a stated floating-point tolerance.
- [ ] At least one small gradient step reduces the toy loss.
- [ ] A deliberately incorrect matrix shape produces an understandable explanation and fix.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Are weights hand-written importance scores, and is a tensor necessarily a GPU object?

<details><summary>Reveal the explanation after answering</summary>

Usually weights are parameters learned during training; they are not necessarily human-interpretable feature importance. A tensor is a multidimensional numerical array and can live on a CPU or GPU.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Study chain rule and cross-entropy with a two-class example. Optional: implement stable softmax by subtracting the maximum logit.

## Day 03 — Train and evaluate your first machine-learning model

**Stage:** Foundations · **Core estimate:** 150 minutes · **Prerequisite:** Day 2; earlier ideas remain available for review

### Connect to what you know

You have a prediction function and loss. Now separate learning from checking whether the learned rule generalizes.

### Understand it

Supervised learning uses labeled examples; unsupervised learning searches for structure without those labels. Regression predicts numbers and classification predicts categories. A train split fits parameters, validation supports choices, and a held-out test checks the final choice. Leakage lets information from evaluation sneak into training. Accuracy can conceal failures on rare classes, so compare precision, recall and F1. Tiny toy results demonstrate mechanics, not production readiness.

**Real-world connection:** A spam classifier that calls everything 'not spam' can look accurate when spam is rare, while failing at its purpose.

**Topics:** train/validation/test and leakage; linear/logistic regression, trees, clustering; precision, recall, F1 and confusion matrix; overfitting, regularization and cross-validation; class imbalance and calibration.

### By the end, you should be able to

- Train a simple classifier and compare it with a trivial baseline.
- Explain false positives and false negatives in business terms.
- Identify leakage before trusting a score.

### Read or watch with a purpose

- **Core:** [Metrics and scoring: quantifying the quality of predictions](https://scikit-learn.org/stable/modules/model_evaluation.html) — scikit-learn. Read classification metrics and confusion matrix; consult precision/recall/F1 definitions.
- **Core:** [Classification](https://developers.google.com/machine-learning/crash-course/classification) — Google ML Crash Course. Study thresholds, confusion matrices, accuracy, precision and recall.

### Hands-on lab

1. Use scikit-learn's built-in breast-cancer dataset only as a numerical classification exercise, not a medical application. Split with stratification and a fixed seed.
2. Train a DummyClassifier and a scaling-plus-logistic-regression pipeline. Fit preprocessing on training data only.
3. Report confusion matrix, precision, recall and F1 on a validation split. Vary a threshold and document the error tradeoff.
4. Freeze the chosen setup and evaluate the untouched test once. Add a deliberately leaked experiment in a separate notebook and explain why its flattering score is invalid.

**Save:** labs/day-03/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The baseline and learned model use the same held-out examples.
- [ ] The pipeline prevents fitting a scaler on test data.
- [ ] Your report gives sample counts and acknowledges the exercise is not clinical validation.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** A preprocessing scaler was fitted before splitting the dataset. Is the test result clean?

<details><summary>Reveal the explanation after answering</summary>

No. Information about the test distribution influenced preprocessing. Fit the scaler on training data within the pipeline and rerun the evaluation.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Compare a decision tree, k-means and an anomaly detector conceptually; implement one only after the supervised workflow is clear.

## Day 04 — Neural networks, weights and backpropagation

**Stage:** Foundations · **Core estimate:** 180 minutes · **Prerequisite:** Day 3; earlier ideas remain available for review

### Connect to what you know

A neural network extends the weighted sums from day 2. The training discipline from day 3 still applies.

### Understand it

A neuron combines inputs with weights and a bias, then an activation introduces nonlinearity. Layers compose those transformations. A forward pass produces predictions; loss measures errors; backpropagation computes gradients; an optimizer updates parameters. Batch size, epochs and learning rate describe training choices. A model's stored weights differ from the activations computed for each input.

**Real-world connection:** Think of a mixing desk: weights are adjustable controls. The sound produced for one song is an activation. Training uses an error signal to adjust controls; inference plays through the current settings.

**Topics:** perceptron, layers, activations and MLP; forward pass, loss, backward pass, optimizer; autograd, gradient accumulation and zero_grad; epochs, batches, learning rate; parameters vs activations.

### By the end, you should be able to

- Train a tiny nonlinear model on CPU.
- Inspect a weight before and after optimization.
- Explain each line of a training loop.

### Read or watch with a purpose

- **Core:** [But what is a Neural Network?](https://www.3blue1brown.com/lessons/neural-networks/) — Grant Sanderson / 3Blue1Brown. Watch the introduction and calculate one neuron by hand. [Original video](https://www.youtube.com/watch?v=aircAruvnKk).
- **Core:** [What is backpropagation really doing?](https://www.3blue1brown.com/lessons/backpropagation/) — Grant Sanderson / 3Blue1Brown. Watch after gradient descent; explain gradients versus optimizer updates.
- **Reference / optional:** [Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/intro.html) — PyTorch. Open only today's sections: tensors, autograd, optimization, then save/load.

### Hands-on lab

1. Watch the neural-network explanation, then build a two-layer PyTorch MLP for XOR or a small synthetic classification dataset.
2. Print parameter shapes and count trainable values. Record the initial prediction and loss.
3. Implement zero_grad → forward → loss → backward → optimizer.step. Plot training loss and separate validation loss.
4. Remove the nonlinear activation and compare the result. Save weights, reload them, switch to evaluation mode and verify the same input produces matching outputs within tolerance.

**Save:** labs/day-04/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Your code shows a real parameter update.
- [ ] You can explain why nonlinear layers are needed for XOR.
- [ ] Saved and reloaded model results agree; validation data was not used for gradients.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does calling backward() by itself train the model?

<details><summary>Reveal the explanation after answering</summary>

It calculates gradients. An optimizer step applies an update. Gradients also need appropriate clearing between training steps.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Implement the derivative for one weight by hand and compare to autograd. Study dropout, normalization and residual connections as preparation for transformers.

## Day 05 — Deep learning beyond chat

**Stage:** Foundations · **Core estimate:** 150 minutes · **Prerequisite:** Day 4; earlier ideas remain available for review

### Connect to what you know

You now understand layers and training. Different architectures add structure for different kinds of data.

### Understand it

A CNN exploits local patterns in images. RNNs process sequences through recurrent state; transformers use attention, which you build on day 7. Autoencoders reconstruct inputs through a compressed representation. Diffusion models learn denoising and can generate samples by repeatedly removing noise. Reinforcement learning learns behavior from rewards through interaction, rather than simply matching labels. This is an orientation to families of models, not a promise to train each family today.

**Real-world connection:** An image classifier says what an image contains. An image generator creates one. A recommender ranks items. A robot policy chooses actions. Choosing a model begins with the output your product needs.

**Topics:** CNNs and computer vision; RNN/LSTM and sequence models; autoencoders, VAEs and GAN overview; diffusion and denoising; reinforcement learning: state, action, reward, policy; recommendation and anomaly detection.

### By the end, you should be able to

- Match six real-world tasks to plausible model families.
- Distinguish prediction, generation and sequential decision making.
- Explain a denoising experiment without confusing it with a trained generator.

### Read or watch with a purpose

- **Core:** [Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/intro.html) — PyTorch. Open only today's sections: tensors, autograd, optimization, then save/load.
- **Core:** [Unit 1: An Introduction to Diffusion Models](https://huggingface.co/learn/diffusion-course/unit1/1) — Hugging Face. Read 'What Are Diffusion Models?'; notebooks are optional after checking hardware.
- **Reference / optional:** [Welcome to the Deep Reinforcement Learning Course](https://huggingface.co/learn/deep-rl-course/en/unit0/introduction) — Hugging Face. Use the orientation and syllabus only; full training exercises are optional.

### Hands-on lab

1. Take a small grayscale image from a built-in dataset or generate a checkerboard. Add Gaussian noise at three strengths and visualize it.
2. Apply a simple convolution filter and inspect how local patterns change. Label this as an image-processing demonstration, not trained AI.
3. Create an architecture decision table for defect detection, demand forecasting, product recommendation, image creation, chat support and robot control.
4. Read the diffusion introduction and draw the forward noise / learned reverse process. Save a note distinguishing the filter you ran from a learned denoiser.

**Save:** labs/day-05/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Each task is mapped to its data, target output and evaluation measure.
- [ ] The notebook labels non-learning operations accurately.
- [ ] You can explain why a reward is not automatically a reliable definition of desired behavior.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does every generative AI system predict text tokens?

<details><summary>Reveal the explanation after answering</summary>

No. Text LLMs commonly generate autoregressively over tokens, while other generative systems can use diffusion, latent-variable models or other mechanisms over images, audio and other data.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Train a small image classifier or follow one diffusion notebook after checking hardware requirements. Optional deeper branches: GNNs, time series, causal inference and robotics.

## Day 06 — Tokens, language modeling and context limits

**Stage:** Foundations · **Core estimate:** 150 minutes · **Prerequisite:** Day 5; earlier ideas remain available for review

### Connect to what you know

You know classification probabilities. A basic language model predicts a distribution over the next text unit.

### Understand it

A token is a unit chosen by a tokenizer: it can be a word, a subword, punctuation or bytes. Token IDs index a vocabulary; they are not word meanings. Byte-pair encoding merges frequent symbol sequences. A language model repeatedly predicts a next token; decoding chooses from its scores. Input, output and sometimes reasoning or tool-related usage have provider-specific accounting. A context window is finite; it is not a permanent memory or a guarantee that every included fact will be used.

**Real-world connection:** Packing a travel bag is a useful analogy: instructions, user input, retrieved pages and tool results compete for limited room. Different tokenizers pack the same text differently.

**Topics:** tokens, token IDs and vocabulary; BPE, WordPiece and Unigram overview; logits, softmax and next-token prediction; context window, input/output budgets and truncation; temperature, top-p and token usage.

### By the end, you should be able to

- Measure tokens instead of assuming words equal tokens.
- Build a tiny next-character model to reveal the generation loop.
- Make an explicit context budget.

### Read or watch with a purpose

- **Core:** [Tokenization algorithms](https://huggingface.co/docs/transformers/main/tokenizer_summary) — Hugging Face Transformers. Read word, character and subword tokenization; compare BPE, WordPiece and Unigram conceptually.
- **Core:** [LLM Course: Introduction](https://huggingface.co/learn/llm-course/chapter1/1) — Hugging Face. Read the introduction, ecosystem and prerequisites; select later sections as needed.
- **Reference / optional:** [Transformers, the tech behind LLMs](https://www.3blue1brown.com/lessons/gpt/) — Grant Sanderson / 3Blue1Brown. Watch the token-to-next-token overview, embeddings and softmax/temperature sections. [Original video](https://www.youtube.com/watch?v=wjZofJX0v4M).

### Hands-on lab

1. Using a Hugging Face tokenizer, encode and decode English, Python code, a long number and text in another language. Record differences from whitespace word counts.
2. Train a character bigram count model on the fictional corpus; generate text with a fixed seed. Label it a toy model with no reliable factual understanding.
3. Create a context-budget worksheet allocating instructions, messages, evidence, tools and output. Reject inputs that exceed your chosen toy budget.
4. Compare greedy decoding and random sampling from the same toy distribution. Log actual tokenizer counts; use illustrative prices only if clearly labeled, otherwise read current provider pricing.

**Save:** labs/day-06/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Encoding and decoding round-trip except documented normalization effects.
- [ ] The report never treats the toy model as a production LLM.
- [ ] The budget accounts for tool schemas and reserved output, with provider-specific limits marked for verification.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Is 1,000 words always 1,000 tokens, and does a large context window guarantee recall?

<details><summary>Reveal the explanation after answering</summary>

No to both. Token counts depend on tokenizer and text. Context capacity limits what can be supplied; it does not guarantee attention to or correct use of every supplied fact.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Implement a few BPE merge steps by hand. Examine KV cache only conceptually here; implement caching on day 25.

## Day 07 — Build the core of a transformer

**Stage:** Foundations · **Core estimate:** 180 minutes · **Prerequisite:** Day 6; earlier ideas remain available for review

### Connect to what you know

Day 2 gave you dot products and shapes. Day 6 gave you token IDs. Attention now connects the token representations.

### Understand it

An embedding lookup turns token IDs into vectors. Attention derives queries, keys and values, compares queries with keys, normalizes the scores and mixes values. A causal mask blocks future tokens during autoregressive training. Position information helps distinguish order. Transformer blocks combine attention with feed-forward layers, residual connections and normalization. 'Attention weight' describes a computed interaction and is different from a stored trainable parameter.

**Real-world connection:** In 'the animal did not cross the road because it was tired', the representation of 'it' needs context. Attention mixes information from other positions; it is not a proof that the model understands causality.

**Topics:** Q/K/V, scaled dot-product attention; softmax and causal masking; multi-head attention; position encodings and RoPE orientation; residual connections, normalization, feed-forward layers; encoder, decoder and encoder-decoder.

### By the end, you should be able to

- Trace tensor shapes through one attention head.
- Demonstrate that a causal mask blocks future tokens.
- Explain the main transformer blocks in plain language.

### Read or watch with a purpose

- **Core:** [Attention in transformers, step-by-step](https://www.3blue1brown.com/lessons/attention/) — Grant Sanderson / 3Blue1Brown. Watch Q/K/V and masking, pausing to relate the pictures to your tensor shapes. [Original video](https://www.youtube.com/watch?v=eMlx5fFNoYc).
- **Optional research:** [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Vaswani et al.. Optional: abstract, architecture figure and attention equation; full derivation is not required.
- **Reference / optional:** [Transformers, the tech behind LLMs](https://www.3blue1brown.com/lessons/gpt/) — Grant Sanderson / 3Blue1Brown. Watch the token-to-next-token overview, embeddings and softmax/temperature sections. [Original video](https://www.youtube.com/watch?v=wjZofJX0v4M).

### Hands-on lab

1. Create a sequence of four toy embedding vectors. Use small matrices to calculate Q, K and V.
2. Compute softmax(QK^T / sqrt(d_k))V with NumPy or PyTorch and print intermediate shapes.
3. Apply an upper-triangular causal mask before softmax. Assert every masked attention value is zero within tolerance.
4. Draw a transformer block and annotate which quantities are learned parameters and which are computed activations. Read the original paper's architecture figure after the visual lesson.

**Save:** labs/day-07/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Rows of the attention probability matrix sum to approximately one.
- [ ] Masked positions receive approximately zero probability.
- [ ] You can explain the distinction between a token embedding and a contextual representation.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does a high attention score prove that a token caused the answer?

<details><summary>Reveal the explanation after answering</summary>

No. It describes one computation inside a model, not a complete or definitive explanation of the model's output.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Implement two attention heads and concatenate them. Optional: a tiny character transformer; training a useful foundation model is outside this core day.

## Day 08 — Model lifecycle and the Hugging Face ecosystem

**Stage:** Foundations · **Core estimate:** 150 minutes · **Prerequisite:** Day 7; earlier ideas remain available for review

### Connect to what you know

You have seen how a small model is trained. Now separate training a foundation model from adapting and serving one.

### Understand it

Pretraining learns broad patterns from large corpora. Supervised fine-tuning uses demonstrations; preference methods such as DPO or reinforcement learning from feedback shape behavior using comparative or reward signals. Inference uses the resulting parameters. Hugging Face provides a model/dataset hub and libraries such as Transformers, Datasets, Tokenizers and PEFT; a repository is not automatically safe, suitable or unrestricted. Read model cards, licenses, evaluation details and hardware requirements before choosing.

**Real-world connection:** Using a pretrained model is like using a database engine: you need to understand its contract and limitations without rebuilding the entire engine first.

**Topics:** pretraining, SFT, RLHF/RLAIF and DPO; open weights vs open source and hosted models; model cards, dataset cards, licenses and provenance; Hugging Face Hub, Transformers, Datasets, Spaces, PEFT; trainable parameters, context limits, CPU/GPU memory.

### By the end, you should be able to

- Explain adaptation choices without claiming that prompts change weights.
- Inspect a real model card and identify missing evidence.
- Run a small pretrained pipeline or clearly labeled offline fallback.

### Read or watch with a purpose

- **Core:** [LLM Course: Introduction](https://huggingface.co/learn/llm-course/chapter1/1) — Hugging Face. Read the introduction, ecosystem and prerequisites; select later sections as needed.
- **Core:** [Model Cards](https://huggingface.co/docs/hub/model-cards) — Hugging Face Hub. Read model-card purpose and metadata, then inspect a real model's card.
- **Reference / optional:** [PEFT Quicktour](https://huggingface.co/docs/peft/en/quicktour) — Hugging Face. Inspect LoRA configuration, trainable parameter counts and save/load; run only a feasible small example.
- **Optional research:** [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290) — Rafailov et al.. Optional: abstract and high-level method; focus on preference pairs and the training objective.

### Hands-on lab

1. Read the Hugging Face introduction and one small text-classification model card. Record task, license, data limitations, model revision and expected inputs.
2. Run a small CPU-compatible pipeline following the current quickstart. If a download is unavailable, inspect the supplied mock response and record that inference was not run.
3. Make a comparison table: prompt changes, retrieval, fine-tuning and pretraining; give one appropriate use case and one limitation each.
4. Estimate parameter storage as parameter count × bytes per parameter; explain that activations, KV cache and runtime overhead add memory beyond weights.

**Save:** labs/day-08/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The model choice cites a specific card and revision.
- [ ] The exercise distinguishes a live model run from mock mode.
- [ ] Your notes correctly separate training compute from inference memory.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does adding retrieved text to a prompt update model weights?

<details><summary>Reveal the explanation after answering</summary>

No. It changes the context for that request. Fine-tuning changes parameters through training; retrieval does not do that by itself.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Inspect quantization formats and training data governance. Optional: compare small models on your own development questions rather than ranking by parameter count.

## Day 09 — Call models like a backend developer

**Stage:** Generative AI & retrieval · **Core estimate:** 180 minutes · **Prerequisite:** Day 8; earlier ideas remain available for review

### Connect to what you know

An LLM API is familiar HTTP, but outputs and tool requests need validation, accounting and failure handling.

### Understand it

Build a small provider adapter around request construction, response parsing, usage and errors. OpenAI, Anthropic and Gemini expose different APIs; compare concepts without pretending schemas are interchangeable. Structured output constrains form, not truth. Streaming delivers partial results that are incomplete until the provider finishes. Retry transient failures with bounded backoff; avoid retrying a side effect unless it is idempotent.

**Real-world connection:** A payment API response must be validated before updating an order. Treat model-generated JSON with the same discipline, plus checks that the values make sense.

**Topics:** OpenAI Responses API and Agents SDK orientation; Claude Messages/tool use and Agent SDK orientation; Gemini API function calling and ADK orientation; verify the selected API contract; JSON Schema, Pydantic and structured output; streaming, timeouts, retries, usage and secrets.

### By the end, you should be able to

- Implement one live provider behind a common interface.
- Validate both response structure and business rules.
- Handle rate limits and incomplete output explicitly.

### Read or watch with a purpose

- **Core:** [Text generation](https://developers.openai.com/api/docs/guides/text) — OpenAI. Read the current text-generation example and response handling; follow linked Responses API reference.
- **Core:** [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) — Anthropic. Read client versus server tools and tool_use/tool_result flow.
- **Reference / optional:** [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling) — Google. Follow one current API/SDK example end to end; do not mix Interactions and Generate Content schemas.
- **Reference / optional:** [Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — OpenAI. Read supported schema behavior, refusals and response parsing for the chosen API.

### Hands-on lab

1. Define a ModelClient interface returning text, structured data, usage, model identifier and latency. Implement a deterministic mock first.
2. Implement one chosen provider using its current official quickstart and environment variable. Keep keys server-side and record exact package/model versions.
3. Extract a support ticket into category, summary and evidence IDs. Reject missing fields, invalid enums and unknown document references.
4. Simulate timeout, rate limit, malformed JSON and truncated stream. Preserve a useful error and bounded retry count; document equivalent contracts for the other two providers without requiring three paid accounts.

**Save:** labs/day-09/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The mock mode is visibly labeled.
- [ ] No secret appears in source, browser bundles or logs.
- [ ] Four failure cases produce controlled responses rather than fabricated success.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** If output matches a JSON schema, can it still be factually wrong?

<details><summary>Reveal the explanation after answering</summary>

Yes. Schema validity verifies structure and types. Evidence validation and task-specific checks are still needed for factual correctness.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Add a second provider and compare identical development cases. Explore async cancellation and backpressure before concurrent requests.

## Day 10 — Prompting, context engineering and reliable answers

**Stage:** Generative AI & retrieval · **Core estimate:** 150 minutes · **Prerequisite:** Day 9; earlier ideas remain available for review

### Connect to what you know

You can call and validate a model. Now control what it is asked, what evidence it receives and what success means.

### Understand it

A useful prompt specifies the task, constraints, input boundaries, examples and desired output. Context engineering chooses instructions, conversation, evidence and tools within a budget. Few-shot examples demonstrate a pattern; they do not guarantee generalization. Sampling controls affect variation, while model changes, computation and service behavior can still affect repeatability. Ask for concise evidence and conclusions rather than depending on access to hidden chain of thought.

**Real-world connection:** A good work ticket gives a teammate an objective, relevant files and acceptance criteria. Dumping the entire company drive into it can make the task harder.

**Topics:** system/developer/user instructions and untrusted content; zero-shot/few-shot, templates and versioning; context selection, truncation and summarization; hallucination, grounded answers, abstention and verification; temperature/top-p and limits of determinism.

### By the end, you should be able to

- Write a testable prompt rather than a magic phrase.
- Measure unsupported answers and useful abstentions.
- Distinguish deterministic business rules from probabilistic language generation.

### Read or watch with a purpose

- **Core:** [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) — OpenAI. Read clear task instructions, context and examples; apply only the selected model's supported settings.
- **Core:** [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) — OpenAI. Read datasets, repeated evaluations and trace grading; map these to your local harness.
- **Reference / optional:** [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic. Read context selection and long-running context management; test summaries against source facts.
- **Reference / optional:** [Reproducibility](https://docs.pytorch.org/docs/stable/notes/randomness.html) — PyTorch. Read limitations across releases/platforms and deterministic settings.
- **Reference / optional:** [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) — Anthropic. Read abstention, grounding and verification along with the stated limitations.

### Hands-on lab

1. Create a versioned support-answer prompt with explicit evidence boundaries and an unknown-answer response. Request citations to supplied document IDs.
2. Run five answerable and five unanswerable development questions using a weak prompt and your revised prompt. Store outputs and manual judgments.
3. Add a retrieved document containing 'ignore previous instructions'. Treat it as data and verify that the application never grants new permissions from document text.
4. Repeat identical requests and record variation if the provider supports the chosen decoding settings. Write why temperature zero does not prove zero hallucination or universal determinism.

**Save:** labs/day-10/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Every factual support answer maps to a supplied evidence ID.
- [ ] Unanswerable questions can receive a useful abstention or clarification request.
- [ ] The comparison includes failures and sample counts, without claiming a universal improvement.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** What is the difference between reducing hallucinations and guaranteeing no hallucinations?

<details><summary>Reveal the explanation after answering</summary>

Grounding, checks and abstention can reduce measured errors for a defined task. They do not establish a universal guarantee for all future model outputs.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Compare direct extraction with free-form generation and a rules-only answer for the same policy. Explore constrained decoding, verifier limits and confidence calibration.

## Day 11 — Embeddings and semantic search

**Stage:** Generative AI & retrieval · **Core estimate:** 150 minutes · **Prerequisite:** Day 10; earlier ideas remain available for review

### Connect to what you know

Day 7 used vectors inside a model. Now use an embedding model to represent whole sentences for retrieval.

### Understand it

An embedding maps text or another input to a numerical vector. Similarity metrics compare vectors; cosine similarity compares direction. Sentence embeddings are trained for useful relationships, but similar meaning is not the same as verified truth. Use the same compatible embedding model and preprocessing for your indexed documents and queries. A distance or cosine score is not a calibrated probability that a document answers a question.

**Real-world connection:** 'I cannot log in' and 'account access failure' share meaning without sharing many words. Vector search can connect them where a keyword matcher struggles.

**Topics:** token embeddings vs sentence/document embeddings; dense vs sparse representations; cosine similarity, dot product and Euclidean distance; bi-encoders and semantic search; normalization, dimension and model compatibility.

### By the end, you should be able to

- Compute similarity manually before using a vector database.
- Compare semantic and keyword retrieval on identical questions.
- Explain at least two semantic-search failure cases.

### Read or watch with a purpose

- **Core:** [Semantic Search](https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html) — Sentence Transformers. Use the query/corpus embedding and cosine-search example.
- **Core:** [Tokenization algorithms](https://huggingface.co/docs/transformers/main/tokenizer_summary) — Hugging Face Transformers. Read word, character and subword tokenization; compare BPE, WordPiece and Unigram conceptually.

### Hands-on lab

1. Embed the fictional corpus with a small Sentence Transformers model following its official quickstart. Cache vectors on disk with model revision and document hashes.
2. Normalize vectors and calculate exact top-k cosine results with NumPy.
3. Compare Recall@3 with the keyword baseline on development questions; inspect paraphrases, product codes, negations and unrelated queries separately.
4. Print one false match and explain why high similarity does not establish entailment. Preserve the exact retrieval rankings as JSON.

**Save:** labs/day-11/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Vector dimensions agree between corpus and query.
- [ ] Self-similarity and known paraphrase examples behave as expected, without inventing universal thresholds.
- [ ] The report includes retrieval misses, corpus version and embedding model revision.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does a cosine similarity of 0.85 mean an 85% chance the answer is correct?

<details><summary>Reveal the explanation after answering</summary>

No. It is a similarity score in a particular embedding space. It needs task-specific validation and is not automatically calibrated as a probability.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Compare two embedding models on the same development split; examine multilingual and code retrieval. Optional: sparse learned retrieval such as SPLADE.

## Day 12 — Vector indexes, databases and document ingestion

**Stage:** Generative AI & retrieval · **Core estimate:** 180 minutes · **Prerequisite:** Day 11; earlier ideas remain available for review

### Connect to what you know

Exact search is understandable but becomes expensive as vectors grow. Indexing trades resources and sometimes recall for faster retrieval.

### Understand it

A vector index is a search data structure, while a vector database adds storage and operational capabilities such as metadata filtering and updates. HNSW uses a graph of vector neighbors to search approximately; this is not a knowledge graph of business facts. Chunking divides documents into retrievable units. Preserve titles, sections, source versions and access metadata so a retrieved chunk remains interpretable and authorized.

**Real-world connection:** An index in a library helps you find shelves quickly. The catalog and borrowing permissions are separate responsibilities from the index itself.

**Topics:** exact vs approximate nearest neighbors; HNSW, IVF and quantization orientation; FAISS vs pgvector/Qdrant/managed vector stores; chunk size, overlap, parsing and OCR; metadata filters, ACLs, deletion and reindexing.

### By the end, you should be able to

- Choose an index based on measured tradeoffs.
- Create a repeatable ingestion pipeline.
- Preserve source provenance and access boundaries.

### Read or watch with a purpose

- **Core:** [Faiss indexes](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes) — Meta / Faiss maintainers. Compare Flat, HNSW and IVF rows; read cosine normalization and search parameters.
- **Core:** [pgvector](https://github.com/pgvector/pgvector) — pgvector maintainers. Read exact search, approximate indexes and filtering; implementation is optional.
- **Reference / optional:** [Graph database concepts](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/) — Neo4j. Read nodes, relationships, properties and traversal; map them to services and teams.

### Hands-on lab

1. Chunk the corpus by headings with configurable size and overlap. Record doc_id, chunk_id, title, version, hash, visibility and text.
2. Keep exact NumPy retrieval as the oracle. Build one FAISS or local vector-store index; compare Recall@k relative to exact results and measured latency.
3. Change one document, rerun ingestion and ensure stale chunks are replaced rather than duplicated. Delete another and confirm it is no longer retrievable.
4. Add a restricted fictional document and filter by access scope before returning evidence. Explain how this toy scope filter differs from real authenticated authorization.

**Save:** labs/day-12/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Reingestion is idempotent.
- [ ] Deleted or stale chunks do not remain in results.
- [ ] The comparison distinguishes ANN recall from answer quality and reports dataset size.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Are an HNSW graph and a customer-to-order knowledge graph the same?

<details><summary>Reveal the explanation after answering</summary>

No. HNSW edges connect nearby vectors to accelerate similarity search. A knowledge graph's edges represent meaningful domain relations such as customer placed order.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Study index tuning, sharding, replication and backups. Compare Redis, Qdrant, Pinecone and pgvector by needs rather than learning all APIs today.

## Day 13 — Build a cited RAG assistant

**Stage:** Generative AI & retrieval · **Core estimate:** 180 minutes · **Prerequisite:** Day 12; earlier ideas remain available for review

### Connect to what you know

You can retrieve chunks and call a model. Retrieval-augmented generation connects those steps while keeping their responsibilities visible.

### Understand it

RAG retrieves relevant information and supplies it as context for generation. Retrieval is external to the model's parameters. Citations must point to actual retrieved passages, and a valid citation ID alone does not prove that the passage supports the claim. Handle empty, conflicting, obsolete and unauthorized evidence explicitly. A model can still hallucinate with RAG, so retain abstention and answer checks.

**Real-world connection:** An open-book exam works only if you open the relevant page and use it correctly. Possessing a book is not the same as answering accurately.

**Topics:** RAG ingestion vs query pipeline; retrieval, evidence packing, generation and citations; grounding vs citation validity vs entailment; conflicting/dated evidence and abstention; retrieval failures vs generation failures.

### By the end, you should be able to

- Build a complete retrieval-to-answer path.
- Return inspectable source passages with answers.
- Diagnose the component responsible for a bad answer.

### Read or watch with a purpose

- **Optional research:** [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) — Lewis et al.. Optional: abstract and architecture; distinguish parameter memory from retrieved evidence.
- **Core:** [Semantic Search](https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html) — Sentence Transformers. Use the query/corpus embedding and cosine-search example.
- **Reference / optional:** [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) — OpenAI. Read datasets, repeated evaluations and trace grading; map these to your local harness.

### Hands-on lab

1. Create /ask in Flask or FastAPI: validate question → retrieve authorized chunks → pack bounded evidence → call ModelClient → validate answer/citations.
2. Use the supplied golden questions. For unanswerable cases, ask for clarification or state the missing evidence; never invent policy.
3. Display or print answer, source title, document ID, quoted support span and model/latency metadata.
4. Run answerable, unknown, conflicting-policy and prompt-injection cases. Classify each failure as ingestion, retrieval, context packing, generation or validation.

**Save:** labs/day-13/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] No citation references a document absent from retrieved evidence.
- [ ] At least one deliberately unanswerable case abstains.
- [ ] The raw retrieved evidence and final answer can be inspected independently.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Why can a RAG answer with a valid citation still be wrong?

<details><summary>Reveal the explanation after answering</summary>

The cited passage may be irrelevant, outdated or misinterpreted. Citation existence and semantic support must be checked separately.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Add sentence-level support annotations and a deterministic answer path for simple policy lookups. Optional: compare LlamaIndex or Haystack after understanding the raw pipeline.

## Day 14 — Improve retrieval with measured experiments

**Stage:** Generative AI & retrieval · **Core estimate:** 180 minutes · **Prerequisite:** Day 13; earlier ideas remain available for review

### Connect to what you know

Your first RAG pipeline is the baseline. Improve one variable at a time and evaluate on the same development set.

### Understand it

Lexical retrieval helps exact terms and identifiers; dense retrieval helps paraphrases. Hybrid retrieval combines them, often through rank fusion. A cross-encoder reranks a small candidate set by examining each query-document pair jointly. Query rewriting or decomposition can help some questions but adds latency and another possible error. Contextual augmentation changes what is indexed; verify any added context against the original document.

**Real-world connection:** A support question containing error code XJ-41 may need exact matching, while a vague description needs meaning. A second reviewer can reorder candidates before an answer is drafted.

**Topics:** BM25, dense and hybrid retrieval; reciprocal rank fusion and cross-encoder reranking; query rewriting, multi-query and decomposition; Recall@k, MRR and nDCG; ablation experiments and slice-based evaluation.

### By the end, you should be able to

- Run a controlled retrieval experiment.
- Choose a change using quality, latency and complexity together.
- Recognize when extra retrieval machinery does not help.

### Read or watch with a purpose

- **Core:** [Retrieve & Re-Rank](https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) — Sentence Transformers. Run candidate retrieval and cross-encoder reranking on your small corpus.
- **Core:** [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) — Anthropic. Read the indexing method and evaluation setup; compare it to your own corpus.
- **Reference / optional:** [Ragas documentation](https://docs.ragas.io/en/stable/) — Ragas maintainers. Consult evaluation concepts and the metric relevant to today's experiment.

### Hands-on lab

1. Implement rank fusion of your lexical and dense rankings; keep source scores separate because raw scores may not be comparable.
2. Add a cross-encoder reranker over a small candidate pool using the official example.
3. Create a results table for baseline, dense, hybrid and hybrid-plus-reranker with Recall@3, MRR and latency on the same development questions.
4. Inspect exact-code, paraphrase, multi-hop and unanswerable slices. Select a design and write an architectural decision record including a case where the advanced method loses.

**Save:** labs/day-14/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] All variants use the same corpus version and question set.
- [ ] You record model calls and latency along with quality.
- [ ] You do not tune on the final holdout or declare a winner from a single example.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** A reranker improves one demo. Is that enough to replace your retriever?

<details><summary>Reveal the explanation after answering</summary>

No. Evaluate representative query slices, added latency/cost and regressions. One favorable example is evidence of possibility, not overall superiority.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Explore HyDE, late interaction/ColBERT, parent-child retrieval and contextual compression as optional experiments, each with a stated hypothesis.

## Day 15 — Knowledge graphs from first principles

**Stage:** Generative AI & retrieval · **Core estimate:** 150 minutes · **Prerequisite:** Day 14; earlier ideas remain available for review

### Connect to what you know

You have seen an HNSW search graph. Now build a graph whose nodes and edges mean something in your business domain.

### Understand it

A graph consists of nodes and edges. Edges can be directed, weighted or typed. In a property graph, nodes and relationships can carry properties; RDF expresses statements as subject-predicate-object triples using shared vocabularies. Entity resolution decides whether two mentions refer to the same thing. An ontology defines categories and relation meaning. A domain graph, a neural computation graph and an agent control-flow graph serve different purposes.

**Real-world connection:** 'Atlas API depends on Auth Service, which is owned by Identity Team' forms a path. That path can answer who should handle an outage even when no single sentence says so.

**Topics:** nodes, edges, direction, weights and traversal; property graphs vs RDF triples and ontologies; entities, relations and entity resolution; provenance and temporal facts; Cypher, graph queries and multi-hop reasoning.

### By the end, you should be able to

- Build a small graph from explicit source facts.
- Write a multi-hop query.
- Explain which graph type solves which problem.

### Read or watch with a purpose

- **Core:** [Graph database concepts](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/) — Neo4j. Read nodes, relationships, properties and traversal; map them to services and teams.
- **Core:** [GraphRAG Indexing overview](https://microsoft.github.io/graphrag/index/overview/) — Microsoft. Read entities, relationships, communities and summaries; then see the query-engine companion link.

### Hands-on lab

1. Extract service, team and policy entities from the supplied corpus manually first. Record every relation with its source document and valid date.
2. Represent the graph in NetworkX or a simple adjacency list. Traverse service → dependency → owning team.
3. Optionally load it into local Neo4j and write equivalent Cypher queries. Keep the no-install adjacency-list path available.
4. Create five deliberately ambiguous entity names and a correction table. Compare a direct graph query with semantic retrieval on the same multi-hop question.

**Save:** labs/day-15/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Every factual edge has provenance.
- [ ] At least one multi-hop query returns a verifiable path.
- [ ] Your glossary distinguishes property graph, RDF, HNSW, computation graph and workflow graph.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does storing text in a vector database automatically create a knowledge graph?

<details><summary>Reveal the explanation after answering</summary>

No. Embeddings represent similarity. A knowledge graph requires explicit entities and semantically meaningful relations, with construction and provenance decisions.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Study BFS/DFS, centrality, communities and graph neural networks. GNNs learn over graph structure; they are not synonymous with GraphRAG.

## Day 16 — GraphRAG: when relationships improve retrieval

**Stage:** Generative AI & retrieval · **Core estimate:** 150 minutes · **Prerequisite:** Day 15; earlier ideas remain available for review

### Connect to what you know

Day 15 made explicit relationships queryable. Now decide whether graph-assisted retrieval adds value beyond your existing RAG.

### Understand it

Graph-assisted RAG retrieves using entities, relationships or graph-derived summaries. Microsoft's GraphRAG is a particular implementation with graph construction, community summaries and different query strategies; it is not the definition of every graph-based retrieval system. Extraction can introduce false edges, and indexing or global summarization can be expensive. Compare local factual questions with broad corpus-level questions before choosing.

**Real-world connection:** 'Who owns this dependency?' suits a graph traversal. 'What are the common failure themes across all services?' may benefit from community-level summaries. 'What is the refund window?' may need neither.

**Topics:** entity/relation extraction and validation; local vs global questions; community detection and summary hierarchy; graph-assisted RAG vs Microsoft GraphRAG; indexing cost, provenance and retrieval routing.

### By the end, you should be able to

- Build one graph-assisted retrieval path.
- Test the claim that a graph helps your use case.
- Avoid treating extracted edges as unquestionable truth.

### Read or watch with a purpose

- **Core:** [GraphRAG Indexing overview](https://microsoft.github.io/graphrag/index/overview/) — Microsoft. Read entities, relationships, communities and summaries; then see the query-engine companion link.
- **Optional research:** [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130) — Edge et al.. Optional: abstract, architecture and evaluation questions; note the global summarization task.
- **Reference / optional:** [Graph database concepts](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/) — Neo4j. Read nodes, relationships, properties and traversal; map them to services and teams.
- **Reference / optional:** [GraphRAG Query Engine overview](https://microsoft.github.io/graphrag/query/overview/) — Microsoft. Compare local and global query methods and their resource implications.

### Hands-on lab

1. Use your manually verified graph to retrieve related documents for a dependency question, then generate a cited answer.
2. Create three local, three multi-hop and three corpus-level development questions. Compare ordinary RAG and your graph-assisted path.
3. Inject a false relationship and verify provenance checks or manual review catch it. Document how an incorrect edge could contaminate an answer.
4. Read the Microsoft GraphRAG architecture and paper overview. Write a go/no-go decision for adopting its full indexing pipeline; do not run expensive full indexing by default.

**Save:** labs/day-16/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The answer exposes both the graph path and original documents.
- [ ] The report separates indexing cost from per-query cost.
- [ ] The chosen architecture is justified by measured use-case needs rather than the word 'graph'.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Is GraphRAG always better than vector RAG?

<details><summary>Reveal the explanation after answering</summary>

No. Benefits depend on the questions, corpus, graph quality and available resources. Simple factual retrieval may not justify graph extraction and summary overhead.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Optional: run a tiny Microsoft GraphRAG index with an explicit spend cap. Compare community summaries against a direct document-summary baseline.

## Day 17 — Build a tool-using agent in plain Python

**Stage:** Agent engineering · **Core estimate:** 180 minutes · **Prerequisite:** Day 16; earlier ideas remain available for review

### Connect to what you know

RAG finds evidence, but some questions require a live lookup or an action. Your existing API-development skills are directly useful here.

### Understand it

A tool is a callable capability with a defined input and output contract. The model proposes a tool name and arguments; your application validates and executes it, then returns the result for the next model step. A bounded loop stops on a final response, an error, an approval request or a budget. ReAct is a research pattern interleaving reasoning and actions; applications should log observable tool activity and concise decision summaries, not assume access to hidden reasoning.

**Real-world connection:** A support engineer reads a question, checks service status, reads a runbook and drafts a ticket. The agent can follow this cycle, but the server still controls what it may do.

**Topics:** tool/function calling and JSON schemas; ReAct and observe-act loops; tool allowlists, validation and result contracts; step/time/token budgets and termination; read-only vs side-effecting tools.

### By the end, you should be able to

- Implement a tool loop without an agent framework.
- Reject invented tools and invalid arguments.
- Separate proposed actions from execution permissions.

### Read or watch with a purpose

- **Core:** [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — Anthropic. Read workflows versus agents and the pattern relevant to today's lab.
- **Optional research:** [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — Yao et al.. Optional: abstract and trajectory example after building a tool loop.
- **Reference / optional:** [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) — Anthropic. Read client versus server tools and tool_use/tool_result flow.
- **Reference / optional:** [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling) — Google. Follow one current API/SDK example end to end; do not mix Interactions and Generate Content schemas.
- **Reference / optional:** [Function calling](https://developers.openai.com/api/docs/guides/function-calling) — OpenAI. Read model proposal, application execution and result continuation.

### Hands-on lab

1. Implement get_service_status and search_docs using the supplied local fixtures. Give each a precise schema and a structured error response.
2. Extend ModelClient to return either a final answer or tool-call requests. Execute only named, validated tools; add a maximum of five steps and an overall timeout.
3. Add draft_ticket, which creates a local draft only. Require a separate explicit approval before the simulated create_ticket operation.
4. Test an unknown tool, invalid service ID, repeated call loop, tool timeout and missing approval. Record the observable trace.

**Save:** labs/day-17/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The loop always terminates within its configured budget.
- [ ] No arbitrary code execution or free-form SQL is available.
- [ ] A malformed tool request cannot bypass validation or approval.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** If the model returns a function-call JSON object, has the function already run?

<details><summary>Reveal the explanation after answering</summary>

Usually the model has proposed a call. Your application or a provider-managed runtime must execute it under the applicable permissions and return a result. Verify the API's ownership of execution.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Compare fixed routing with model-chosen tool order. Add parallel read-only calls only if they are independent and beneficial.

## Day 18 — LangChain with understanding

**Stage:** Agent engineering · **Core estimate:** 150 minutes · **Prerequisite:** Day 17; earlier ideas remain available for review

### Connect to what you know

You built the loop yourself. LangChain can now reduce integration work without hiding the behavior from you.

### Understand it

LangChain provides model and tool abstractions and prebuilt agent patterns. Current LangChain agents build on LangGraph; basic use does not require manually defining a graph. Learn messages, model interfaces, tools, structured responses, retrievers, streaming and middleware as separate contracts. Older tutorials may show APIs that have changed, so use current Python documentation and lock the versions used.

**Real-world connection:** A web framework provides routing and middleware, but you still need to understand HTTP. LangChain plays a similar role for model and tool integration.

**Topics:** LangChain models/messages/tools; create_agent and current Python APIs; retrievers, prompt templates and structured responses; runnables/LCEL orientation and middleware; streaming and LangSmith tracing orientation.

### By the end, you should be able to

- Rebuild day 17's behavior using LangChain.
- Trace input messages, tool requests and returned results.
- Explain what the framework adds and what you still own.

### Read or watch with a purpose

- **Core:** [LangChain overview](https://docs.langchain.com/oss/python/langchain/overview) — LangChain. Read core concepts and the current create_agent example.
- **Core:** [Agents](https://docs.langchain.com/oss/python/langchain/agents) — LangChain. Read model, tools, dynamic behavior and structured output for the current Python API.
- **Reference / optional:** [LangSmith documentation](https://docs.langchain.com/langsmith/home) — LangChain. Read tracing and evaluation introductions; a local trace viewer is a valid no-account alternative.

### Hands-on lab

1. Create a separate implementation of the same two read-only tools and ticket draft using the current LangChain quickstart. Keep the raw Python baseline.
2. Use structured output for the final support response and pass the same evidence and tool schemas where possible.
3. Run the same development cases against both implementations; compare successful task completion, tool errors, latency and call count.
4. Document five responsibilities the framework does not remove: authorization, data quality, budgets, evaluation and deployment design. Record library versions and avoid copying legacy snippets unverified.

**Save:** labs/day-18/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Both implementations expose the same user-visible contract.
- [ ] Tool arguments remain validated and side effects remain gated.
- [ ] A trace explains every executed tool and stop condition.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does using LangChain automatically make an application an autonomous agent?

<details><summary>Reveal the explanation after answering</summary>

No. It is a framework. Your chosen control flow determines whether you built a fixed workflow, a retrieval pipeline or a model-directed agent.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Implement a small runnable sequence and compare it with create_agent. Explore LlamaIndex/Haystack for retrieval-heavy products and PydanticAI for typed agent interfaces as optional alternatives.

## Day 19 — LangGraph: state, nodes, edges and checkpoints

**Stage:** Agent engineering · **Core estimate:** 180 minutes · **Prerequisite:** Day 18; earlier ideas remain available for review

### Connect to what you know

Your agent loop maintains implicit state. LangGraph lets you model that state and its transitions explicitly.

### Understand it

In a state graph, nodes perform work and edges determine what runs next. Conditional edges branch based on state; reducers define how concurrent updates combine. A checkpointer stores execution state associated with a thread. This is a control-flow graph, not a graph of business facts. Durable storage is necessary for state to survive process restarts; an in-memory checkpointer is only a local demonstration.

**Real-world connection:** A workflow for support can route a policy question to retrieval and an outage question to a status tool, then send both paths through answer validation.

**Topics:** StateGraph, typed state, nodes and edges; conditional routing and cycles; reducers and concurrent state updates; checkpoints, thread IDs and persistence; streaming state vs streaming tokens.

### By the end, you should be able to

- Build a branching support workflow.
- Resume a saved thread using persistent checkpoint storage.
- Explain graph state separately from conversation history.

### Read or watch with a purpose

- **Core:** [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview) — LangChain. Read the low-level orchestration explanation and minimal StateGraph example.
- **Core:** [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) — LangChain. Read threads, checkpoints and stores; compare in-memory and durable backends.
- **Reference / optional:** [Graph API overview](https://docs.langchain.com/oss/python/langgraph/graph-api) — LangChain. Read state, nodes, edges and reducers; implement only the needed graph features.

### Hands-on lab

1. Define typed state with question, retrieved evidence, tool results, proposed action, answer and errors. Build route → retrieve/status → validate → answer nodes.
2. Add a conditional edge for insufficient evidence that requests clarification instead of endlessly retrying.
3. Use a supported SQLite checkpointer locally, with a stable thread ID. Stop the process and restart it, then retrieve the saved state.
4. Test two thread IDs and prove they do not share messages. Draw the node/edge diagram and compare it with your day 15 knowledge graph.

**Save:** labs/day-19/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The graph has explicit termination and retry limits.
- [ ] A process restart preserves checkpoint state when persistent storage is configured.
- [ ] Two independent threads remain isolated.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Is storing all chat messages equivalent to checkpointing a workflow?

<details><summary>Reveal the explanation after answering</summary>

No. A checkpoint can include execution position, pending work and structured state. A message transcript alone may be insufficient to resume the workflow correctly.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Add a small parallel read-only branch and an explicit reducer. Demonstrate how an incorrect reducer loses an update.

## Day 20 — Memory and context that stay useful

**Stage:** Agent engineering · **Core estimate:** 150 minutes · **Prerequisite:** Day 19; earlier ideas remain available for review

### Connect to what you know

You have saved execution state. Now decide what should be remembered, for how long, and for whom.

### Understand it

Short-term memory supports a current interaction; long-term memory persists selected information across sessions. A transcript, a checkpoint, a user preference store and a document retrieval index are different structures. Memory retrieval selects relevant records; summarization compresses information but can discard or distort details. Every record needs scope, provenance, timestamps and a deletion strategy. Retrieved memory is data, not new authority.

**Real-world connection:** A colleague may remember your preferred response format but should not carry one customer's confidential details into another customer's conversation.

**Topics:** working memory vs long-term memory; semantic, episodic and procedural memory as design categories; memory write/read policies, provenance and TTL; summarization, compaction and context selection; profile/tenant scoping, consent and deletion.

### By the end, you should be able to

- Store and retrieve a small explicit preference safely.
- Prevent memory leakage across users and threads.
- Measure what summarization loses.

### Read or watch with a purpose

- **Core:** [Short-term memory](https://docs.langchain.com/oss/python/langchain/short-term-memory) — LangChain. Read thread-scoped state and trimming/summarization; use the memory companion source for explicit long-term storage.
- **Core:** [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) — LangChain. Read threads, checkpoints and stores; compare in-memory and durable backends.
- **Reference / optional:** [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic. Read context selection and long-running context management; test summaries against source facts.
- **Reference / optional:** [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) — Anthropic. Read application-controlled storage, path restrictions and deletion considerations.

### Hands-on lab

1. Add an explicit 'remember this preference' action to the lab agent; store a user-scoped record with source, created time and expiry.
2. Retrieve only records for the current authenticated lab principal and task; do not trust a user-supplied tenant ID as authorization.
3. Summarize a long synthetic conversation. Compare the summary against a checklist of important facts, decisions and unresolved questions.
4. Implement forget and expiry behavior. Test that deleted/expired facts are excluded from prompt construction and document the separate handling of logs/backups.

**Save:** labs/day-20/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Harshith's synthetic memory never appears in Aparna's agent context.
- [ ] The user can inspect and delete remembered preferences.
- [ ] A summary is tested against source facts and marked as derived content.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Should every message be stored permanently as long-term memory?

<details><summary>Reveal the explanation after answering</summary>

No. Keep only useful, permitted information with clear scope and retention. Unfiltered persistence increases noise, privacy risk and stale-context errors.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Compare vector memory retrieval with structured preference fields. Explore memory poisoning and provenance scoring; do not let model-invented memories become facts.

## Day 21 — Durable agents and human approvals

**Stage:** Agent engineering · **Core estimate:** 180 minutes · **Prerequisite:** Day 20; earlier ideas remain available for review

### Connect to what you know

A workflow can now resume. The difficult part is resuming without repeating an external action or losing an approval.

### Understand it

An interrupt pauses work so a human can inspect a proposed action. Persistence stores the pending state; resumption supplies the decision. Replay can rerun code, so an idempotency key and operation ledger protect side effects. Retrying a model request differs from retrying a ticket creation. Separate decisions, approvals and execution, and make cancellations and timeouts explicit.

**Real-world connection:** If a bank transfer request times out, blindly repeating it can send money twice. A support-ticket creation can duplicate in the same way even in a small demo.

**Topics:** interrupt/resume and approval state; durable execution and replay; idempotency keys, deduplication and operation ledger; retries, backoff, cancellation and timeouts; sagas/compensation and task queues orientation.

### By the end, you should be able to

- Resume an approved task after restart.
- Prove a duplicate retry does not duplicate an action.
- Keep the approved payload bound to the action executed.

### Read or watch with a purpose

- **Core:** [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) — LangChain. Read pause/resume, thread IDs and replay caveats before adding the approval lab.
- **Core:** [Durable execution](https://docs.langchain.com/oss/python/langgraph/durable-execution) — LangChain. Read replay, idempotency and side-effect handling.
- **Reference / optional:** [What is Amazon Bedrock AgentCore?](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html) — AWS. Read component responsibilities; follow the linked current runtime quickstart only for the selected deployment.

### Hands-on lab

1. Add a LangGraph interrupt before simulated ticket creation. Show exact summary, target service and fields to approve.
2. Persist an approval record tied to the payload hash and operation ID. Reject execution if the action changes after approval.
3. Make the fake ticket service accept an idempotency key. Simulate a successful write followed by a lost response, then retry.
4. Restart the workflow while approval is pending; resume and verify exactly one simulated ticket exists. Add reject and cancel paths.

**Save:** labs/day-21/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] A pending approval survives restart.
- [ ] Two retries of the same operation create one ticket in the fake service.
- [ ] Changing the approved payload invalidates the prior approval.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does durable checkpointing alone guarantee that an external action happens exactly once?

<details><summary>Reveal the explanation after answering</summary>

No. External side effects need their own idempotency or reconciliation strategy. A workflow can resume and replay code even when the first external request already succeeded.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Model a compensating action for a reversible operation. Learn transactional outbox patterns and why distributed exactly-once claims need careful scope.

## Day 22 — MCP, A2A and multi-agent systems

**Stage:** Agent engineering · **Core estimate:** 180 minutes · **Prerequisite:** Day 21; earlier ideas remain available for review

### Connect to what you know

You have tool contracts and durable state. Protocols and multiple agents can connect components, but they also introduce boundaries.

### Understand it

MCP standardizes how hosts connect to servers exposing tools, resources and prompts; it does not replace authentication or validate every tool's trustworthiness. A2A addresses communication between agents and task-oriented handoffs. In a multi-agent design, specialists need explicit inputs, outputs, ownership and budgets. More agents can add duplicated effort, coordination errors and cost, so compare against a single-agent baseline.

**Real-world connection:** A USB connector makes devices interoperable but does not make every attached device trustworthy. A team of specialists also needs clear assignments and a responsible coordinator.

**Topics:** MCP host/client/server, tools/resources/prompts; MCP transports, auth and trust boundaries; A2A agent discovery/tasks/artifacts overview; supervisor, router, handoff and parallel specialists; agent harnesses, skills and bounded delegation.

### By the end, you should be able to

- Expose a read-only local tool through MCP.
- Explain the difference between tool integration and agent delegation.
- Measure whether two specialists help the support task.

### Read or watch with a purpose

- **Core:** [Architecture overview](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) — Model Context Protocol project. Read host/client/server, primitives and transports; pin compatible SDK/spec versions.
- **Core:** [Core Concepts and Components in A2A](https://a2a-protocol.org/latest/topics/key-concepts/) — A2A Protocol project. Read Agent Cards, Tasks, Messages and Artifacts.
- **Reference / optional:** [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Anthropic. Read architecture, coordination failures, cost tradeoffs and evaluation approach.
- **Reference / optional:** [Agents SDK](https://developers.openai.com/api/docs/guides/agents) — OpenAI. Read agent definitions, running and orchestration after the manual loop.

### Hands-on lab

1. Wrap search_docs in a local MCP server following the official Python SDK quickstart. Inspect its declared schema and call it from a local client.
2. Document the host/client/server boundaries and how credentials would be scoped in a remote deployment. Use no arbitrary filesystem or shell tool.
3. Build two bounded specialists: evidence finder and response reviewer. Give the reviewer source evidence and an explicit rubric.
4. Compare this arrangement against your single agent on the same development questions. Record duplicate tool calls, handoff failures, total usage and whether the additional agent changes quality.

**Save:** labs/day-22/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Only the intended read-only capability is exposed.
- [ ] Each subtask has a deadline, budget and structured result.
- [ ] The decision to retain multiple agents includes measured costs and failures.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does MCP make a tool safe, and does A2A mean all agents share memory?

<details><summary>Reveal the explanation after answering</summary>

No. Protocol interoperability is separate from trust and authorization. Memory sharing must be designed explicitly with appropriate scope and permissions.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Read about Claude Agent SDK, OpenAI Agents SDK, Gemini ADK and AWS Strands as alternative harnesses. Build one optional adapter, not four redundant projects.

## Day 23 — Evaluate agents and inspect their traces

**Stage:** Agent engineering · **Core estimate:** 180 minutes · **Prerequisite:** Day 22; earlier ideas remain available for review

### Connect to what you know

Your agent now has multiple steps and failure modes. A good final sentence can hide a wrong or unauthorized tool action.

### Understand it

Evaluate outcomes, trajectories and operational behavior separately. A test case needs an input, permitted actions, expected evidence or final state, and a scoring rule. Use deterministic checks where possible, human review for judgment, and calibrated model graders when useful. A benchmark tests a particular distribution and harness; a leaderboard score is not your application's service guarantee. Traces reveal steps and timing but must avoid leaking sensitive data.

**Real-world connection:** A delivery service is not successful merely because its confirmation message sounds right. The package must reach the right address without forbidden actions.

**Topics:** task success, tool correctness and trajectory checks; golden datasets, adversarial slices and holdouts; human graders vs LLM-as-judge and calibration; LangSmith, OpenTelemetry and trace spans; SWE-bench, GAIA and domain-specific benchmarks.

### By the end, you should be able to

- Build a reproducible agent evaluation harness.
- Inspect an end-to-end trace for a failed case.
- Define a release gate that covers actions as well as answers.

### Read or watch with a purpose

- **Core:** [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) — OpenAI. Read datasets, repeated evaluations and trace grading; map these to your local harness.
- **Core:** [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — Anthropic. Read tasks, trials, graders, traces and outcomes; compare transcript with resulting state.
- **Reference / optional:** [LangSmith documentation](https://docs.langchain.com/langsmith/home) — LangChain. Read tracing and evaluation introductions; a local trace viewer is a valid no-account alternative.
- **Reference / optional:** [SWE-bench](https://www.swebench.com/) — SWE-bench project. Inspect task definition and evaluation setup; no leaderboard numbers need memorizing.

### Hands-on lab

1. Expand development tests into answerable, unknown, conflicting, injection, tool-failure and approval cases. Use labeled expected outcomes rather than exact prose matches.
2. Add deterministic checks for allowed tools, valid citations, bounded steps and duplicate side effects. Add manual ratings for answer support and usefulness.
3. Record a trace per run with correlation ID, model/prompt versions, latency, token usage, tool arguments with sensitive fields redacted and final outcome.
4. If using a model grader, compare its judgments with at least ten human-labeled cases and document disagreement. Keep public benchmark scores separate from your own results.

**Save:** labs/day-23/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Every score has a denominator and evaluation dataset version.
- [ ] At least one attractive but unsupported answer is scored as a failure.
- [ ] Traces are useful without exposing secrets or raw sensitive data.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Can you compare two benchmark scores if the models used different tools, budgets and test splits?

<details><summary>Reveal the explanation after answering</summary>

Not as a clean model-only comparison. The harness, dataset, budget and scoring setup materially affect the result and must be reported.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Estimate uncertainty with repeated runs and bootstrap intervals on larger datasets. Small samples are diagnostic evidence, not stable production estimates.

## Day 24 — Enterprise architecture, security and governance

**Stage:** Production & innovation · **Core estimate:** 180 minutes · **Prerequisite:** Day 23; earlier ideas remain available for review

### Connect to what you know

Backend security still applies. Agents add untrusted instructions, generated tool arguments and longer chains of delegated work.

### Understand it

An enterprise design separates identity, authorization, model access, retrieval, execution and audit. Prompt injection can arrive in user input, retrieved documents or tool output. Enforce permissions in application code beside data access and side effects. Treat output as untrusted before placing it into SQL, HTML, shell commands or external APIs. Guardrails are layered checks, not replacements for access control. Retention, data residency and model-provider policies need project-specific review.

**Real-world connection:** A helpful contractor may read manuals and propose changes, but does not gain administrator rights because a manual says 'ignore the rules'.

**Topics:** prompt injection and indirect injection; authentication vs authorization, RBAC/ABAC and least privilege; tenant isolation, data exfiltration and sandboxing; PII minimization, retention, residency and audit; secrets, egress allowlists, supply chain and threat modeling.

### By the end, you should be able to

- Draw trust boundaries for a production agent.
- Block cross-tenant retrieval and unauthorized tool actions.
- Create an actionable threat model.

### Read or watch with a purpose

- **Core:** [OWASP Top 10 for Large Language Model Applications](https://genai.owasp.org/llm-top-10/) — OWASP GenAI Security Project. Read prompt injection, sensitive information disclosure and excessive agency; map to concrete tests.
- **Core:** [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) — OpenAI. Read input/output/tool checks and approval placement; inspect limitations across handoffs.
- **Reference / optional:** [Architecture overview](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) — Model Context Protocol project. Read host/client/server, primitives and transports; pin compatible SDK/spec versions.
- **Reference / optional:** [Thomson Reuters and Anthropic Expand Partnership to Connect Claude with CoCounsel Legal](https://www.thomsonreuters.com/en/press-releases/2026/may/thomson-reuters-and-anthropic-expand-partnership-to-connect-claude-with-cocounsel-legal) — Thomson Reuters. Read the described MCP integration, domain content, references and planned agent architecture.

### Hands-on lab

1. Draw client → authenticated API → policy → orchestrator → model/retrieval/tool gateway → external systems, plus trace and checkpoint stores.
2. List assets, actors and five concrete attacks: injected document, poisoned memory, unauthorized service, malicious tool result and secret-seeking request.
3. Implement server-side authorization for the fake tool service and retrieval scope; verify a worker agent cannot bypass it.
4. Run adversarial tests and document remaining weaknesses. Use the Thomson Reuters case study to identify evidence sources, domain boundaries and human accountability without assuming its reported roadmap has shipped.

**Save:** labs/day-24/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] No model-produced tenant identifier determines authorization.
- [ ] Tool execution rechecks permission even after a model or worker approves.
- [ ] The threat model includes concrete mitigations and residual limitations.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Can a prompt saying 'never reveal secrets' replace proper secret isolation?

<details><summary>Reveal the explanation after answering</summary>

No. Secrets should be kept out of model context where unnecessary and protected by server-side permissions, narrow tools and controlled data flows.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Add per-tool service identities, audit retention policy and a sandboxed code-execution design. Advanced branches: compliance, formal policies and red-team campaigns.

## Day 25 — Caching, latency, cost and scaling

**Stage:** Production & innovation · **Core estimate:** 180 minutes · **Prerequisite:** Day 24; earlier ideas remain available for review

### Connect to what you know

You can measure correctness. Now measure how the system behaves under repeated and concurrent requests.

### Understand it

An answer cache stores final responses. An embedding cache stores vectors for unchanged inputs. Semantic caching reuses results for similar queries and can introduce wrong or cross-user answers. Provider prompt-prefix caching reuses processing of repeated prefixes; it does not mean the answer is cached. Model-serving KV caches retain attention keys and values during generation. Batching, queues, rate limits and bounded concurrency affect throughput and latency. Quantization reduces numerical precision, with quality and compatibility tradeoffs.

**Real-world connection:** A restaurant can reuse prepared ingredients, but that is different from serving a previous customer's finished meal. Different caches reuse different parts of the work.

**Topics:** answer, semantic, embedding, retrieval and prefix/KV caches; cache keys, TTL, invalidation and access scope; prefill vs decode, TTFT and tokens per second; p50/p95 latency, throughput, backpressure and circuit breakers; batching, quantization, autoscaling and model routing.

### By the end, you should be able to

- Measure the slowest stages before optimizing.
- Implement a cache without serving stale or unauthorized content.
- Report cost and performance alongside quality.

### Read or watch with a purpose

- **Core:** [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) — OpenAI. Read current cache behavior and usage reporting; verify eligibility/TTL/pricing for the chosen model.
- **Core:** [vLLM documentation](https://docs.vllm.ai/en/latest/) — vLLM project. Read serving and performance concepts; a GPU deployment is optional.
- **Reference / optional:** [AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html) — AWS. Read traces, usage, latency and error monitoring; map them to local instrumentation.

### Hands-on lab

1. Instrument retrieval, model time-to-first-token, total response time, tool duration and total usage. Use actual provider usage where available.
2. Add an embedding cache keyed by content hash plus embedding model revision. Add a scoped answer cache only for a clearly cacheable read-only question.
3. Update a policy document and verify cache invalidation. Ensure user/tenant scope, model/prompt version and corpus version participate in appropriate keys.
4. Load test with 1, 5 and 10 concurrent synthetic clients against mock mode first. Report p50/p95, errors and throughput; then run a small bounded live comparison if budget permits.

**Save:** labs/day-25/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] A policy update cannot return the old cached answer.
- [ ] Cross-user or cross-scope cache access is rejected.
- [ ] Measurements identify mock versus live runs and include sample sizes.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Does prompt caching remember facts across user sessions like a memory store?

<details><summary>Reveal the explanation after answering</summary>

No. It reuses part of prompt processing. Persistent application memory is a separate data-management feature with scope, retention and retrieval rules.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Explore GPU memory, continuous batching, speculative decoding, model routing and capacity planning. Verify current cache eligibility and pricing before estimating savings.

## Day 26 — Multimodal, voice and document agents

**Stage:** Production & innovation · **Core estimate:** 150 minutes · **Prerequisite:** Day 25; earlier ideas remain available for review

### Connect to what you know

You understand text tokens, vectors and tools. Other modalities add parsing, alignment and specialized failure cases.

### Understand it

Vision-language models connect images and text; image understanding is different from image generation. OCR extracts visible text but may lose layout or misread characters. Speech systems may use speech-to-text, a text model and text-to-speech, or an integrated real-time model. Latency, interruptions and transcription ambiguity matter in voice interaction. Multimodal inputs can also contain injected instructions and sensitive data.

**Real-world connection:** A user sends a screenshot of an error. The system should read visible details, distinguish observation from inference and ask for missing context before acting.

**Topics:** VLMs, CLIP and contrastive learning orientation; OCR, layout, tables and document parsing; image generation and diffusion recap; STT/TTS, streaming voice and interruption; multimodal evaluation and privacy.

### By the end, you should be able to

- Add one multimodal input path to the support prototype.
- Separate extracted observations from inferred conclusions.
- Design confirmation for ambiguous voice actions.

### Read or watch with a purpose

- **Core:** [Exploring Multimodal Text and Vision Models](https://huggingface.co/learn/computer-vision-course/en/unit4/multimodal-models/pre-intro) — Hugging Face Community Computer Vision Course. Read CLIP, VLM and visual question-answering introductions; choose one small exercise.
- **Core:** [Unit 1: An Introduction to Diffusion Models](https://huggingface.co/learn/diffusion-course/unit1/1) — Hugging Face. Read 'What Are Diffusion Models?'; notebooks are optional after checking hardware.
- **Reference / optional:** [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling) — Google. Follow one current API/SDK example end to end; do not mix Interactions and Generate Content schemas.

### Hands-on lab

1. Create a synthetic screenshot containing a support error code and one irrelevant instruction. Avoid personal or company data.
2. Use OCR or a small supported vision endpoint to extract error code and visible text into a validated schema; provide a mock fixture if hardware or API access is unavailable.
3. Retrieve the matching support runbook and return a cited answer with an explicit note for uncertain extraction.
4. Draw a voice pipeline and test a synthetic ambiguous transcript such as 'restart service A/B'. Require clarification and approval before any simulated action.

**Save:** labs/day-26/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The output separates visible evidence from interpretation.
- [ ] Instructions embedded in an image do not gain authority.
- [ ] A voice misrecognition cannot silently trigger an action.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Is a screenshot-to-answer pipeline trustworthy merely because it uses a vision model?

<details><summary>Reveal the explanation after answering</summary>

No. Extraction, interpretation, retrieval and generation can each fail. Validate extracted fields and test the whole pipeline.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Optional: run a local STT/TTS loop, investigate speaker diarization, video sampling and accessibility, or complete one diffusion notebook. Record latency and limitations.

## Day 27 — Fine-tuning and efficient models

**Stage:** Production & innovation · **Core estimate:** 180 minutes · **Prerequisite:** Day 26; earlier ideas remain available for review

### Connect to what you know

You have tried prompting, retrieval and engineering improvements. Fine-tuning is another intervention, chosen for a measured problem.

### Understand it

Fine-tuning updates parameters for a task or behavior. LoRA trains low-rank adapter matrices while leaving most base parameters frozen. Quantization changes numerical representation; distillation trains a student from a teacher's behavior. These are different operations and can be combined. A tuning dataset must be permitted, representative and separated from evaluation. Fine-tuning is not a reliable substitute for frequently changing factual retrieval.

**Real-world connection:** Teaching a consistent writing style is different from handing someone today's policy document. Training can shape behavior; retrieval can supply current evidence.

**Topics:** SFT and data preparation; LoRA/QLoRA and PEFT; distillation vs quantization vs retrieval; DPO/RLHF overview and reward hacking; training loss vs task quality, overfitting and leakage.

### By the end, you should be able to

- Decide whether tuning solves the observed failure.
- Inspect adapter parameter counts and run a small feasible experiment.
- Compare a tuned candidate with the original on held-out behavior.

### Read or watch with a purpose

- **Core:** [PEFT Quicktour](https://huggingface.co/docs/peft/en/quicktour) — Hugging Face. Inspect LoRA configuration, trainable parameter counts and save/load; run only a feasible small example.
- **Optional research:** [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531) — Hinton, Vinyals and Dean. Optional: abstract and teacher/student idea; distinguish distillation from quantization.
- **Optional research:** [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290) — Rafailov et al.. Optional: abstract and high-level method; focus on preference pairs and the training objective.

### Hands-on lab

1. Pick a narrow task such as support-response formatting. Create synthetic demonstrations from development data only and review every example.
2. Configure a small PEFT/LoRA experiment from the official quicktour. Count total and trainable parameters and estimate memory before running.
3. Run a CPU-feasible tiny-model adaptation or a explicitly budgeted short GPU session. If not feasible, analyze a supplied example configuration and mark training as not executed; do not claim a completed training lab.
4. Compare the untouched base, prompted base and adapted model on a separate evaluation set. Save adapter revision, data hash, training settings and both improvements and regressions.

**Save:** labs/day-27/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The evaluation set is not used as training examples.
- [ ] The report distinguishes an actual run from configuration-only work.
- [ ] You can explain why lower training loss need not mean a better support assistant.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Should you fine-tune a model whenever your refund policy changes?

<details><summary>Reveal the explanation after answering</summary>

Usually first consider updating the authoritative data and retrieval pipeline. Tuning may help behavior or task specialization, but it is not the default mechanism for frequent factual updates.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Optional deeper work: QLoRA, preference-data quality, catastrophic forgetting, model merging, distributed training and RL from verifiable rewards. These remain advanced extensions inside this day.

## Day 28 — Deploy one agent and understand three clouds

**Stage:** Production & innovation · **Core estimate:** 180 minutes · **Prerequisite:** Day 27; earlier ideas remain available for review

### Connect to what you know

You already know Docker and some Kubernetes. Start by packaging the tested service; managed deployment does not repair an unreliable agent.

### Understand it

Deploy the learning portal on Vercel, but choose a runtime suited to the Python agent's execution length and state. Long-running tasks need durable work tracking and potentially queues or dedicated runtimes. AWS AgentCore, Google ADK deployment targets and Microsoft Foundry Agent Service provide different managed capabilities. Feature status, region availability, identity configuration and pricing must be checked at deployment time.

**Real-world connection:** A web request counter can live in a short request handler. A long investigation that waits for human approval needs a saved job and a place to resume.

**Topics:** Docker, health/readiness, environment configuration; Vercel portal vs Python agent runtime; AWS AgentCore, GCP Cloud Run/ADK, Azure Foundry mapping; IAM/service identity, secret managers and private access; queues, autoscaling, CI/CD, rollback and cost controls.

### By the end, you should be able to

- Run the agent as a container.
- Deploy to one chosen cloud if access and budget are available.
- Map equivalent architectural responsibilities across three clouds.

### Read or watch with a purpose

- **Core:** [What is Amazon Bedrock AgentCore?](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html) — AWS. Read component responsibilities; follow the linked current runtime quickstart only for the selected deployment.
- **Core:** [Deploying Your Agent](https://adk.dev/deploy/) — Google ADK. Compare managed runtime, Cloud Run and GKE; follow one current deployment path.
- **Reference / optional:** [What is Microsoft Foundry Agent Service?](https://learn.microsoft.com/en-us/azure/foundry/agents/overview) — Microsoft Learn. Read prompt versus hosted agents, identity, persistence and operations.
- **Reference / optional:** [Storage on Vercel Marketplace](https://vercel.com/docs/marketplace-storage) — Vercel. Read Postgres and key-value integrations; use the Blob companions for the preferred lightweight adapter.

### Hands-on lab

1. Build a non-root Docker image with pinned dependencies, a health route, configurable port, graceful shutdown and no baked-in secrets. Run locally and execute smoke tests.
2. Choose one path: AWS AgentCore as the primary guided option, or GCP Cloud Run if that is your available environment. Verify current quickstart, region, IAM and cost controls.
3. Deploy the already-tested agent with external durable checkpoints, scoped secrets, bounded concurrency and observability. If credentials are absent, finish configuration and local container verification and label cloud execution pending.
4. Create a three-cloud mapping table for runtime, identity, secrets, object storage, state, model endpoint and telemetry. Document rollback and teardown to stop ongoing costs.

**Save:** labs/day-28/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The same container passes local health and task smoke tests.
- [ ] Secrets are configured outside source and image layers.
- [ ] The report lists exactly what was deployed, what was only designed and how to remove resources.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** Should you keep workflow checkpoints only in a container's filesystem?

<details><summary>Reveal the explanation after answering</summary>

No. Container filesystems may be ephemeral and replicas do not automatically share them. Use appropriate durable external storage for production state.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Optional: deploy to Kubernetes with readiness/liveness, resource limits and an HPA; package Helm values. Compare this operational burden with the managed option.

## Day 29 — Capstone: prove the system works

**Stage:** Production & innovation · **Core estimate:** 180 minutes · **Prerequisite:** Day 28; earlier ideas remain available for review

### Connect to what you know

All previous labs feed one product. Today you freeze a candidate and test the whole system instead of adding more frameworks.

### Understand it

The capstone combines evidence retrieval, controlled tools, durable approvals, scoped memory and useful traces. Define success for a specific use case and evaluate against a simpler baseline. Offline scores, load tests and adversarial cases answer different questions. Treat release thresholds as chosen engineering gates, not universal scientific standards. If a candidate fails, explain why and make the smallest justified change.

**Real-world connection:** Before opening a bridge, engineers check load, failure conditions and operating procedures—not just its appearance. Your agent needs similar evidence within its much smaller scope.

**Topics:** end-to-end integration and release gates; regression, load, fault and adversarial tests; holdout discipline and reproducibility; architecture decisions and limitations; runbooks, rollback and incident response.

### By the end, you should be able to

- Deliver an end-to-end support-agent demo.
- Report honest quality, latency and action-safety results.
- Make a defensible release/no-release decision.

### Read or watch with a purpose

- **Core:** [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) — OpenAI. Read datasets, repeated evaluations and trace grading; map these to your local harness.
- **Core:** [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — Anthropic. Read tasks, trials, graders, traces and outcomes; compare transcript with resulting state.
- **Reference / optional:** [AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html) — AWS. Read traces, usage, latency and error monitoring; map them to local instrumentation.

### Hands-on lab

1. Freeze code, prompts, model identifiers, corpus version and tool contracts. Demonstrate question → evidence → answer and request → draft → approval → one simulated ticket.
2. Run the final holdout once for this frozen candidate, then report per-case outcomes. If you change the design afterward, label the holdout as used and create fresh unseen cases for a new final evaluation.
3. Run restart-during-approval, provider timeout, stale document, injected evidence and duplicate-submit tests, plus a small controlled load test.
4. Write a release report comparing keyword/rules baseline, RAG and the agent. Include unsupported-answer rate, appropriate abstention, unauthorized actions, duplicate side effects, latency, usage and known gaps.

**Save:** labs/day-29/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] Zero unauthorized or duplicate actions occur in the defined test suite; this is not a universal safety guarantee.
- [ ] All tested factual claims have inspectable support or a documented failure.
- [ ] The release report links code revision, case-level results, traces and runbook.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** If a release gate fails, should you tune the prompt on the final holdout until it passes?

<details><summary>Reveal the explanation after answering</summary>

No. That converts the holdout into development data. Investigate with development cases and use new held-out examples for an honest final check.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Record a short demonstration for Harshith/Aparna and review each other's cases. Add a failure postmortem, not just a successful walkthrough.

## Day 30 — Explain, redesign and invent

**Stage:** Production & innovation · **Core estimate:** 150 minutes · **Prerequisite:** Day 29; earlier ideas remain available for review

### Connect to what you know

You have built and tested a narrow agent system. The final skill is transferring that reasoning to a new problem without reaching for every tool at once.

### Understand it

Engineering judgment connects the use case, data, risk, evaluation and operating constraints to an architecture. Sometimes the right design is a deterministic function, sometimes retrieval, a model call, a workflow or an agent. Read papers by asking what problem they solve, what assumptions they make, how they evaluate and what remains unproven. Product claims and published case studies need context and do not reveal every detail of proprietary model training.

**Real-world connection:** An experienced architect can explain why a small building needs a simple foundation and a hospital needs different controls. AI systems deserve the same use-case-specific reasoning.

**Topics:** architecture tradeoffs and innovation experiments; reading papers: claim, method, evidence, limitations; build vs buy and model/framework selection; enterprise case studies and vendor-report caveats; personal skill map and deliberate practice.

### By the end, you should be able to

- Explain your system without jargon to a non-AI colleague.
- Design a second use case and justify every AI component.
- Identify evidence of progress and the next skills needing repetition.

### Read or watch with a purpose

- **Core:** [Thomson Reuters and Anthropic Expand Partnership to Connect Claude with CoCounsel Legal](https://www.thomsonreuters.com/en/press-releases/2026/may/thomson-reuters-and-anthropic-expand-partnership-to-connect-claude-with-cocounsel-legal) — Thomson Reuters. Read the described MCP integration, domain content, references and planned agent architecture.
- **Core:** [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Anthropic. Read architecture, coordination failures, cost tradeoffs and evaluation approach.
- **Optional research:** [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Vaswani et al.. Optional: abstract, architecture figure and attention equation; full derivation is not required.
- **Reference / optional:** [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — Anthropic. Read workflows versus agents and the pattern relevant to today's lab.

### Hands-on lab

1. Give a ten-minute demonstration: explain tokens → model → retrieval → tools → graph → evaluation → deployment, using your own code and one failure example.
2. Design one new use case such as a cloud-cost investigator, developer onboarding helper or purchase-policy assistant. State user, data, risk, baseline, success metric and smallest useful experiment.
3. Write a one-page research proposal comparing two approaches with fixed data and budgets. Use one original paper and one first-party enterprise case as inspiration, clearly separating published claims from your own hypothesis.
4. Rate each course competency as explain, implement with guidance, implement independently or diagnose/extend, attaching evidence. Select optional extensions within the existing 30 days; do not add calendar pressure or invent a day 31.

**Save:** labs/day-30/README.md plus the named runnable code, results and evidence.

### Acceptance checks

- [ ] The new design includes a non-agent baseline and a measurable success condition.
- [ ] Your self-assessment links actual artifacts rather than hours watched.
- [ ] You can explain limitations and uncertainty as clearly as successful behavior.

**Evidence note:** Link a code commit or record local artifact filenames, summarize observed output, state what failed and label any mock or unexecuted part.

### Check your understanding

**Question:** What demonstrates progress better: naming ten frameworks or explaining one measured design tradeoff?

<details><summary>Reveal the explanation after answering</summary>

Explaining a real decision with working code, failure analysis and evidence demonstrates transferable skill. Framework familiarity helps when it serves that reasoning.

</details>

**Reflection:** What can you explain or build now that you could not before? What failed, and what would you try next?

### Optional depth — inside this day, not extra required days

Revisit any of the 30 days at greater depth. Optional specializations: recommender systems, time series, causal ML, GNNs, vision, speech, robotics, distributed training, interpretability, AI security and research methodology.


## Keep expectations and evidence honest

No universal 'zero hallucinations' or 'temperature zero means always deterministic' claim is supported here. Use explicit evidence, deterministic policy code, calibrated evaluation and bounded actions. The course's labs and estimates are original teaching recommendations. Provider documentation and enterprise examples support the linked concepts, but APIs, prices and product availability must be checked when you implement. See SOURCES.md for publisher/date/access details and TOPIC-MAP.md for optional specialization paths.

