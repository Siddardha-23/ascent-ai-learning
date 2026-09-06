"""A deliberately simple lexical retrieval baseline. No model, network or secrets.

Run from anywhere:
    python baseline.py --split dev
Reserve --split holdout for a frozen final evaluation.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STOP = set("a an the is are was were what which who how can could should do does did i we you my our your for to of in on and or it be as at with from that this after".split())

def tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower())) - STOP

def retrieve(question: str, documents: list[dict], k: int = 3, scope: str = "public") -> list[dict]:
    if k < 1:
        raise ValueError("k must be positive")
    query = tokens(question)
    ranked = []
    for doc in documents:
        # A toy scope filter, not real authentication/authorization.
        if doc["visibility"] != "public" and scope != "internal-demo":
            continue
        overlap = query & tokens(doc["title"] + " " + doc["text"])
        if overlap:
            ranked.append({"id": doc["id"], "score": len(overlap), "matchedTerms": sorted(overlap)})
    return sorted(ranked, key=lambda item: (-item["score"], item["id"]))[:k]

def evaluate(documents: list[dict], cases: list[dict], k: int = 3) -> dict:
    rows, recalls, reciprocal_ranks = [], [], []
    unknown, unknown_empty = 0, 0
    for case in cases:
        hits = retrieve(case["question"], documents, k, case["scope"])
        ids = [hit["id"] for hit in hits]
        gold = set(case["goldDocIds"])
        recall = len(gold & set(ids)) / len(gold) if gold else None
        if gold:
            recalls.append(recall)
            ranks = [i + 1 for i, value in enumerate(ids) if value in gold]
            reciprocal_ranks.append(1 / min(ranks) if ranks else 0)
        else:
            unknown += 1
            unknown_empty += int(not hits)
        rows.append({"id": case["id"], "question": case["question"], "retrieved": hits,
                     "goldDocIds": case["goldDocIds"], "recallAtK": recall})
    return {
        "mode": "lexical retrieval only; no answer generation",
        "corpusDocuments": len(documents),
        "evaluatedCases": len(cases), "k": k,
        "answerableCases": len(recalls),
        "meanRecallAtK": sum(recalls) / len(recalls) if recalls else None,
        "meanReciprocalRank": sum(reciprocal_ranks) / len(reciprocal_ranks) if reciprocal_ranks else None,
        "unanswerableCases": unknown,
        "emptyRetrievalRateOnUnanswerable": unknown_empty / unknown if unknown else None,
        "limitations": [
            "Lexical overlap can retrieve irrelevant evidence for an unanswerable question.",
            "Retrieval scores do not measure factual correctness or authorization.",
            "Synthetic fixtures are too small for production conclusions.",
            "Gold labels are for evaluation only; do not put them in the generation prompt."
        ],
        "cases": rows,
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--split", choices=["dev", "holdout"], default="dev")
    parser.add_argument("--k", type=int, default=3)
    args = parser.parse_args()
    documents = json.loads((ROOT / "corpus.json").read_text(encoding="utf-8"))
    cases = json.loads((ROOT / f"questions-{args.split}.json").read_text(encoding="utf-8"))
    print(json.dumps(evaluate(documents, cases, args.k), indent=2))

if __name__ == "__main__":
    main()

