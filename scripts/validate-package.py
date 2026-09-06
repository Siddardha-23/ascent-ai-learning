"""Validate the authored content in this app's layout (content/ + content/starter-labs/).

This mirrors the original package validator but resolves the canonical JSON from
content/ where the app ships it, and the docs/specs from the project root.
No network access or third-party packages required.
"""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
LABS = CONTENT / "starter-labs"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    course = read(CONTENT / "curriculum.json")
    sources = read(CONTENT / "sources.json")
    glossary = read(CONTENT / "glossary.json")

    source_ids = {x["id"] for x in sources}
    require(len(source_ids) == len(sources), "Duplicate source IDs")
    for source in sources:
        parsed = urlparse(source["url"])
        require(parsed.scheme == "https" and bool(parsed.netloc), f"Invalid source URL: {source['id']}")
        for key in ["title", "publisher", "assignment", "why", "verifiedOn"]:
            require(bool(source[key]), f"Missing source {key}")

    lessons = course["lessons"]
    require(len(lessons) == 30, "Expected exactly 30 lessons")
    require([x["day"] for x in lessons] == list(range(1, 31)), "Non-sequential lesson days")
    require(len({x["id"] for x in lessons}) == 30, "Duplicate lesson IDs")
    tasks = [task["id"] for day in lessons for task in day["tasks"]]
    require(len(tasks) == 240 and len(set(tasks)) == 240, "Expected 240 unique core task IDs")
    for i, day in enumerate(lessons):
        for key in ["title", "bridge", "explain", "analogy", "stretch", "evidencePrompt"]:
            require(bool(day[key]), f"Missing day {day['day']} {key}")
        require(len(day["explain"]) >= 250, f"Thin explanation day {day['day']}")
        require(len(day["goals"]) == 3 and len(day["lab"]["steps"]) == 4 and len(day["lab"]["checks"]) == 3,
                f"Incomplete lab day {day['day']}")
        require(bool(day["quiz"]["question"]) and bool(day["quiz"]["answer"]), "Incomplete checkpoint")
        require(set(day["resources"]) <= source_ids, f"Unresolved source day {day['day']}")
        expected = [] if i == 0 else [lessons[i - 1]["id"]]
        require(day["prerequisites"] == expected, f"Broken prerequisite chain day {day['day']}")
        require(sum(day["suggestedSession"].values()) == day["minutes"], "Session estimate mismatch")
        for assignment in day["resourceAssignments"]:
            require(assignment["sourceId"] in source_ids and bool(assignment["instruction"]), "Bad resource assignment")
    require(sum(day["minutes"] for day in lessons) / 60 == course["estimatedCoreHours"], "Course estimate mismatch")

    require(len({x["id"] for x in glossary}) == len(glossary), "Duplicate glossary IDs")
    for entry in glossary:
        require(entry["definition"] and entry["example"], "Incomplete glossary")
        require(1 <= entry["firstDay"] <= 30 and set(entry["sourceIds"]) <= source_ids, "Invalid glossary reference")

    corpus = read(LABS / "corpus.json")
    documents = {x["id"]: x for x in corpus}
    require(len(documents) == len(corpus), "Duplicate document IDs")
    dev = read(LABS / "questions-dev.json")
    holdout = read(LABS / "questions-holdout.json")
    require(not ({x["id"] for x in dev} & {x["id"] for x in holdout}), "Evaluation split overlap")
    require(not ({x["question"] for x in dev} & {x["question"] for x in holdout}), "Duplicated question across splits")
    for case in dev + holdout:
        require(set(case["goldDocIds"]) <= set(documents), "Invalid gold source")
        require(case["answerable"] == bool(case["goldDocIds"]), "Inconsistent answerability")
        if case["scope"] == "public":
            require(all(documents[x]["visibility"] == "public" for x in case["goldDocIds"]), "Restricted gold for public case")

    spec = importlib.util.spec_from_file_location("baseline", LABS / "baseline.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.retrieve("zzzzunmatchedterm", corpus) == [], "Unknown-term retrieval should be empty")
    hits = module.retrieve("Cedar", corpus)
    require(all(x["id"] != "restricted-roadmap" for x in hits), "Restricted-document leak")
    internal = module.retrieve("Cedar", corpus, scope="internal-demo")
    require(any(x["id"] == "restricted-roadmap" for x in internal), "Internal fixture unavailable")
    metric = module.evaluate(corpus, dev)
    require(metric["evaluatedCases"] == 20 and metric["answerableCases"] == 15, "Metric denominators wrong")

    for path in ["KIRO-PROMPT.md", "START-HERE.md", "CURRICULUM.md", "SOURCES.md", "TOPIC-MAP.md",
                 ".kiro/specs/ascent/requirements.md", ".kiro/specs/ascent/design.md", ".kiro/specs/ascent/tasks.md",
                 ".kiro/steering/product.md", ".kiro/steering/teaching.md"]:
        require((ROOT / path).is_file() and (ROOT / path).stat().st_size > 100, f"Missing deliverable: {path}")

    print(json.dumps({
        "result": "passed",
        "lessons": len(lessons),
        "coreTasks": len(tasks),
        "sources": len(sources),
        "glossaryTerms": len(glossary),
        "estimatedCoreHours": course["estimatedCoreHours"],
        "syntheticDocuments": len(corpus),
        "developmentQuestions": len(dev),
        "holdoutQuestions": len(holdout),
        "developmentBaselineRecallAt3": metric["meanRecallAtK"],
        "limits": "Structural/content and local baseline checks only. Application build/tests run separately via npm.",
    }, indent=2))


if __name__ == "__main__":
    main()
