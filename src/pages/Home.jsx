import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page center-page">
      <h1>Classroom Quiz</h1>
      <p className="muted">Live quizzes for the classroom.</p>
      <div className="button-stack">
        <Link className="btn btn-primary" to="/teacher">
          I'm a Teacher
        </Link>
        <Link className="btn btn-outline" to="/join">
          I'm a Student
        </Link>
      </div>
    </div>
  );
}
