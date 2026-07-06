import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import QRCodeBox from "../components/QRCodeBox";

// Where this app is hosted, respecting the Vite "base" setting - used to
// build the shareable display/join links.
const APP_URL = window.location.origin + import.meta.env.BASE_URL;

// This is the page the TEACHER keeps open on their own laptop/phone to
// drive the quiz. Students and the projector never see this page.
export default function TeacherControl() {
  const { sessionCode } = useParams();
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

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

  useEffect(() => {
    if (!session || session.currentQuestionIndex < 0) return;
    const answersRef = collection(db, "sessions", sessionCode, "answers");
    const q = query(answersRef, where("questionIndex", "==", session.currentQuestionIndex));
    const unsub = onSnapshot(q, (snap) => setAnsweredCount(snap.size));
    return unsub;
  }, [sessionCode, session?.currentQuestionIndex]);

  if (!session || !quiz) return <div className="page">Loading session...</div>;

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[session.currentQuestionIndex];

  // Each of these is wrapped in try/catch and alerts on failure. Without
  // this, a permissions error (e.g. Firestore rules not published yet)
  // would fail silently and the button would just appear to do nothing.
  async function startQuiz() {
    try {
      await updateDoc(doc(db, "sessions", sessionCode), {
        status: "question",
        currentQuestionIndex: 0,
        questionStartedAt: serverTimestamp(),
      });
    } catch (err) {
      alert("Could not start the quiz: " + err.message);
    }
  }

  async function nextQuestion() {
    try {
      const nextIndex = session.currentQuestionIndex + 1;
      if (nextIndex >= totalQuestions) {
        await updateDoc(doc(db, "sessions", sessionCode), { status: "ended" });
      } else {
        await updateDoc(doc(db, "sessions", sessionCode), {
          status: "question",
          currentQuestionIndex: nextIndex,
          questionStartedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      alert("Could not move to the next question: " + err.message);
    }
  }

  async function showLeaderboard() {
    try {
      await updateDoc(doc(db, "sessions", sessionCode), { status: "leaderboard" });
    } catch (err) {
      alert("Could not show the leaderboard: " + err.message);
    }
  }

  async function togglePause() {
    try {
      await updateDoc(doc(db, "sessions", sessionCode), {
        status: session.status === "paused" ? "question" : "paused",
      });
    } catch (err) {
      alert("Could not pause/resume: " + err.message);
    }
  }

  const displayUrl = `${APP_URL}#/display/${sessionCode}`;
  const joinUrl = `${APP_URL}#/join/${sessionCode}`;

  return (
    <div className="page">
      <Link className="back-link" to="/teacher">
        &larr; Dashboard
      </Link>
      <h1>Control Panel</h1>
      <p className="session-code-big" style={{ margin: "8px 0" }}>
        {sessionCode}
      </p>
      <p className="muted">{studentCount} joined</p>

      <div className="control-links">
        <p className="field-label">
          Put this on the projector - paste the link into a PowerPoint hyperlink,
          or save the QR code image and insert it as a picture on a slide:
        </p>
        <QRCodeBox url={displayUrl} size={140} />
        <a className="btn btn-outline" href={`${window.location.pathname}#/display/${sessionCode}`} target="_blank" rel="noreferrer">
          Open Display Screen (projector)
        </a>
        <p className="muted">Student join link: {joinUrl}</p>
      </div>

      <hr />

      {session.status === "lobby" && (
        <button className="btn btn-primary" onClick={startQuiz}>
          Start Quiz
        </button>
      )}

      {session.status !== "lobby" && session.status !== "ended" && (
        <div className="control-question">
          <h3>
            Question {session.currentQuestionIndex + 1} of {totalQuestions}
          </h3>
          <p>{currentQuestion?.text}</p>
          <p className="muted">
            {answeredCount} of {studentCount} answered
          </p>
          <div className="button-row">
            <button className="btn btn-outline" onClick={togglePause}>
              {session.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button className="btn btn-outline" onClick={showLeaderboard}>
              Show Leaderboard
            </button>
            <button className="btn btn-primary" onClick={nextQuestion}>
              {session.currentQuestionIndex + 1 >= totalQuestions ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        </div>
      )}

      {session.status === "ended" && (
        <h3>Quiz finished! The display screen is showing the final leaderboard.</h3>
      )}
    </div>
  );
}
