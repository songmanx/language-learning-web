import { describe, expect, it } from "vitest";
import { buildSaveSessionPayload } from "./session";

describe("buildSaveSessionPayload", () => {
  it("counts only answered questions when a session ends early", () => {
    const words = [
      {
        id: "word-1",
        prompt: "neko",
        choices: ["cat", "dog", "bird", "fish"],
        answer: "cat",
        meaning: "cat",
        difficulty: "1",
        questionType: "word_to_meaning" as const,
      },
      {
        id: "word-2",
        prompt: "inu",
        choices: ["cat", "dog", "bird", "fish"],
        answer: "dog",
        meaning: "dog",
        difficulty: "2",
        questionType: "word_to_meaning" as const,
      },
      {
        id: "word-3",
        prompt: "tori",
        choices: ["cat", "dog", "bird", "fish"],
        answer: "bird",
        meaning: "bird",
        difficulty: "3",
        questionType: "word_to_meaning" as const,
      },
    ];

    const payload = buildSaveSessionPayload({
      playerId: "player-demo",
      languageCode: "ja",
      modeType: "standard",
      totalTimeSec: 7,
      score: 12,
      heartsLeft: 0,
      answers: [
        {
          word: words[0],
          questionType: "word_to_meaning",
          shownPrompt: "neko",
          difficultySnapshot: "1",
          responseTimeMs: 1200,
          selectedAnswer: "cat",
          correct: true,
          comboAfterAnswer: 1,
          earnedScore: 12,
        },
        {
          word: words[1],
          questionType: "word_to_meaning",
          shownPrompt: "inu",
          difficultySnapshot: "2",
          responseTimeMs: 900,
          selectedAnswer: "bird",
          correct: false,
          comboAfterAnswer: 0,
          earnedScore: 0,
        },
      ],
    });

    expect(payload.totalQuestions).toBe(2);
    expect(payload.correctAnswers).toBe(1);
    expect(payload.modeType).toBe("standard");
    expect(payload.quizType).toBe("word_to_meaning");
    expect(payload.totalTimeSec).toBe(7);
    expect(payload.answerLog).toHaveLength(2);
    expect(payload.answerLog[0]).toMatchObject({
      questionType: "word_to_meaning",
      shownPrompt: "neko",
      difficultySnapshot: "1",
      responseTimeMs: 1200,
    });
  });
});
