import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { generateId } from "../utils/idGenerator";

// Students land here either by scanning the QR code (which pre-fills the
// session code via the URL) or by typing the code in manually.
export default function StudentJoin() {
  const { sessionCode: codeFromUrl } = useParams();
  const [code, setCode] = useState(codeFromUrl || "");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  async function handleJoin(e) {
    e.preventDefault();
    setError("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return setError("Please enter a session code.");
    if (!name.trim()) return setError("Please enter your name.");

    setJoining(true);
    try {
      const sessionSnap = await getDoc(doc(db, "sessions", cleanCode));
      if (!sessionSnap.exists()) {
        setError("No quiz found with that code. Check with your teacher.");
        setJoining(false);
        return;
      }

      // Each student gets their own id, saved on their device so a page
      // refresh keeps them in the same session with the same score.
      const studentId = generateId();
      await setDoc(doc(db, "sessions", cleanCode, "students", studentId), {
        name: name.trim(),
        score: 0,
        joinedAt: serverTimestamp(),
      });

      localStorage.setItem("quiz_student_id", studentId);
      localStorage.setItem("quiz_session_code", cleanCode);
      navigate(`/play/${cleanCode}`);
    } catch (err) {
      setError("Something went wrong: " + err.message);
      setJoining(false);
    }
  }

  return (
    <div className="page center-page">
      <Link className="back-link" to="/">
        &larr; Home
      </Link>
      <h1>Join Quiz</h1>
      <form className="join-form" onSubmit={handleJoin}>
        <label className="field-label">Session Code</label>
        <input
          className="text-input text-input-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. K7F9QX"
          maxLength={8}
        />
        <label className="field-label">Your Name</label>
        <input
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah"
          maxLength={30}
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={joining}>
          {joining ? "Joining..." : "Join Quiz"}
        </button>
      </form>
    </div>
  );
}
