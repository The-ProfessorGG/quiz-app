import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

// Live leaderboard: listens to every student in this session and
// automatically re-sorts whenever anyone's score changes.
export default function Leaderboard({ sessionCode, limit = 10 }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const studentsRef = collection(db, "sessions", sessionCode, "students");
    const q = query(studentsRef, orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [sessionCode]);

  return (
    <div className="leaderboard">
      <ol>
        {students.slice(0, limit).map((s, i) => (
          <li key={s.id} className="leaderboard-row">
            <span className="rank">#{i + 1}</span>
            <span className="name">{s.name}</span>
            <span className="score">{s.score || 0}</span>
          </li>
        ))}
        {students.length === 0 && <p className="muted">No players yet</p>}
      </ol>
    </div>
  );
}
