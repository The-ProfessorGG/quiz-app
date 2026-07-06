import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Timer from "../components/Timer";
import Leaderboard from "../components/Leaderboard";
import { calculatePoints } from "../utils/scoring";

export default function StudentPlay() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const studentId = localStorage.getItem("quiz_student_id");

  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [lastResult, setLastResult] = useState(null);

  // If someone opens this page without joining first, send them back.
  useEffect(() => {
    if (!studentId || localStorage.getItem("quiz_session_code") !== sessionCode) {
      navigate(`/join/${sessionCode}`);
    }
  }, [studentId, sessionCode, navigate]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "sessions", sessionCode), (snap) => setSession(snap.data()));
    return unsub;
  }, [sessionCode]);

  useEffect(() => {
    if (!session?.quizId) return;
    const unsub = onSnapshot(doc(db, "quizzes", session.quizId), (snap) => setQuiz(snap.data()));
    return unsub;
  }, [session?.quizId]);

  // Reset the answer form every time a new question starts.
  useEffect(() => {
    setHasAnswered(false);
    setTypedAnswer("");
    setLastResult(null);
  }, [session?.currentQuestionIndex]);

  if (!session || !quiz) return <div className="page center-page">Loading...</div>;

  const question = quiz.questions[session.currentQuestionIndex];

  async function submitAnswer(answerValue, isCorrect) {
    if (hasAnswered) return;
    setHasAnswered(true);

    const startMs = session.questionStartedAt.toMillis
      ? session.questionStartedAt.toMillis()
      : session.questionStartedAt;
    const elapsedSeconds = (Date.now() - startMs) / 1000;
    const points = calculatePoints(isCorrect, elapsedSeconds);

    // Answers are stored one-per-question-per-student, so a student can't
    // accidentally answer the same question twice.
    const answerId = `${session.currentQuestionIndex}_${studentId}`;
    await setDoc(doc(db, "sessions", sessionCode, "answers", answerId), {
      studentId,
      questionIndex: session.currentQuestionIndex,
      answer: answerValue,
      correct: isCorrect,
      points,
      answeredAt: serverTimestamp(),
    });

    // Add these points onto the student's running total score.
    await updateDoc(doc(db, "sessions", sessionCode, "students", studentId), {
      score: increment(points),
    });

    setLastResult({ correct: isCorrect, points });
  }

  function handleSelectOption(index) {
    submitAnswer(index, index === question.correctIndex);
  }

  function handleSubmitTyped(e) {
    e.preventDefault();
    const isCorrect =
      typedAnswer.trim().toLowerCase() === (question.correctAnswer || "").trim().toLowerCase();
    submitAnswer(typedAnswer.trim(), isCorrect);
  }

  if (session.status === "lobby") {
    return (
      <div className="page center-page">
        <h1>You're in!</h1>
        <p className="muted">Waiting for the teacher to start the quiz...</p>
      </div>
    );
  }

  if (session.status === "leaderboard" || session.status === "ended") {
    return (
      <div className="page">
        <h1>{session.status === "ended" ? "Quiz Over!" : "Leaderboard"}</h1>
        <Leaderboard sessionCode={sessionCode} />
      </div>
    );
  }

  // status: "question" or "paused"
  return (
    <div className="page">
      <p className="muted">
        Question {session.currentQuestionIndex + 1} of {quiz.questions.length}
      </p>
      <h2>{question.text}</h2>

      {session.status === "paused" && <p className="paused-banner">Paused by teacher</p>}
      {session.status === "question" && !hasAnswered && <Timer startedAt={session.questionStartedAt} />}

      {hasAnswered ? (
        <div className="answer-feedback">
          <p>Answer submitted!</p>
          {lastResult && (
            <p className={lastResult.correct ? "result-correct" : "result-incorrect"}>
              {lastResult.correct ? `Correct! +${lastResult.points} points` : "Incorrect - 0 points"}
            </p>
          )}
          <p className="muted">Waiting for the next question...</p>
        </div>
      ) : question.type === "mc" ? (
        <div className="option-grid answer-grid">
          {question.options.map(
            (opt, i) =>
              opt && (
                <button
                  key={i}
                  className="option-btn"
                  onClick={() => handleSelectOption(i)}
                  disabled={session.status === "paused"}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span> {opt}
                </button>
              )
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmitTyped} className="typed-answer-form">
          <input
            className="text-input"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="Type your answer"
            disabled={session.status === "paused"}
          />
          <button className="btn btn-primary" disabled={session.status === "paused"}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
