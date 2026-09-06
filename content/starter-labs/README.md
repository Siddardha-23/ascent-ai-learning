# Atlas Support starter fixtures

All documents, policies, services, questions and dates here are **fictional teaching data** created for this course. They do not describe HCL, any real employer or an actual commercial service.

- corpus.json: 13 documents including an obsolete policy, a restricted document and an explicitly untrusted injection exercise.
- questions-dev.json: 20 development questions, including 5 unanswerable cases.
- questions-holdout.json: 10 final evaluation questions; reserve them until the candidate is frozen.
- baseline.py: deterministic lexical retrieval, standard library only.
- service-status.json: synthetic tool responses, not live service status.

## First run

```text
python baseline.py --split dev
```

The output lists retrieved document IDs and retrieval metrics. This baseline **does not answer questions** and cannot prove that an answer is correct. Keep it as a comparison when you add embeddings, hybrid retrieval and agent tools.

Mean Recall@k is the mean fraction of each answerable question's gold documents found in the top k. MRR uses the first relevant rank. Unanswerable cases are excluded from those two denominators and reported separately. Empty retrieval on unknown questions is diagnostic only: an agent may need to abstain even when retrieval returns a superficially similar document.

The scope filter is a teaching demonstration. An actual enterprise service must derive authorization from a trusted principal, not accept a client-provided scope string.

Do not send gold answers into a model's prompt. Do not optimize against the holdout. After changing a model using final-test feedback, create a new untouched evaluation set.

## Build on these fixtures

Days 11–14: embed/chunk the public corpus and compare rankings.
Days 15–16: manually extract ownership and dependency edges with source IDs.
Days 17–22: implement read-only status/search tools and approval-gated simulated tickets.
Days 23–29: add explicit action, failure and security cases beyond these question-answer fixtures.

No real email, refund, infrastructure change or external ticket should be created by these labs.

