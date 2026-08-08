# Classroom Quiz

https://the-professorgg.github.io/quiz-app/

Still a work in progress. :) 

A live classroom quiz app (like Kahoot/Mentimeter) built with React + Vite and
Firebase, hosted for free on GitHub Pages.

- Teacher creates a quiz with multiple-choice or typed-answer questions.
- Teacher starts a live session and projects the **Display** screen (QR code
  + session code), which can be linked/embedded from a PowerPoint slide.
- Students join on their own phones by scanning the QR code or typing the
  session code, then enter their name.
- Teacher controls the pace (start / pause / next question) from a separate
  **Control** page on their own device.
- Each question has a 60-second timer. Correct answers score 1000 points
  minus up to 500 based on how long the student took (1000 pts instant →
  500 pts at 60s; wrong answers = 0).
- A live leaderboard updates after every question.

---

## 1. How it's built

- **Frontend:** React + Vite (plain JavaScript, no TypeScript, kept simple).
- **Realtime data:** Firebase Firestore - this is what makes "live" possible
  without you having to run your own server. Quizzes, sessions, joined
  students, answers and scores all live in Firestore, and every open browser
  tab is watching for changes in real time.
- **QR codes:** generated in the browser with `qrcode.react` - no external
  API calls needed.
- **Hosting:** GitHub Pages (a free static file host). Since GitHub Pages
  can't run a server, Firebase is what handles all the "backend" work.

### Project structure

```
quiz-app/
├── index.html
├── package.json
├── vite.config.js
├── firestore.rules          # Firestore security rules (see step 3)
├── .env.example             # copy to .env and fill in your Firebase config
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx                # routes (HashRouter - see note below)
    ├── firebase.js            # Firebase connection setup
    ├── styles.css             # all styling (black & white theme)
    ├── components/
    │   ├── QRCodeBox.jsx      # renders a QR code + link
    │   ├── Timer.jsx          # 60s countdown synced to server time
    │   └── Leaderboard.jsx    # live-updating ranked list of students
    ├── pages/
    │   ├── Home.jsx           # landing page (Teacher / Student choice)
    │   ├── TeacherDashboard.jsx  # list quizzes, launch a session
    │   ├── TeacherCreate.jsx     # quiz builder
    │   ├── TeacherControl.jsx    # teacher's own device: start/pause/next
    │   ├── TeacherDisplay.jsx    # the projector / PowerPoint-linked screen
    │   ├── StudentJoin.jsx       # student enters code + name
    │   └── StudentPlay.jsx       # student answers questions
    └── utils/
        ├── idGenerator.js     # session codes + unique ids
        └── scoring.js         # the points formula
```

**Why HashRouter?** GitHub Pages only serves static files. If a student's
browser goes directly to a URL like `/join/ABC123`, GitHub Pages doesn't know
that route exists and shows a 404. Using `HashRouter` makes URLs look like
`.../#/join/ABC123` - everything after the `#` is handled entirely by the
browser, so it always works, even on a fresh page load.

---

## 2. Set up Firebase (free tier is enough)

