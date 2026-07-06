import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, doc, setDoc, onSnapshot, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { generateSessionCode } from "../utils/idGenerator";

// The teacher's home base: shows every saved quiz and lets the teacher
// launch a brand-new live session for any of them (a fresh join code
// every time, so old sessions don't mix with new ones).
export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "quizzes"), (snapshot) => {
      setQuizzes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  async function startSession(quizId) {
    setErrorMessage("");
    try {
      const code = generateSessionCode();
      await setDoc(doc(db, "sessions", code), {
        quizId,
        status: "lobby", // lobby -> question -> paused -> leaderboard -> ended
        currentQuestionIndex: -1,
        questionStartedAt: null,
        createdAt: serverTimestamp(),
      });
      navigate(`/control/${code}`);
    } catch (err) {
      // Most likely cause: Firestore security rules are blocking the
      // write. Check Firestore > Rules in the Firebase console.
      setErrorMessage("Could not start a session: " + err.message);
    }
  }

  async function deleteQuiz(quizId) {
    if (!confirm("Delete this quiz? This can't be undone.")) return;
    await deleteDoc(doc(db, "quizzes", quizId));
  }

  return (
    <div className="page">
      <Link className="back-link" to="/">
        &larr; Home
      </Link>
      <h1>Teacher Dashboard</h1>
      <Link className="btn btn-primary" to="/teacher/create">
        + New Quiz
      </Link>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="quiz-list">
        {quizzes.length === 0 && <p className="muted">No quizzes yet - create one above.</p>}
        {quizzes.map((q) => (
          <div key={q.id} className="quiz-card">
            <div>
              <h3>{q.title}</h3>
              <p className="muted">{q.questions?.length || 0} questions</p>
            </div>
            <div className="button-row">
              <button className="btn btn-text" onClick={() => deleteQuiz(q.id)}>
                Delete
              </button>
              <button className="btn btn-primary" onClick={() => startSession(q.id)}>
                Start Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
