/**
 * Build-time validator for the v2 adaptive-learning content modules.
 * Importing v2-content.ts parses + validates every module and runs referential
 * integrity (it throws on failure). This script surfaces the result on the CLI.
 *
 * Run: npx tsx scripts/validate-v2-content.ts
 */
import {
  competencies,
  prerequisiteModules,
  assessmentBank,
  lessonEnhancements,
  sourcesV2,
  checkV2Integrity,
} from "../src/lib/content/v2-content";

function main() {
  const errors = checkV2Integrity();
  if (errors.length > 0) {
    console.error("v2 content INVALID:");
    for (const e of errors) console.error(" - " + e);
    process.exit(1);
  }
  const verifiedQuestions = assessmentBank.filter((q) => q.type !== "self-report").length;
  console.log(
    JSON.stringify(
      {
        result: "passed",
        competencies: competencies.length,
        prerequisiteModules: prerequisiteModules.length,
        assessmentQuestions: assessmentBank.length,
        verifiedDiagnostics: verifiedQuestions,
        lessonEnhancements: lessonEnhancements.length,
        addedSources: sourcesV2.length,
      },
      null,
      2,
    ),
  );
}

main();
