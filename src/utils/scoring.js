// Scoring rules (as requested):
// - Correct answer given instantly (0s elapsed)  -> 1000 points
// - Correct answer given right at the 60s limit  -> 500 points
// - Points fall in a straight line between those two values
// - Any wrong/late answer                        -> 0 points
export const QUESTION_TIME_LIMIT = 60; // seconds

export function calculatePoints(isCorrect, elapsedSeconds) {
  if (!isCorrect) return 0;

  // Clamp in case of clock drift or a slightly-late network request.
  const clampedTime = Math.max(0, Math.min(elapsedSeconds, QUESTION_TIME_LIMIT));
  const points = 1000 - (clampedTime / QUESTION_TIME_LIMIT) * 500;
  return Math.round(points);
}