1. Go to <https://console.firebase.google.com> and click **Add project**.
   Give it any name (e.g. "classroom-quiz") and finish the wizard (you can
   disable Google Analytics, it's not needed).
2. In your new project, click **Build > Firestore Database > Create
   database**. Choose **Start in test mode** for now (we'll use the
   `firestore.rules` file included here, which is intentionally open so
   the app works with zero login/auth setup - see the note in that file).
3. Click the gear icon (Project settings) > scroll to **Your apps** > click
   the **</> (Web)** icon to register a new web app. Give it any nickname.
   Firebase will show you a `firebaseConfig` object with keys like
   `apiKey`, `authDomain`, etc. Keep this tab open, you'll need these values
   next.
4. (Optional but recommended) In Firestore, go to the **Rules** tab and
   paste in the contents of `firestore.rules` from this project, then
   click **Publish**.

---

## 3. Run it locally

You'll need [Node.js](https://nodejs.org) (v18 or newer) installed.

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your Firebase values from step 2.3
cp .env.example .env
# then open .env and paste in your apiKey, authDomain, projectId, etc.

# 3. Start the dev server
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in your
browser. Click **I'm a Teacher** to create your first quiz.

To test the student side, open the same local URL in another tab (or on
your phone if it's on the same WiFi network, using your computer's local
IP address instead of "localhost").

---

## 4. Deploy to GitHub Pages (free hosting)

1. Create a new GitHub repository (e.g. `quiz-app`) and push this project
   to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/quiz-app.git
   git push -u origin main
   ```

   > `.env` is listed in `.gitignore` so your Firebase keys don't get
   > committed by accident - that's expected and fine.

2. Install the `gh-pages` helper (already listed in `package.json`, so
   `npm install` in step 3 already installed it) and deploy:

   ```bash
   npm run deploy
   ```

   This builds the app and pushes the `dist` folder to a `gh-pages` branch
   on your repo automatically.

3. On GitHub, go to your repo's **Settings > Pages**. Under **Build and
   deployment > Source**, choose **Deploy from a branch**, then pick the
   `gh-pages` branch and `/ (root)` folder. Save.

4. After a minute or two, your app will be live at:

   ```
   https://YOUR_USERNAME.github.io/quiz-app/
   ```

### Updating the app later

Whenever you make changes:

```bash
git add .
git commit -m "Describe your change"
git push
npm run deploy
```

Your live site updates within a minute or two - no other setup needed.

---

## 5. Using it in class

**Before class:**
1. Go to your app's URL > **I'm a Teacher** > **+ New Quiz** > add your
   questions > **Save Quiz**.

**In class:**
1. From the Teacher Dashboard, click **Start Session** on your quiz. This
   opens the **Control Panel** on your device (keep this open/private -
   it's how you drive the quiz).
2. Click **Open Display Screen** - this is the page to project. It shows a
   QR code and session code for students to join.
3. **To embed it in PowerPoint:** copy the display link shown on the
   Control Panel (e.g. `https://YOUR_USERNAME.github.io/quiz-app/#/display/ABC123`)
   and either:
   - Select some text/shape on a slide > **Insert > Link** > paste the URL, or
   - Take a screenshot of the QR code shown on the Control Panel and
     **Insert > Pictures** it onto a slide, so students can scan it straight
     off the projected slide.
   During your presentation, click the link (or open it in a browser
   alongside PowerPoint) to bring up the live Display screen.
4. Students go to the same app URL, choose **I'm a Student**, scan the QR
   code (or type the session code), and enter their name. They can join
   any time, even after the quiz has started.
5. On your **Control Panel**, click **Start Quiz**. Use **Next Question**,
   **Pause**, and **Show Leaderboard** to run the session at your pace.
6. After the last question, click **Finish Quiz** - the Display screen
   shows the final leaderboard.

---

## 6. How scoring works

Defined in `src/utils/scoring.js`:

- Wrong answer → **0 points**
- Correct answer answered instantly (0 seconds) → **1000 points**
- Correct answer answered right at the 60-second mark → **500 points**
- Everything in between decreases in a straight line, e.g. correct at 30
  seconds → 750 points.

## 7. Data model (Firestore)

```
quizzes/{quizId}
  title: string
  questions: [
    { id, type: "mc" | "input", text,
      options: [string, string, string, string],  // for "mc"
      correctIndex: number,                        // for "mc"
      correctAnswer: string }                      // for "input"
  ]

sessions/{sessionCode}          // sessionCode is a 6-character join code
  quizId: string
  status: "lobby" | "question" | "paused" | "leaderboard" | "ended"
  currentQuestionIndex: number
  questionStartedAt: server timestamp

sessions/{sessionCode}/students/{studentId}
  name: string
  score: number
  joinedAt: server timestamp

sessions/{sessionCode}/answers/{questionIndex_studentId}
  studentId, questionIndex, answer, correct, points, answeredAt
```

## 8. Notes / limitations (MVP scope)

- Firestore rules are wide open (see `firestore.rules`) so there's no login
  step for teachers or students. This keeps setup dead simple, but it also
  means anyone with your Firebase config could technically read/write data.
  Fine for casual classroom use; add Firebase Authentication if you need it
  locked down further.
- There's no quiz editing screen yet (only create + delete) - you can add
  one later by reusing the form in `TeacherCreate.jsx`.
- Typed answers are checked with an exact (case-insensitive) match - no
  fuzzy matching or partial credit.
