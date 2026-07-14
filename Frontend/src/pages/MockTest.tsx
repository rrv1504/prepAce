import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Code2,
  AlignLeft,
  Edit3,
  BookOpen,
  Play,
  RotateCcw,
  AlertTriangle,
  History,
  Trophy,
  Menu,
  X,
  Maximize2,
  ShieldAlert,
  Sparkles,
  Brain,
  Loader,
  AlertCircle,
} from "lucide-react";
import {
  useAppContext,
  type MockTestDef,
  type MockQuestion,
  type QuestionType,
} from "../context/AppContext";
import {
  mockTestService,
  mockAttemptService,
  aiService,
  codeService,
} from "../lib/services";
import { normalizeId } from "../lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const LANGS = ["python", "javascript", "java", "cpp", "c"] as const;
type Lang = (typeof LANGS)[number];

const TYPE_COLORS: Record<QuestionType, string> = {
  mcq: "#6366f1",
  fill_blank: "#f59e0b",
  textual: "#10b981",
  coding: "#ef4444",
};
const TYPE_ICONS: Record<QuestionType, any> = {
  mcq: BookOpen,
  fill_blank: Edit3,
  textual: AlignLeft,
  coding: Code2,
};
const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "MCQ",
  fill_blank: "Fill Blank",
  textual: "Textual",
  coding: "Coding",
};

const cardSt = { background: "var(--card)", border: "1px solid var(--border)" };

const AI_TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "OOP",
];
const AI_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

// Strip HTML tags for plain text previews
function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAnswerText(answer: any) {
  if (answer && typeof answer === "object") return String(answer.code ?? answer.text ?? "");
  return String(answer ?? "");
}

function getAnswerLanguage(answer: any): Lang | undefined {
  const language = answer && typeof answer === "object" ? answer.language : undefined;
  return LANGS.includes(language) ? language : undefined;
}

function normalizeToMockTestDef(raw: any): MockTestDef {
  const source = raw?.questions ? raw : raw?.quiz ? raw.quiz : raw?.data ?? raw ?? {};
  const questions: MockQuestion[] = (source.questions ?? []).map((q: any, i: number) => {
    // infer type if missing
    const rawType = String(q.type || q.questionType || "").toLowerCase().replace(/[\s-]+/g, "_");
    let type = rawType as QuestionType;
    if (["fillblanks", "fill_blank", "fill_blanks", "fill_in_blank", "fill_in_blanks"].includes(rawType)) type = "fill_blank";
    if (["truefalse", "true_false", "output_prediction", "debugging", "scenario", "scenario_based"].includes(rawType)) type = "mcq";
    if (!type) {
      if (Array.isArray(q.options) && q.options.length > 0) type = "mcq";
      else if (q.blankAnswer !== undefined) type = "fill_blank";
      else if (q.starterCode || q.testCases) type = "coding";
      else type = "textual";
    }
    if (!["mcq", "fill_blank", "textual", "coding"].includes(type)) type = "mcq";

    let correct = q.correct;
    if (correct === undefined && type === "mcq" && Array.isArray(q.options)) {
      const idx = q.options.findIndex((opt: string) => opt === q.correctAnswer);
      correct = idx >= 0 ? idx : 0;
    }

    return {
      id: q.id || q._id || `q-${i + 1}`,
      type,
      topic: q.topic ?? source.title ?? "General",
      subtopic: q.subtopic,
      question: q.question || q.questionText || q.statement || `Question ${i + 1}`,
      marks: q.marks ?? 1,
      timeLimit: q.timeLimit ?? 60,
      explanation: q.explanation ?? "",
      options: q.options,
      correct,
      blankAnswer: q.blankAnswer ?? q.correctAnswer,
      sampleAnswer: q.sampleAnswer,
      starterCode: q.starterCode,
      testCases: q.testCases,
      sourceId: q.sourceId,
    };
  });

  return {
    id: source.id || raw?.id || `ai-${Date.now()}`,
    title: source.title ?? raw?.title ?? "Generated Quiz",
    type: source.type ?? raw?.type ?? "mixed",
    duration: source.duration ?? raw?.minutes ?? raw?.duration ?? Math.max(5, Math.round(questions.length * 1.5)),
    description: source.description ?? raw?.description ?? "",
    createdAt: source.createdAt ?? raw?.createdAt ?? new Date().toISOString(),
    questions,
  };
}

