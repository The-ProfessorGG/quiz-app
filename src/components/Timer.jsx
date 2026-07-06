import { useEffect, useState } from "react";
import { QUESTION_TIME_LIMIT } from "../utils/scoring";

// Shows a 60-second countdown based on when the question started on the
// SERVER (not the device's own clock). This keeps every student's timer
// in sync even if their phone's clock is wrong or their connection lags.
export default function Timer({ startedAt, onExpire }) {
  const [remaining, setRemaining] = useState(QUESTION_TIME_LIMIT);

  useEffect(() => {
    if (!startedAt) return;

    // Firestore timestamps have a .toMillis() helper; fall back to a
    // plain number just in case.
    const startMs = startedAt.toMillis ? startedAt.toMillis() : startedAt;

    function tick() {
      const elapsed = (Date.now() - startMs) / 1000;
      const left = Math.max(0, Math.ceil(QUESTION_TIME_LIMIT - elapsed));
      setRemaining(left);
      if (left <= 0 && onExpire) onExpire();
    }

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [startedAt]);

  const percent = (remaining / QUESTION_TIME_LIMIT) * 100;

  return (
    <div className="timer">
      <div className="timer-bar-bg">
        <div className="timer-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="timer-number">{remaining}s</span>
    </div>
  );
}
