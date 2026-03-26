import { describe, expect, it } from "vitest";
import type { AnswerLog, ReviewStateRecord } from "../services/apiTypes";
import { computeReviewState, mergeReviewState } from "./reviewState";

function createAnswer(overrides: Partial<AnswerLog> = {}): AnswerLog {
  return {
    wordId: "JA_N_0001",
    questionType: "word_to_meaning",
    shownPrompt: "猫",
    difficultySnapshot: "1",
    responseTimeMs: 1200,
    selectedAnswer: "고양이",
    correct: true,
    comboAfterAnswer: 1,
    earnedScore: 12,
    ...overrides,
  };
}

describe("reviewState", () => {
  it("keeps only wrong answers in computed review state", () => {
    const reviewState = computeReviewState([
      createAnswer({ wordId: "JA_N_0001", correct: true }),
      createAnswer({ wordId: "JA_N_0002", correct: false, selectedAnswer: "오답" }),
    ]);

    expect(reviewState).toEqual([
      {
        wordId: "JA_N_0002",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 0,
      },
    ]);
  });

  it("adds wrong answers from standard mode into review state", () => {
    const existing: ReviewStateRecord[] = [];

    const merged = mergeReviewState(existing, [createAnswer({ wordId: "JA_N_0010", correct: false })], "standard");

    expect(merged).toEqual([
      {
        wordId: "JA_N_0010",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 0,
      },
    ]);
  });

  it("increments mastery and removes a word after five correct review answers", () => {
    const existing: ReviewStateRecord[] = [
      {
        wordId: "JA_N_0010",
        priorityScore: 100,
        reviewStage: "learning",
        lastResult: "wrong",
        masteryCount: 4,
      },
    ];

    const merged = mergeReviewState(existing, [createAnswer({ wordId: "JA_N_0010", correct: true })], "review");

    expect(merged).toEqual([]);
  });

  it("resets mastery when a review answer is wrong", () => {
    const existing: ReviewStateRecord[] = [
      {
        wordId: "JA_N_0010",
        priorityScore: 40,
        reviewStage: "review",
        lastResult: "correct",
        masteryCount: 3,
      },
    ];

    const merged = mergeReviewState(existing, [createAnswer({ wordId: "JA_N_0010", correct: false })], "review");

    expect(merged[0]).toMatchObject({
      wordId: "JA_N_0010",
      priorityScore: 100,
      reviewStage: "learning",
      lastResult: "wrong",
      masteryCount: 0,
    });
  });
});