// Render question HTML safely
function QuestionHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className={`rich-question ${className}`}
        style={{ color: "var(--foreground)" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <p
      className={`text-base font-medium leading-relaxed whitespace-pre-wrap ${className}`}
      style={{ color: "var(--foreground)" }}
    >
      {html}
    </p>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function Timer({ seconds, urgent }: { seconds: number; urgent: boolean }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold"
      style={{
        background: urgent ? "rgba(239,68,68,0.15)" : "var(--muted)",
        color: urgent ? "#ef4444" : "var(--foreground)",
      }}
    >
      <Clock size={14} />
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

// ── Question status indicator ─────────────────────────────────────────────────
function QStatusDot({
  idx,
  current,
  answered,
}: {
  idx: number;
  current: boolean;
  answered: boolean;
}) {
  let bg = "var(--muted)";
  if (current) bg = "#6366f1";
  else if (answered) bg = "#22c55e";
  return (
    <div
      className="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
      style={{
        background: bg,
        color: current || answered ? "white" : "var(--muted-foreground)",
        border: current ? "2px solid #a5b4fc" : "none",
      }}
    >
      {idx + 1}
    </div>
  );
}

// ── MCQ Question ──────────────────────────────────────────────────────────────
function McqQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: MockQuestion;
  answer: number | undefined;
  onAnswer: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      {(q.options ?? []).map((opt, i) => (
        <button
          key={i}
          onClick={() => onAnswer(i)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{
            background: answer === i ? "rgba(99,102,241,0.15)" : "var(--muted)",
            border: `2px solid ${answer === i ? "#6366f1" : "transparent"}`,
            color: "var(--foreground)",
          }}
        >
          <span
            className="w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              borderColor: answer === i ? "#6366f1" : "var(--border)",
              background: answer === i ? "#6366f1" : "transparent",
              color: answer === i ? "white" : "var(--muted-foreground)",
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span className="text-sm" style={{ color: "var(--foreground)" }}>
            {opt}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Fill Blank Question ───────────────────────────────────────────────────────
function FillBlankQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: MockQuestion;
  answer: string | undefined;
  onAnswer: (v: string) => void;
}) {
  const isHtml = /<[a-z][\s\S]*>/i.test(q.question);
  const parts = !isHtml ? q.question.split("___") : [];

  if (isHtml) {
    return (
      <div className="space-y-4">
        <QuestionHtml html={q.question} />
        <input
          value={answer ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full px-4 py-3 rounded-xl outline-none text-sm"
          style={{
            background: "var(--muted)",
            border: `1px solid ${answer ? "#6366f1" : "var(--border)"}`,
            color: "var(--foreground)",
          }}
          placeholder="Type your answer here..."
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
        Type your answer in the blank:
      </p>
      <div
        className="flex flex-wrap items-center gap-2 text-base font-medium leading-relaxed"
        style={{ color: "var(--foreground)" }}
      >
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>{part}</span>
            {i < parts.length - 1 && (
              <input
                value={answer ?? ""}
                onChange={(e) => onAnswer(e.target.value)}
                className="border-b-2 outline-none px-1 text-base min-w-24 text-center"
                style={{
                  borderColor: answer ? "#6366f1" : "var(--border)",
                  background: "transparent",
                  color: "#a5b4fc",
                }}
                placeholder="________"
              />
            )}
          </span>
        ))}
      </div>
      {!q.question.includes("___") && (
        <input
          value={answer ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="mt-4 w-full px-4 py-3 rounded-xl outline-none text-sm"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          placeholder="Type your answer here..."
        />
      )}
    </div>
  );
}

// ── Textual Question ──────────────────────────────────────────────────────────
function TextualQuestion({
  answer,
  onAnswer,
}: {
  answer: string | undefined;
  onAnswer: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
        Write your detailed answer:
      </p>
      <textarea
        value={answer ?? ""}
        onChange={(e) => onAnswer(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        placeholder="Type your answer here..."
      />
      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
        {(answer ?? "").length} characters
      </p>
    </div>
  );
}

// ── Coding Question ───────────────────────────────────────────────────────────
function CodingQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: MockQuestion;
  answer: any;
  onAnswer: (v: any) => void;
}) {
  const definedLangs = LANGS.filter(
    (l) => q.starterCode?.[l] && q.starterCode[l].trim(),
  );
  const [lang, setLang] = useState<Lang>(getAnswerLanguage(answer) ?? definedLangs[0] ?? "python");
  const starter =
    q.starterCode?.[lang] ?? `# Write your ${lang} solution here\n`;
  const code = getAnswerText(answer) || starter;
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  function updateLanguage(next: Lang) {
    setLang(next);
    onAnswer({
      language: next,
      code: getAnswerText(answer) || q.starterCode?.[next] || `# Write your ${next} solution here\n`,
    });
  }

  async function runCode() {
    setRunning(true);
    setOutput("");
    try {
      const cases = q.testCases?.length ? q.testCases : [{ input: "", expected: "" }];
      const results = await Promise.all(cases.map(async (tc, i) => {
        const result: any = await codeService.run({ language: lang, code, input: tc.input });
        const actual = String(result.output || result.stdout || "").trim();
        const expected = String(tc.expected || "").trim();
        const passed = expected ? actual === expected : !result.error;
        return `Case ${i + 1}: ${passed ? "Passed" : "Failed"}\nInput: ${tc.input || "(empty)"}\nExpected: ${expected || "(not set)"}\nOutput: ${actual || result.error || "(empty)"}`;
      }));
      setOutput(results.join("\n\n"));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Code execution failed");
    } finally {
      setRunning(false);
    }
  }
  return (
    <div className="space-y-3">
      {q.testCases && q.testCases.length > 0 && (
        <div
          className="p-3 rounded-xl"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1.5"
            style={{ color: "#a5b4fc" }}
          >
            Sample Test Cases
          </p>
          {q.testCases.slice(0, 2).map((tc, i) => (
            <div
              key={i}
              className="text-xs font-mono"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
                Input:{" "}
              </span>
              {tc.input} →{" "}
              <span style={{ color: "#22c55e" }}>Expected: {tc.expected}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <select
            value={lang}
            onChange={(e) => updateLanguage(e.target.value as Lang)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold outline-none"
            style={{
              background: "rgba(239,68,68,0.14)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.22)",
            }}
          >
            {LANGS.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
          >
            {running ? (
              <RotateCcw size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            Run
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => onAnswer({ language: lang, code: e.target.value })}
          rows={12}
          className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none font-mono"
          style={{
            background: "#0d0f1a",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#e8eaf0",
          }}
        />
      </div>
      {output && (
        <div
          className="p-3 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Output
          </p>
          <pre
            className="text-xs font-mono whitespace-pre-wrap"
            style={{ color: "#86efac" }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Security overlay ──────────────────────────────────────────────────────────
function SecurityWarning({
  type,
  violationsLeft,
  onDismiss,
}: {
  type: "key" | "focus" | "fullscreen";
  violationsLeft: number;
  onDismiss: () => void;
}) {
  const messages = {
    key: {
      icon: "⌨️",
      title: "Restricted Key Combination",
      body: "Copy/paste and tab-switching shortcuts are disabled during the exam.",
    },
    focus: {
      icon: "👁️",
      title: "Tab Switch Detected",
      body: "Switching tabs or windows is not permitted during the exam.",
    },
    fullscreen: {
      icon: "🖥️",
      title: "Fullscreen Exited",
      body: "The exam requires fullscreen mode. Please stay in fullscreen.",
    },
  };
  const m = messages[type];
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 p-6 rounded-2xl text-center"
        style={{
          background: "var(--card)",
          border: "2px solid rgba(239,68,68,0.4)",
        }}
      >
        <div className="text-4xl mb-3">{m.icon}</div>
        <h2 className="text-lg font-black mb-2" style={{ color: "#ef4444" }}>
          {m.title}
        </h2>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          {m.body}
        </p>
        <div
          className="p-3 rounded-xl mb-5"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
            ⚠️{" "}
            {violationsLeft > 0
              ? `${violationsLeft} warning${violationsLeft > 1 ? "s" : ""} remaining before auto-submit`
              : "Next violation will auto-submit your test!"}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
        >
          I Understand — Continue Exam
        </button>
      </div>
    </div>
  );
}

// ── Active Test screen ────────────────────────────────────────────────────────
function ActiveTest({
  test,
  onFinish,
}: {
  test: MockTestDef;
  onFinish: (answers: Record<string, any>, timeUsed: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [autoSubmitToast, setAutoSubmitToast] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violation, setViolation] = useState<{
    type: "key" | "focus" | "fullscreen";
  } | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const MAX_VIOLATIONS = 3;

  const answersRef = useRef<Record<string, any>>({});
  answersRef.current = answers;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const submittedRef = useRef(false);
  const violationCountRef = useRef(0);
  violationCountRef.current = violationCount;

  // Submit helper
  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onFinish(answersRef.current, test.duration * 60 - timeLeftRef.current);
  }, [onFinish, test.duration]);

  // Timer
  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 6 && t > 1) setAutoSubmitToast(true);
        if (t <= 1) {
          clearInterval(iv);
          doSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Fullscreen helpers — silently skip if blocked by permissions policy (e.g. iframe)
  const fullscreenSupported =
    typeof document !== "undefined" &&
    !!document.documentElement.requestFullscreen;

  function enterFullscreen() {
    if (!fullscreenSupported) return;
    document.documentElement.requestFullscreen().catch(() => {
      // Permissions policy blocks fullscreen in some environments — ignore
    });
  }

  useEffect(() => {
    // Attempt fullscreen; failures are silently caught above
    enterFullscreen();

    function onFullscreenChange() {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // Only trigger violation if fullscreen is actually supported and was exited
      if (fullscreenSupported && !isFs) {
        triggerViolation("fullscreen");
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        triggerViolation("focus");
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const blocked = [
        e.ctrlKey &&
          ["c", "v", "x", "z", "a", "u", "s", "p"].includes(
            e.key.toLowerCase(),
          ),
        e.altKey && e.key === "Tab",
        e.ctrlKey && e.key === "Tab",
        e.key === "F12",
        e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase()),
        e.metaKey && ["c", "v", "x"].includes(e.key.toLowerCase()),
      ].some(Boolean);

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("key");
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown, true);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  function triggerViolation(type: "key" | "focus" | "fullscreen") {
    const newCount = violationCountRef.current + 1;
    setViolationCount(newCount);
    if (newCount >= MAX_VIOLATIONS) {
      // Auto-submit
      setViolation(null);
      setTimeout(() => doSubmit(), 500);
    } else {
      setViolation({ type });
    }
  }

  function dismissViolation() {
    setViolation(null);
    // Try to re-enter fullscreen
    if (!document.fullscreenElement) enterFullscreen();
  }

  const q = test.questions[currentIdx];
  const isAnswered = (id: string) =>
    answers[id] !== undefined && answers[id] !== "";
  const answeredCount = test.questions.filter((q) => isAnswered(q.id)).length;

  function setAnswer(v: any) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }
  function submit() {
    doSubmit();
  }
  function getTypeIcon(type: QuestionType | undefined) {
    return TYPE_ICONS[type as QuestionType] ?? AlertCircle; // AlertCircle already imported
  }
  const QIcon = getTypeIcon(q.type);
  const qColor = TYPE_COLORS[q.type];

  const NavPanel = () => (
    <div className="p-4" style={{ background: "var(--card)" }}>
      <div className="mb-4">
        <p
          className="text-xs font-bold mb-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          {test.title}
        </p>
        <Timer seconds={timeLeft} urgent={timeLeft < 300} />
        <div
          className="mt-2 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {answeredCount}/{test.questions.length} answered
        </div>
        <div
          className="mt-2 h-1.5 rounded-full"
          style={{ background: "var(--muted)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(answeredCount / test.questions.length) * 100}%`,
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            }}
          />
        </div>
      </div>
      {/* Security status */}
      <div
        className="flex items-center gap-2 p-2 rounded-lg mb-3 text-xs"
        style={{
          background:
            !fullscreenSupported || isFullscreen
              ? "rgba(34,197,94,0.08)"
              : "rgba(239,68,68,0.08)",
          border: `1px solid ${!fullscreenSupported || isFullscreen ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <ShieldAlert
          size={12}
          style={{
            color: !fullscreenSupported || isFullscreen ? "#22c55e" : "#ef4444",
          }}
        />
        <span
          style={{
            color: !fullscreenSupported || isFullscreen ? "#22c55e" : "#ef4444",
          }}
        >
          {!fullscreenSupported
            ? "Exam in progress"
            : isFullscreen
              ? "Secure mode"
              : "Fullscreen required"}
        </span>
        {violationCount > 0 && (
          <span className="ml-auto font-bold" style={{ color: "#ef4444" }}>
            {violationCount}/{MAX_VIOLATIONS} ⚠
          </span>
        )}
      </div>
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        QUESTIONS
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {test.questions.map((qItem, idx) => (
          <button
            key={qItem.id}
            onClick={() => {
              setCurrentIdx(idx);
              setNavOpen(false);
            }}
          >
            <QStatusDot
              idx={idx}
              current={idx === currentIdx}
              answered={isAnswered(qItem.id)}
            />
          </button>
        ))}
      </div>
      <div
        className="mt-4 space-y-1.5 text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        {[
          ["#6366f1", "Current"],
          ["#22c55e", "Answered"],
          ["var(--muted)", "Not visited"],
        ].map(([c, l]) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: c }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
      >
        Submit Test
      </button>
    </div>
  );

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{
        background: "var(--background)",
        position: "fixed",
        inset: 0,
        zIndex: 50,
      }}
    >
      {/* Security violation overlay */}
      {violation && (
        <SecurityWarning
          type={violation.type}
          violationsLeft={MAX_VIOLATIONS - violationCount}
          onDismiss={dismissViolation}
        />
      )}

      {/* Auto-submit toast */}
      {autoSubmitToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl flex items-center gap-2 animate-bounce"
          style={{
            background: "rgba(239,68,68,0.95)",
            border: "1px solid rgba(239,68,68,0.5)",
          }}
        >
          ⏱ Time's up! Auto-submitting your answers…
        </div>
      )}

      {/* Fullscreen prompt (only when supported and not active) */}
      {fullscreenSupported && !isFullscreen && !violation && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{
            background: "rgba(239,68,68,0.95)",
            border: "1px solid rgba(239,68,68,0.5)",
          }}
        >
          <Maximize2 size={14} className="text-white" />
          <span className="text-xs font-bold text-white">
            Exam requires fullscreen
          </span>
          <button
            onClick={enterFullscreen}
            className="px-3 py-1 rounded-lg bg-white text-xs font-bold"
            style={{ color: "#ef4444" }}
          >
            Go Fullscreen
          </button>
        </div>
      )}

      {/* Mobile top bar */}
      <div
        className="flex md:hidden items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavOpen((o) => !o)}
            className="p-1.5 rounded-lg"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            {navOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "var(--foreground)" }}
          >
            {test.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {answeredCount}/{test.questions.length}
          </span>
          <Timer seconds={timeLeft} urgent={timeLeft < 300} />
        </div>
      </div>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setNavOpen(false)}
        >
          <div
            className="w-72 h-full overflow-y-auto"
            style={{ background: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavPanel />
          </div>
        </div>
      )}

      {/* Left: Question nav (desktop) */}
      <div
        className="hidden md:block w-64 flex-shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <NavPanel />
      </div>

      {/* Main question area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Question header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${qColor}20` }}
              >
                <QIcon size={16} style={{ color: qColor }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Question {currentIdx + 1} of {test.questions.length}
                </p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${qColor}15`, color: qColor }}
                >
                  {TYPE_LABELS[q.type]} · {q.marks}{" "}
                  {q.marks === 1 ? "mark" : "marks"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="p-2 rounded-lg disabled:opacity-30"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentIdx(
                    Math.min(test.questions.length - 1, currentIdx + 1),
                  )
                }
                disabled={currentIdx === test.questions.length - 1}
                className="p-2 rounded-lg disabled:opacity-30"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Question text */}
          <div className="p-5 rounded-2xl mb-5" style={cardSt}>
            {q.topic && (
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: "var(--muted-foreground)" }}
              >
                {q.topic}
                {q.subtopic ? ` › ${q.subtopic}` : ""}
              </p>
            )}
            <QuestionHtml html={q.question} />
          </div>

          {/* Answer input */}
          <div className="p-5 rounded-2xl" style={cardSt}>
            {q.type === "mcq" && (
              <McqQuestion q={q} answer={answers[q.id]} onAnswer={setAnswer} />
            )}
            {q.type === "fill_blank" && (
              <FillBlankQuestion
                q={q}
                answer={answers[q.id]}
                onAnswer={setAnswer}
              />
            )}
            {q.type === "textual" && (
              <TextualQuestion answer={answers[q.id]} onAnswer={setAnswer} />
            )}
            {q.type === "coding" && (
              <CodingQuestion
                q={q}
                answer={answers[q.id]}
                onAnswer={setAnswer}
              />
            )}
          </div>

          {/* Navigate buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {currentIdx < test.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={submit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                }}
              >
                <CheckCircle2 size={14} /> Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function Results({
  test,
  answers,
  timeUsed,
  onRetry,
  onHome,
}: {
  test: MockTestDef;
  answers: Record<string, any>;
  timeUsed: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  const totalMarks = test.questions.reduce((s, q) => s + q.marks, 0);
  let earned = 0;

  const results = test.questions.map((q) => {
    let correct = false;
    let userAnswer = answers[q.id];
    if (q.type === "mcq") correct = userAnswer === q.correct;
    else if (q.type === "fill_blank")
      correct =
        getAnswerText(userAnswer).toLowerCase().trim() ===
        (q.blankAnswer ?? "").toLowerCase().trim();
    else if (q.type === "textual" || q.type === "coding")
      correct = getAnswerText(userAnswer).length > 20;
    if (correct) earned += q.marks;
    return { q, userAnswer, correct };
  });

  const pct = totalMarks > 0 ? Math.round((earned / totalMarks) * 100) : 0;
  const mins = Math.floor(timeUsed / 60);
  const secs = timeUsed % 60;

  const byType = (type: QuestionType) => {
    const qs = results.filter((r) => r.q.type === type);
    return { total: qs.length, correct: qs.filter((r) => r.correct).length };
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onHome}
          className="p-2 rounded-lg hover:opacity-70"
          style={{
            background: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <h1
          className="text-xl font-black"
          style={{ color: "var(--foreground)" }}
        >
          Test Results
        </h1>
      </div>

      {/* Score card */}
      <div className="p-6 rounded-2xl text-center" style={cardSt}>
        <div className="text-6xl mb-2">
          {pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪"}
        </div>
        <div
          className="text-5xl font-black mb-1"
          style={{
            color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444",
          }}
        >
          {pct}%
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {earned}/{totalMarks} marks · {mins}m {secs}s
        </p>
        <p
          className="font-semibold mt-2"
          style={{ color: "var(--foreground)" }}
        >
          {test.title}
        </p>
      </div>

      {/* Breakdown by type */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(TYPE_LABELS) as QuestionType[]).map((type) => {
          const { total, correct } = byType(type);
          if (!total) return null;
          const Icon = TYPE_ICONS[type];
          return (
            <div
              key={type}
              className="p-4 rounded-2xl text-center"
              style={cardSt}
            >
              <Icon
                size={20}
                className="mx-auto mb-1"
                style={{ color: TYPE_COLORS[type] }}
              />
              <p
                className="text-lg font-black"
                style={{ color: "var(--foreground)" }}
              >
                {correct}/{total}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {TYPE_LABELS[type]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Per-question review */}
      <div>
        <h2 className="font-bold mb-3" style={{ color: "var(--foreground)" }}>
          Question Review
        </h2>
        <div className="space-y-3">
          {results.map((r, idx) => {
            const Icon = TYPE_ICONS[r.q.type];
            return (
              <div
                key={r.q.id}
                className="p-4 rounded-2xl"
                style={{
                  ...cardSt,
                  borderColor: r.correct
                    ? "rgba(34,197,94,0.25)"
                    : "rgba(239,68,68,0.25)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {r.correct ? (
                      <CheckCircle2 size={18} style={{ color: "#22c55e" }} />
                    ) : (
                      <XCircle size={18} style={{ color: "#ef4444" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Q{idx + 1}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: `${TYPE_COLORS[r.q.type]}15`,
                          color: TYPE_COLORS[r.q.type],
                        }}
                      >
                        <Icon size={10} className="inline mr-0.5" />
                        {TYPE_LABELS[r.q.type]}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {r.q.marks}pt
                      </span>
                    </div>
                    {/* Show plain text preview of question */}
                    <p
                      className="text-sm font-medium line-clamp-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {stripHtml(r.q.question)}
                    </p>
                    {r.q.type === "mcq" && (
                      <div className="mt-2 text-xs space-y-0.5">
                        {r.userAnswer !== undefined && (
                          <p
                            style={{ color: r.correct ? "#22c55e" : "#ef4444" }}
                          >
                            Your answer:{" "}
                            {r.q.options?.[r.userAnswer] ?? "Not answered"}
                          </p>
                        )}
                        {!r.correct && r.q.correct !== undefined && (
                          <p style={{ color: "#22c55e" }}>
                            Correct: {r.q.options?.[r.q.correct]}
                          </p>
                        )}
                      </div>
                    )}
                    {r.q.type === "fill_blank" && (
                      <div className="mt-2 text-xs space-y-0.5">
                        <p style={{ color: r.correct ? "#22c55e" : "#ef4444" }}>
                          Your answer: "{r.userAnswer || "—"}"
                        </p>
                        {!r.correct && (
                          <p style={{ color: "#22c55e" }}>
                            Correct: "{r.q.blankAnswer}"
                          </p>
                        )}
                      </div>
                    )}
                    {r.q.explanation && (
                      <p
                        className="mt-2 text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        💡 {r.q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          Retry Test
        </button>
        <button
          onClick={onHome}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
        >
          Back to Tests
        </button>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  const { mockTestHistory } = useAppContext();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const selectedAttempt = mockTestHistory.find(
    (a) => a.id === selectedAttemptId,
  );
  if (selectedAttempt) {
    const mins = Math.floor(selectedAttempt.timeUsed / 60);
    const secs = selectedAttempt.timeUsed % 60;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedAttemptId(null)}
          className="text-sm font-semibold"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Back to history
        </button>
        <div className="p-5 rounded-2xl" style={cardSt}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                className="text-xl font-black"
                style={{ color: "var(--foreground)" }}
              >
                {selectedAttempt.testTitle}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                {selectedAttempt.score}/{selectedAttempt.totalMarks} marks ·{" "}
                {selectedAttempt.percentage}% · {mins}m {secs}s ·{" "}
                {selectedAttempt.date}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{
                background:
                  selectedAttempt.percentage >= 60
                    ? "rgba(34,197,94,0.14)"
                    : "rgba(239,68,68,0.14)",
                color: selectedAttempt.percentage >= 60 ? "#22c55e" : "#ef4444",
              }}
            >
              {selectedAttempt.source === "ai" ? "AI Quiz" : "Mock Test"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {(selectedAttempt.questions || []).map((question, index) => {
            const review = selectedAttempt.review?.find(
              (r) => r.questionId === question.id,
            );
            const userAnswer =
              question.type === "mcq" && typeof review?.userAnswer === "number"
                ? question.options?.[review.userAnswer]
                : getAnswerText(review?.userAnswer);
            const Icon = TYPE_ICONS[question.type];
            return (
              <div
                key={question.id}
                className="p-4 rounded-2xl"
                style={{
                  ...cardSt,
                  borderColor: review?.isCorrect
                    ? "rgba(34,197,94,0.25)"
                    : "rgba(239,68,68,0.25)",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Question {index + 1}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: "var(--muted)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      <Icon size={10} className="inline mr-1" />
                      {TYPE_LABELS[question.type]}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: review?.isCorrect ? "#22c55e" : "#ef4444" }}
                  >
                    {review?.isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {stripHtml(question.question)}
                </p>
                {question.options?.length ? (
                  <div className="grid sm:grid-cols-2 gap-2 mt-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="px-3 py-2 rounded-xl text-xs"
                        style={{
                          background:
                            option === review?.correctAnswer
                              ? "rgba(34,197,94,0.12)"
                              : option === userAnswer
                                ? "rgba(239,68,68,0.12)"
                                : "var(--muted)",
                          color: "var(--foreground)",
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="grid md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: "var(--muted)" }}
                  >
                    <strong>Your Answer:</strong>{" "}
                    {String(userAnswer ?? "Not answered")}
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      color: "#22c55e",
                    }}
                  >
                    <strong>Correct Answer:</strong>{" "}
                    {String(review?.correctAnswer ?? "N/A")}
                  </div>
                </div>
                {review?.explanation && (
                  <p
                    className="text-xs mt-3"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {review.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mockTestHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <History
          size={40}
          className="mx-auto mb-3"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          No attempts yet
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Complete a mock test to see your history here.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {mockTestHistory.map((attempt) => {
        const pct = attempt.percentage;
        const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
        const mins = Math.floor(attempt.timeUsed / 60);
        const secs = attempt.timeUsed % 60;
        return (
          <button
            onClick={() => setSelectedAttemptId(attempt.id)}
            key={attempt.id}
            className="p-4 rounded-2xl w-full text-left transition-all hover:opacity-90"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Trophy size={13} style={{ color }} />
                  <span
                    className="font-bold text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    {attempt.testTitle}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${color}15`, color }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  className="flex gap-3 text-xs flex-wrap"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <span>
                    {attempt.score}/{attempt.totalMarks} marks
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {mins}m {secs}s
                  </span>
                  <span>{attempt.date}</span>
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full"
                  style={{ background: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
              <span className="text-3xl flex-shrink-0">
                {pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Home / Test list ──────────────────────────────────────────────────────────
const TYPE_BADGE_COLORS = {
  aptitude: "#6366f1",
  technical: "#06b6d4",
  mixed: "#8b5cf6",
} as const;

function TestCard({
  test,
  onStart,
}: {
  test: MockTestDef;
  onStart: () => void;
}) {
  const totalMarks = test.questions.reduce((s, q) => s + q.marks, 0);
  const qTypes = [...new Set(test.questions.map((q) => q.type))];
  const color = TYPE_BADGE_COLORS[test.type] ?? "#6366f1";
  return (
    <div
      className="p-5 rounded-2xl transition-all hover:scale-[1.01]"
      style={cardSt}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
              style={{ background: `${color}20`, color }}
            >
              {test.type}
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Clock size={11} /> {test.duration} min
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              {test.questions.length}Q · {totalMarks}M
            </span>
            {test.totalAttempts ? (
              <span
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {test.totalAttempts} attempts
              </span>
            ) : null}
          </div>
          <h3
            className="font-bold text-base"
            style={{ color: "var(--foreground)" }}
          >
            {test.title}
          </h3>
          {test.description && (
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {test.description}
            </p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            {qTypes.map((t) => {
              const Ic = TYPE_ICONS[t];
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: `${TYPE_COLORS[t]}15`,
                    color: TYPE_COLORS[t],
                  }}
                >
                  <Ic size={10} /> {TYPE_LABELS[t]}
                </span>
              );
            })}
          </div>
          {test.avgScore !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ background: "var(--muted)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${test.avgScore}%`, background: color }}
                />
              </div>
              <span
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Avg {test.avgScore}%
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onStart}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
function AIGeneratorTab({ onStart }: { onStart: (test: MockTestDef) => void }) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Arrays",
    "DBMS",
  ]);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    "mcq",
    "fill_blank",
  ]);
  const [difficulty, setDifficulty] =
    useState<(typeof AI_DIFFICULTIES)[number]>("Medium");
  const [count, setCount] = useState(10);
  const [minutes, setMinutes] = useState(20);
  const [generating, setGenerating] = useState(false);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  function toggleType(type: QuestionType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleGenerate() {
    try {
      setGenerating(true);
      const quiz = await aiService.generateQuiz({
        topics: selectedTopics,
        questionTypes: selectedTypes,
        count,
        minutes,
        difficulty,
      });
      onStart(normalizeToMockTestDef(quiz));
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      alert("Failed to generate AI quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = selectedTopics.length > 0 && selectedTypes.length > 0;

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-5"
        style={{
          ...cardSt,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2
              className="text-lg font-black"
              style={{ color: "var(--foreground)" }}
            >
              Generate AI Mock Test
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Choose topics, question types, count, and minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="p-5 rounded-2xl" style={cardSt}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-bold" style={{ color: "var(--foreground)" }}>
                Topics
              </h3>
              <span
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {selectedTopics.length} selected
              </span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {AI_TOPICS.map((topic) => {
                const checked = selectedTopics.includes(topic);
                return (
                  <label
                    key={topic}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: checked
                        ? "rgba(99,102,241,0.12)"
                        : "var(--muted)",
                      border: `1px solid ${checked ? "rgba(99,102,241,0.35)" : "var(--border)"}`,
                      color: checked
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopic(topic)}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm font-medium">{topic}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl" style={cardSt}>
            <h3
              className="font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Question Types
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(TYPE_LABELS) as QuestionType[]).map((type) => {
                const checked = selectedTypes.includes(type);
                const Icon = TYPE_ICONS[type];
                return (
                  <label
                    key={type}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: checked
                        ? `${TYPE_COLORS[type]}15`
                        : "var(--muted)",
                      border: `1px solid ${checked ? `${TYPE_COLORS[type]}55` : "var(--border)"}`,
                      color: checked
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleType(type)}
                      className="accent-indigo-500"
                    />
                    <Icon size={15} style={{ color: TYPE_COLORS[type] }} />
                    <span className="text-sm font-medium">
                      {TYPE_LABELS[type]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl space-y-5 h-fit" style={cardSt}>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "var(--muted-foreground)" }}
            >
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AI_DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className="py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background:
                      difficulty === level
                        ? "rgba(99,102,241,0.2)"
                        : "var(--muted)",
                    color:
                      difficulty === level
                        ? "#a5b4fc"
                        : "var(--muted-foreground)",
                    border: `1px solid ${difficulty === level ? "rgba(99,102,241,0.45)" : "var(--border)"}`,
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "var(--muted-foreground)" }}
            >
              Questions
            </label>
            <input
              type="number"
              min={3}
              max={30}
              value={count}
              onChange={(e) =>
                setCount(Math.max(3, Math.min(30, Number(e.target.value) || 3)))
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "var(--muted-foreground)" }}
            >
              Minutes
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={minutes}
              onChange={(e) =>
                setMinutes(
                  Math.max(5, Math.min(180, Number(e.target.value) || 5)),
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {generating ? (
              <RotateCcw size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {generating ? "Generating Test..." : "Generate & Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MockTest() {
  const { addMockTestAttempt } = useAppContext();
  const [mockTests, setMockTests] = useState<MockTestDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTest, setActiveTest] = useState<MockTestDef | null>(null);
  const [results, setResults] = useState<{
    test: MockTestDef;
    answers: Record<string, any>;
    timeUsed: number;
  } | null>(null);
  const [filterType, setFilterType] = useState("");
  const [mainTab, setMainTab] = useState<"tests" | "ai" | "history">("tests");

  // Load mock tests from API
  useEffect(() => {
    async function loadMockTests() {
      try {
        setLoading(true);
        setError("");
        const tests = await mockTestService.listAll();
        setMockTests((tests || []).map(normalizeToMockTestDef));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load mock tests";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadMockTests();
  }, []);

  function startTest(t: MockTestDef) {
    setActiveTest(t);
    setResults(null);
  }

  useEffect(() => {
    const startId = sessionStorage.getItem("startMockTestId");
    if (!startId) return;
    const test = mockTests.find((t) => t.id === startId);
    if (test) {
      sessionStorage.removeItem("startMockTestId");
      sessionStorage.removeItem("pendingRoadmapTest");
      startTest(test);
      return;
    }

    const pendingRaw = sessionStorage.getItem("pendingRoadmapTest");
    if (!pendingRaw) return;
    try {
      const raw = JSON.parse(pendingRaw);
      if (raw.id !== startId) return;

      const pending: MockTestDef = normalizeToMockTestDef(raw);

      setMockTests(
        mockTests.some((t) => t.id === pending.id)
          ? mockTests.map((t) => (t.id === pending.id ? pending : t))
          : [pending, ...mockTests],
      );
      sessionStorage.removeItem("startMockTestId");
      sessionStorage.removeItem("pendingRoadmapTest");
      startTest(pending);
    } catch (err) {
      console.error("Failed to load pending roadmap test:", err);
      sessionStorage.removeItem("pendingRoadmapTest");
    }
  }, [mockTests]);

  async function finishTest(answers: Record<string, any>, timeUsed: number) {
    if (!activeTest) return;
    const totalMarks = activeTest.questions.reduce((s, q) => s + q.marks, 0);
    let earned = 0;
    const review = activeTest.questions.map((q) => {
      const ans = answers[q.id];
      let correct = false;
      let correctAnswer: any = "";
      if (q.type === "mcq") correct = ans === q.correct;
      if (q.type === "mcq")
        correctAnswer = q.options?.[q.correct ?? 0] ?? q.correct;
      else if (q.type === "fill_blank") {
        correct =
          getAnswerText(ans).toLowerCase().trim() ===
          (q.blankAnswer ?? "").toLowerCase().trim();
        correctAnswer = q.blankAnswer;
      } else if (q.type === "textual" || q.type === "coding") {
        correct = getAnswerText(ans).length > 20;
        correctAnswer =
          q.sampleAnswer ||
          q.explanation ||
          "Manual review / expected solution";
      }
      if (correct) earned += q.marks;
      return {
        questionId: q.id,
        userAnswer: ans,
        correctAnswer,
        isCorrect: correct,
        explanation: q.explanation,
      };
    });
    const pct = totalMarks > 0 ? Math.round((earned / totalMarks) * 100) : 0;

    // Submit attempt to API
    try {
      const saved = await mockAttemptService.create({
        testId: activeTest.id,
        testTitle: activeTest.title,
        source: String(activeTest.id || "").startsWith("ai-") ? "ai" : "mock",
        answers,
        score: earned,
        totalMarks,
        percentage: pct,
        timeUsed,
        questions: activeTest.questions,
        review,
      });
      const normalized: any = normalizeId(saved as any);

      // Also update local AppContext for history
      addMockTestAttempt({
        ...normalized,
        id: normalized.id || `attempt-${Date.now()}`,
        testId: activeTest.id,
        testTitle: activeTest.title,
        score: earned,
        totalMarks,
        percentage: pct,
        timeUsed,
        questions: activeTest.questions,
        answers,
        review,
        source: String(activeTest.id || "").startsWith("ai-") ? "ai" : "mock",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (err) {
      console.error("Failed to submit attempt:", err);
      // Still show results even if submission fails
      addMockTestAttempt({
        id: `attempt-${Date.now()}`,
        testId: activeTest.id,
        testTitle: activeTest.title,
        score: earned,
        totalMarks,
        percentage: pct,
        timeUsed,
        questions: activeTest.questions,
        answers,
        review,
        source: String(activeTest.id || "").startsWith("ai-") ? "ai" : "mock",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    setResults({ test: activeTest, answers, timeUsed });
    setActiveTest(null);
  }

  if (activeTest) return <ActiveTest test={activeTest} onFinish={finishTest} />;
  if (results) {
    return (
      <Results
        test={results.test}
        answers={results.answers}
        timeUsed={results.timeUsed}
        onRetry={() => startTest(results.test)}
        onHome={() => {
          setResults(null);
          setMainTab("history");
        }}
      />
    );
  }

  const now = new Date();
  const liveMockTests = mockTests.filter(
    (t) => !t.liveAt || new Date(t.liveAt) <= now,
  );
  const upcomingTests = mockTests.filter(
    (t) => t.liveAt && new Date(t.liveAt) > now,
  );
  const filtered = liveMockTests.filter(
    (t) => !filterType || t.type === filterType,
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--foreground)" }}
          >
            Mock Tests
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {liveMockTests.length} live · {upcomingTests.length} upcoming · MCQ,
            Fill-in-Blank, Textual & Coding
          </p>
        </div>
      </div>

      {/* Main tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "var(--muted)" }}
      >
        {(
          [
            ["tests", "📋 Tests"],
            ["history", "🕐 History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMainTab(id)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: mainTab === id ? "var(--card)" : "transparent",
              color:
                mainTab === id
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mainTab === "ai" && <AIGeneratorTab onStart={startTest} />}

      {mainTab === "history" && <HistoryTab />}

      {mainTab === "tests" && (
        <>
          <div
            className="p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <div>
              <h2 className="font-black" style={{ color: "var(--foreground)" }}>
                AI Quiz inside Mock Tests
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Generate a custom quiz by topics, question count, duration, and
                types.
              </p>
            </div>
            <button
              onClick={() => setMainTab("ai")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Sparkles size={15} /> Generate AI Quiz
            </button>
          </div>

          {/* Upcoming tests banner */}
          {upcomingTests.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid rgba(99,102,241,0.35)",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  borderBottom: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <Clock size={14} style={{ color: "#a5b4fc" }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#a5b4fc" }}
                >
                  Upcoming Tests ({upcomingTests.length})
                </span>
              </div>
              <div
                className="divide-y"
                style={{ borderColor: "rgba(99,102,241,0.12)" }}
              >
                {upcomingTests.map((t) => {
                  const liveDate = new Date(t.liveAt!);
                  const diffMs = liveDate.getTime() - now.getTime();
                  const diffH = Math.floor(diffMs / 3600000);
                  const diffM = Math.floor((diffMs % 3600000) / 60000);
                  const color = TYPE_BADGE_COLORS[t.type] ?? "#6366f1";
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-4 py-3 flex-wrap"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                            style={{ background: `${color}18`, color }}
                          >
                            {t.type}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {t.duration} min · {t.questions.length}Q
                          </span>
                        </div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          {t.title}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                          style={{
                            background: "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          <Clock size={11} style={{ color: "#a5b4fc" }} />
                          <span
                            className="text-xs font-bold"
                            style={{ color: "#a5b4fc" }}
                          >
                            {diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`}{" "}
                            left
                          </span>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Goes live{" "}
                          {liveDate.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {liveDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {liveMockTests.length === 0 && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
              <p className="text-sm" style={{ color: "#f59e0b" }}>
                {upcomingTests.length > 0
                  ? "No tests live yet. Check the upcoming tests above."
                  : "No mock tests available yet. Ask your admin to create some."}
              </p>
            </div>
          )}

          {liveMockTests.length > 0 && (
            <div className="flex gap-2">
              {(["", "aptitude", "technical", "mixed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background:
                      filterType === t
                        ? "rgba(99,102,241,0.2)"
                        : "var(--muted)",
                    color:
                      filterType === t ? "#a5b4fc" : "var(--muted-foreground)",
                  }}
                >
                  {t || "All"}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((t) => (
              <TestCard key={t.id} test={t} onStart={() => startTest(t)} />
            ))}
            {filtered.length === 0 && liveMockTests.length > 0 && (
              <div
                className="text-center py-8"
                style={{ color: "var(--muted-foreground)" }}
              >
                No tests match the filter.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

