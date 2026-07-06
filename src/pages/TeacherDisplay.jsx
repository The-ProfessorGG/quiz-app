import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import QRCodeBox from "../components/QRCodeBox";
import Leaderboard from "../components/Leaderboard";
import Timer from "../components/Timer";

const APP_URL = window.location.origin + import.meta.env.BASE_URL;

// This is the "big screen" view for the classroom projector. It has NO
// controls - the teacher drives everything from /control/:code on their
// own device. This page's link/QR code is what gets embedded in
// PowerPoint slides, since it's completely safe to click/scan.
export default function TeacherDisplay() {
  const { sessionCode } = useParams();
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "sessions", sessionCode), (snap) => setSession(snap.data()));
    return unsub;
  }, [sessionCode]);

  useEffect(() => {
    if (!session?.quizId) return;
    const unsub = onSnapshot(doc(db, "quizzes", session.quizId), (snap) => setQuiz(snap.data()));
    return unsub;
  }, [session?.quizId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sessions", sessionCode, "students"), (snap) =>
      setStudentCount(snap.size)
    );
    return unsub;
  }, [sessionCode]);

  if (!session) return <div className="page center-page">Loading...</div>;

  const joinUrl = `${APP_URL}#/join/${sessionCode}`;

  if (session.status === "lobby") {
    return (
      <div className="page center-page display-page">
        <h1>Join the Quiz!</h1>
        <QRCodeBox url={joinUrl} size={280} />
        <h2 className="session-code-big">{sessionCode}</h2>
        <p className="muted">
          {studentCount} player{studentCount === 1 ? "" : "s"} joined
        </p>
      </div>
    );
  }

  if (session.status === "leaderboard" || session.status === "ended") {
    return (
      <div className="page display-page">
        <h1>{session.status === "ended" ? "Final Results" : "Leaderboard"}</h1>
        <Leaderboard sessionCode={sessionCode} />
      </div>
    );
  }

  // status is "question" or "paused"
  const question = quiz?.questions?.[session.currentQuestionIndex];
  if (!question) return <div className="page center-page">Loading question...</div>;

  return (
    <div className="page display-page">
      <p className="muted">
        Question {session.currentQuestionIndex + 1} of {quiz.questions.length}
      </p>
      <h1 className="display-question">{question.text}</h1>

      {session.status === "paused" ? (
        <p className="paused-banner">Paused</p>
      ) : (
        <Timer startedAt={session.questionStartedAt} />
      )}

      {question.type === "mc" && (
        <div className="option-grid">
          {question.options.map(
            (opt, i) =>
              opt && (
                <div key={i} className="option-tile">
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span> {opt}
                </div>
              )
          )}
        </div>
      )}
      {question.type === "input" && <p className="muted">Type your answer on your phone</p>}
    </div>
  );
}
