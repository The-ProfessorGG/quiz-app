import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { generateId } from "../utils/idGenerator";

// A blank question template. "mc" = multiple choice, "input" = the
// student types their own answer.
const emptyQuestion = () => ({
  id: generateId(),
  type: "mc",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctAnswer: "",
});

export default function TeacherCreate() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function updateQuestion(index, changes) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...changes } : q)));
  }

  function updateOption(qIndex, oIndex, value) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[oIndex] = value;
        return { ...q, options };
      })
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()]);
  }

  function removeQuestion(index) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  async function saveQuiz() {
    setErrorMessage("");
    if (!title.trim()) {
      setErrorMessage("Please give the quiz a title.");
      return;
    }
    if (questions.length === 0) {
      setErrorMessage("Add at least one question.");
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        setErrorMessage("Every question needs some text.");
        return;
      }
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "quizzes"), {
        title: title.trim(),
        questions,
        createdAt: serverTimestamp(),
      });
      navigate("/teacher");
    } catch (err) {
      // Most likely cause: Firestore security rules are blocking the
      // write. Check Firestore > Rules in the Firebase console.
      setErrorMessage("Could not save quiz: " + err.message);
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <Link className="back-link" to="/teacher">
        &larr; Dashboard
      </Link>
      <h1>Create Quiz</h1>

      <label className="field-label">Quiz Title</label>
      <input
        className="text-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Chapter 4 Recap"
      />

      {questions.map((q, i) => (
        <div key={q.id} className="question-card">
          <div className="question-card-header">
            <h3>Question {i + 1}</h3>
            {questions.length > 1 && (
              <button className="btn btn-text" onClick={() => removeQuestion(i)}>
                Remove
              </button>
            )}
          </div>

          <label className="field-label">Question Type</label>
          <select
            className="text-input"
            value={q.type}
            onChange={(e) => updateQuestion(i, { type: e.target.value })}
          >
            <option value="mc">Multiple Choice</option>
            <option value="input">Typed Answer</option>
          </select>

          <label className="field-label">Question Text</label>
          <input
            className="text-input"
            value={q.text}
            onChange={(e) => updateQuestion(i, { text: e.target.value })}
            placeholder="Type the question here"
          />

          {q.type === "mc" ? (
            <>
              <label className="field-label">Options (select the correct one)</label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="option-row">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(i, { correctIndex: oi })}
                  />
                  <input
                    className="text-input"
                    value={opt}
                    onChange={(e) => updateOption(i, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <label className="field-label">Correct Answer (student must type this exactly)</label>
              <input
                className="text-input"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                placeholder="e.g. Paris"
              />
            </>
          )}
        </div>
      ))}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="button-row">
        <button className="btn btn-outline" onClick={addQuestion}>
          + Add Question
        </button>
        <button className="btn btn-primary" onClick={saveQuiz} disabled={saving}>
          {saving ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
