import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCreate from "./pages/TeacherCreate";
import TeacherControl from "./pages/TeacherControl";
import TeacherDisplay from "./pages/TeacherDisplay";
import StudentJoin from "./pages/StudentJoin";
import StudentPlay from "./pages/StudentPlay";

// We use HashRouter (URLs look like ".../#/join/ABC123") instead of the
// more common BrowserRouter. GitHub Pages only serves static files and
// doesn't know how to handle a real route like /join/ABC123 if someone
// refreshes or opens it directly (it would 404). Hash routes are handled
// entirely inside the browser, so they always work on static hosting.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Teacher pages */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/create" element={<TeacherCreate />} />
        <Route path="/control/:sessionCode" element={<TeacherControl />} />
        <Route path="/display/:sessionCode" element={<TeacherDisplay />} />

        {/* Student pages */}
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/join/:sessionCode" element={<StudentJoin />} />
        <Route path="/play/:sessionCode" element={<StudentPlay />} />
      </Routes>
    </HashRouter>
  );
}
