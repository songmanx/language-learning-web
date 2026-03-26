import type { AnswerLog, ReviewStateRecord } from "../services/apiTypes";

type ReviewMergeMode = "standard" | "practice" | "review";
type NormalizedReviewStateRecord = ReviewStateRecord & { masteryCount: number };

function buildWrongReviewRecord(answer: AnswerLog): NormalizedReviewStateRecord {
  return {
    wordId: answer.wordId,
    priorityScore: 100,
    reviewStage: "learning",
    lastResult: "wrong",
    masteryCount: 0,
  };
}

export function computeReviewState(answerLog: AnswerLog[]): ReviewStateRecord[] {
  const reviewMap = new Map<string, ReviewStateRecord>();

  for (const answer of answerLog) {
    if (!answer.correct) {
      reviewMap.set(answer.wordId, buildWrongReviewRecord(answer));
    }
  }

  return [...reviewMap.values()];
}

export function mergeReviewState(
  existingReviewState: ReviewStateRecord[],
  answerLog: AnswerLog[],
  mode: ReviewMergeMode,
) {
  const reviewMap = new Map<string, NormalizedReviewStateRecord>(
    existingReviewState.map((item) => [
      item.wordId,
      {
        ...item,
        masteryCount: item.masteryCount ?? 0,
      } satisfies NormalizedReviewStateRecord,
    ]),
  );

  if (mode === "practice") {
    return [...reviewMap.values()];
  }

  for (const answer of answerLog) {
    if (mode === "standard") {
      if (!answer.correct) {
        reviewMap.set(answer.wordId, buildWrongReviewRecord(answer));
      }
      continue;
    }

    const current = reviewMap.get(answer.wordId);

    if (!current) {
      continue;
    }

    if (answer.correct) {
      const nextMasteryCount = (current.masteryCount ?? 0) + 1;

      if (nextMasteryCount >= 5) {
        reviewMap.delete(answer.wordId);
        continue;
      }

      reviewMap.set(answer.wordId, {
        ...current,
        masteryCount: nextMasteryCount,
        priorityScore: Math.max(20, current.priorityScore - 15),
        reviewStage: nextMasteryCount >= 3 ? "review" : "learning",
        lastResult: "correct",
      });
      continue;
    }

    reviewMap.set(answer.wordId, buildWrongReviewRecord(answer));
  }

  return [...reviewMap.values()].sort((left, right) => {
    if (right.priorityScore !== left.priorityScore) {
      return right.priorityScore - left.priorityScore;
    }

    return left.wordId.localeCompare(right.wordId);
  });
}
