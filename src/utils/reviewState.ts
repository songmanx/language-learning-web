import type { AnswerLog, ReviewStateRecord } from "../services/apiTypes";

export function computeReviewState(answerLog: AnswerLog[]): ReviewStateRecord[] {
  return answerLog.map((answer) => {
    if (answer.correct) {
      return {
        wordId: answer.wordId,
        priorityScore: Math.max(10, 40 - answer.comboAfterAnswer * 5),
        reviewStage: answer.comboAfterAnswer >= 2 ? "review" : "learning",
        lastResult: "correct",
      };
    }

    return {
      wordId: answer.wordId,
      priorityScore: 100,
      reviewStage: "learning",
      lastResult: "wrong",
    };
  });
}
