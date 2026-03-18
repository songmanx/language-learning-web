import { computeReviewState } from "./reviewState";

describe("computeReviewState", () => {
  it("오답은 높은 priority_score와 learning 상태를 부여한다", () => {
    const result = computeReviewState([
      {
        wordId: "ja-1",
        questionType: "word_to_meaning",
        shownPrompt: "ねこ",
        difficultySnapshot: "1",
        responseTimeMs: 1000,
        selectedAnswer: "개",
        correct: false,
        comboAfterAnswer: 0,
        earnedScore: 0,
      },
    ]);

    expect(result).toEqual([
      {
        wordId: "ja-1",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
      },
    ]);
  });

  it("연속 정답은 review 단계로 올린다", () => {
    const result = computeReviewState([
      {
        wordId: "ja-2",
        questionType: "word_to_meaning",
        shownPrompt: "みず",
        difficultySnapshot: "2",
        responseTimeMs: 800,
        selectedAnswer: "물",
        correct: true,
        comboAfterAnswer: 2,
        earnedScore: 14,
      },
    ]);

    expect(result[0]).toMatchObject({
      wordId: "ja-2",
      reviewStage: "review",
      lastResult: "correct",
    });
    expect(result[0].priorityScore).toBe(30);
  });
});
