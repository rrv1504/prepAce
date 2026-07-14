import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Timer,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useAppContext, type AptitudeQuestion } from "../context/AppContext";
import { api } from "../lib/api";
import { aptitudeService } from "../lib/services";

const CTX_ICONS = ["🔢", "🧩", "📚", "📊", "💻", "🎯", "⚡", "🏆", "🔬", "🎲"];
const CTX_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#10b981",
];

// ── Data ──────────────────────────────────────────────────────────────────────

interface AptQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  attempts?: number;
  correctRate?: number;
  solved?: boolean;
  lastSelected?: number;
  timeLimit?: number;
}

interface Section {
  name: string;
  icon: string;
  questions: AptQuestion[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sections: Section[];
}

const CATEGORIES: Category[] = [
  {
    id: "quant",
    name: "Quantitative Aptitude",
    icon: "🔢",
    color: "#6366f1",
    sections: [
      {
        name: "Profit & Loss",
        icon: "💰",
        questions: [
          {
            text: "A shopkeeper buys an item for ₹400 and sells it for ₹520. What is the profit percentage?",
            options: ["25%", "30%", "20%", "15%"],
            correct: 1,
            explanation:
              "Profit = 520 - 400 = ₹120. Profit% = (120/400) × 100 = 30%.",
          },
          {
            text: "A trader sells an article at 15% loss. Had he sold it for ₹60 more, he would have gained 5%. The cost price is:",
            options: ["₹300", "₹320", "₹350", "₹280"],
            correct: 0,
            explanation:
              "Let CP = x. 0.85x + 60 = 1.05x → 60 = 0.20x → x = ₹300.",
          },
          {
            text: "By selling 45 oranges for ₹40, a man loses 20%. How many should he sell for ₹24 to gain 20%?",
            options: ["16", "20", "18", "22"],
            correct: 2,
            explanation:
              "SP for no loss = ₹50 for 45 → CP per orange = 50/45. To gain 20%, SP = 1.2 × CP. Selling for ₹24 → 18 oranges.",
          },
        ],
      },
      {
        name: "Probability",
        icon: "🎲",
        questions: [
          {
            text: "A bag has 4 red, 3 blue, and 5 green balls. One ball is drawn at random. What is the probability of getting a blue ball?",
            options: ["1/4", "3/12", "1/3", "1/6"],
            correct: 1,
            explanation:
              "P(blue) = 3/(4+3+5) = 3/12 = 1/4. Note: 3/12 = 1/4, so option B simplifies correctly.",
          },
          {
            text: "Two dice are thrown simultaneously. What is the probability that the sum equals 7?",
            options: ["1/6", "5/36", "7/36", "1/3"],
            correct: 0,
            explanation:
              "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6.",
          },
          {
            text: "A card is drawn from a deck of 52. What is the probability of getting a face card?",
            options: ["3/13", "4/13", "1/4", "12/52"],
            correct: 0,
            explanation:
              "Face cards = 12 (J, Q, K × 4 suits). P = 12/52 = 3/13.",
          },
        ],
      },
      {
        name: "Permutation & Combination",
        icon: "🔄",
        questions: [
          {
            text: 'In how many ways can the letters of the word "MONDAY" be arranged?',
            options: ["720", "360", "5040", "120"],
            correct: 0,
            explanation:
              '"MONDAY" has 6 distinct letters. Arrangements = 6! = 720.',
          },
          {
            text: "How many 3-digit numbers can be formed from digits 1-9 without repetition?",
            options: ["504", "729", "512", "384"],
            correct: 0,
            explanation: "9 × 8 × 7 = 504.",
          },
        ],
      },
      {
        name: "Time & Work",
        icon: "⏱️",
        questions: [
          {
            text: "A can do a job in 12 days, B in 15 days. How many days do they take together?",
            options: ["6.67 days", "7.5 days", "6 days", "8 days"],
            correct: 0,
            explanation:
              "Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Days = 20/3 ≈ 6.67 days.",
          },
          {
            text: "A pipe fills a tank in 6 hours. Another empties it in 9 hours. If both open together, when will the tank be full?",
            options: ["18 hours", "15 hours", "12 hours", "20 hours"],
            correct: 0,
            explanation:
              "Net fill rate = 1/6 − 1/9 = 1/18 per hour. Time = 18 hours.",
          },
        ],
      },
      {
        name: "Speed, Distance & Time",
        icon: "🚂",
        questions: [
          {
            text: "A train travels 360 km in 4 hours and another 540 km in 6 hours. What is the ratio of their speeds?",
            options: ["1:1", "2:3", "3:2", "4:3"],
            correct: 0,
            explanation:
              "Speed₁ = 360/4 = 90 km/h. Speed₂ = 540/6 = 90 km/h. Ratio = 1:1.",
          },
          {
            text: "A person travels at 60 km/h and returns at 40 km/h. What is the average speed for the round trip?",
            options: ["48 km/h", "50 km/h", "52 km/h", "45 km/h"],
            correct: 0,
            explanation:
              "Average speed = 2xy/(x+y) = 2×60×40/(60+40) = 4800/100 = 48 km/h.",
          },
        ],
      },
      {
        name: "Number Systems",
        icon: "🔣",
        questions: [
          {
            text: "What is the largest 4-digit number divisible by both 8 and 12?",
            options: ["9984", "9996", "9960", "9972"],
            correct: 0,
            explanation:
              "LCM(8,12) = 24. Largest 4-digit multiple of 24 = 9984.",
          },
          {
            text: "The sum of two numbers is 25 and their product is 156. What are the numbers?",
            options: ["12 and 13", "10 and 15", "11 and 14", "8 and 17"],
            correct: 0,
            explanation:
              "x + y = 25, xy = 156 → x² − 25x + 156 = 0 → (x−12)(x−13) = 0.",
          },
        ],
      },
    ],
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    icon: "🧠",
    color: "#8b5cf6",
    sections: [
      {
        name: "Number Series",
        icon: "📈",
        questions: [
          {
            text: "Find the next number: 2, 6, 12, 20, 30, ?",
            options: ["42", "40", "44", "38"],
            correct: 0,
            explanation: "Differences: 4,6,8,10,12. Next term = 30 + 12 = 42.",
          },
          {
            text: "Find the missing term: 3, 9, 27, ?, 243",
            options: ["81", "54", "72", "63"],
            correct: 0,
            explanation: "Each term is multiplied by 3. 27 × 3 = 81.",
          },
          {
            text: "What comes next: 1, 1, 2, 3, 5, 8, 13, ?",
            options: ["21", "20", "18", "24"],
            correct: 0,
            explanation:
              "Fibonacci series: each term = sum of previous two. 8 + 13 = 21.",
          },
        ],
      },
      {
        name: "Coding-Decoding",
        icon: "🔐",
        questions: [
          {
            text: 'If "APPLE" is coded as "BQQMF", what is the code for "MANGO"?',
            options: ["NBOHP", "NBNHP", "MBNHO", "OCNGP"],
            correct: 0,
            explanation:
              "Each letter is shifted +1. M→N, A→B, N→O, G→H, O→P → NBOHP.",
          },
          {
            text: "If RED = 27, BLUE = 40, then GREEN = ?",
            options: ["49", "52", "47", "55"],
            correct: 1,
            explanation:
              "Position sum: R(18)+E(5)+D(4)=27. G(7)+R(18)+E(5)+E(5)+N(14)=49. Wait — check: 7+18+5+5+14=49. But BLUE: B(2)+L(12)+U(21)+E(5)=40. GREEN=49.",
          },
        ],
      },
      {
        name: "Syllogism",
        icon: "📝",
        questions: [
          {
            text: "All cats are animals. All animals are living things. Conclusion: All cats are living things.",
            options: ["True", "False", "Uncertain", "Partially true"],
            correct: 0,
            explanation:
              "By transitivity: Cats ⊆ Animals ⊆ Living things → All cats are living things. TRUE.",
          },
          {
            text: "Some teachers are doctors. All doctors are rich. Conclusion: Some teachers are rich.",
            options: ["True", "False", "Uncertain", "Partially true"],
            correct: 0,
            explanation:
              "Some teachers are doctors, and all doctors are rich → some teachers are definitely rich.",
          },
        ],
      },
      {
        name: "Blood Relations",
        icon: "👨‍👩‍👧",
        questions: [
          {
            text: "A is the father of B. B is the sister of C. D is the husband of C. How is A related to D?",
            options: ["Father-in-law", "Uncle", "Brother", "Grandfather"],
            correct: 0,
            explanation:
              "A is B's father → A is C's father. C's husband is D → A is D's father-in-law.",
          },
          {
            text: 'If "X + Y" means X is the mother of Y, "X − Y" means X is the brother of Y, "X × Y" means X is the father of Y, which expression shows P is the maternal uncle of Q?',
            options: ["P − R + Q", "R + P − Q", "P + R − Q", "Q − P + R"],
            correct: 0,
            explanation:
              "P − R means P is brother of R. R + Q means R is mother of Q. So P is maternal uncle of Q.",
          },
        ],
      },
      {
        name: "Seating Arrangement",
        icon: "💺",
        questions: [
          {
            text: "Six people A,B,C,D,E,F sit in a row. B is to the immediate right of A. D is not adjacent to E. F sits at the extreme left. Who sits in the middle?",
            options: ["A or B", "C or D", "B or C", "D or E"],
            correct: 2,
            explanation:
              "F is leftmost. A-B is a pair. Working out constraints, B or C occupies the middle positions.",
          },
        ],
      },
    ],
  },
  {
    id: "verbal",
    name: "Verbal Ability",
    icon: "📚",
    color: "#06b6d4",
    sections: [
      {
        name: "Reading Comprehension",
        icon: "📖",
        questions: [
          {
            text: 'Which of the following best describes a "laconic" person based on context: "The general was famously laconic, preferring a single sharp command to lengthy explanations"?',
            options: [
              "Uses few words",
              "Uses complex language",
              "Speaks loudly",
              "Avoids communication",
            ],
            correct: 0,
            explanation:
              '"Laconic" means using few words; brief and concise in speech.',
          },
        ],
      },
      {
        name: "Sentence Correction",
        icon: "✏️",
        questions: [
          {
            text: "Choose the correct sentence:",
            options: [
              "Neither of the students have submitted their assignment.",
              "Neither of the students has submitted their assignment.",
              "Neither of the students has submitted his assignment.",
              "Neither of the student has submitted his assignment.",
            ],
            correct: 1,
            explanation:
              '"Neither" takes singular verb "has". "their" is acceptable as a gender-neutral pronoun.',
          },
          {
            text: 'Identify the error: "The committee have decided to postpone it\'s meeting."',
            options: [
              "committee have",
              "it's meeting",
              "to postpone",
              "No error",
            ],
            correct: 1,
            explanation:
              '"it\'s" = "it is". The correct possessive is "its". It should be "its meeting".',
          },
        ],
      },
      {
        name: "Fill in the Blanks",
        icon: "📋",
        questions: [
          {
            text: "The scientist's ________ research led to a groundbreaking discovery.",
            options: ["persistent", "persisted", "persistence", "persistently"],
            correct: 0,
            explanation: '"persistent" is an adjective modifying "research".',
          },
          {
            text: "Despite being ________, she managed to complete the marathon.",
            options: ["exhausted", "exhausting", "exhaustion", "exhaust"],
            correct: 0,
            explanation:
              '"exhausted" is the correct adjective for the subject "she".',
          },
        ],
      },
    ],
  },
  {
    id: "di",
    name: "Data Interpretation",
    icon: "📊",
    color: "#f59e0b",
    sections: [
      {
        name: "Tables",
        icon: "📋",
        questions: [
          {
            text: "A company's sales were: Q1: ₹120L, Q2: ₹150L, Q3: ₹180L, Q4: ₹90L. Which quarter had the highest growth compared to the previous quarter?",
            options: ["Q2", "Q3", "Q4", "Q1"],
            correct: 0,
            explanation:
              "Q2 growth = (150-120)/120 = 25%. Q3 growth = (180-150)/150 = 20%. Q2 had the highest growth at 25%.",
          },
        ],
      },
      {
        name: "Bar & Pie Charts",
        icon: "🥧",
        questions: [
          {
            text: "A pie chart shows: Engineering 30%, Medicine 20%, Arts 15%, Commerce 25%, Others 10%. If 6000 students enrolled, how many are in Commerce?",
            options: ["1500", "1800", "1200", "2000"],
            correct: 0,
            explanation: "25% of 6000 = 0.25 × 6000 = 1500.",
          },
        ],
      },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function QuestionView({
  question,
  questionNumber,
  total,
  onNext,
  onPrev,
  onExit,
  onAnswered,
}: {
  question: AptQuestion;
  questionNumber: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onAnswered: (questionId: string, selected: number, timeUsed: number) => Promise<void>;
}) {
  const [selected, setSelected] = useState<number | null>(question.lastSelected ?? null);
  const [submitted, setSubmitted] = useState(Boolean(question.solved));
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // stopwatch (count up) per question
  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setSelected(question.lastSelected ?? null);
    setSubmitted(Boolean(question.solved));
    setElapsed(0);
  }, [question.id, question.lastSelected, question.solved]);

  const handleSubmit = async () => {
    if (selected === null) return;
    setSaving(true);
    try {
      await onAnswered(question.id, selected, elapsed);
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };
  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    setElapsed(0);
    onNext();
  };
  const handlePrev = () => {
    setSelected(null);
    setSubmitted(false);
    setElapsed(0);
    onPrev();
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top bar */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={14} /> Exit
        </button>
        <div
          className="text-xs font-semibold"
          style={{ color: "var(--muted-foreground)" }}
        >
          Question {questionNumber} of {total}
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: "var(--muted)", color: "var(--foreground)" }}
        >
          <Timer size={12} />
          <span className="mono font-bold text-xs">
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--muted)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(questionNumber / total) * 100}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>

      {/* Question card */}
      <div
        className="p-6 rounded-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/<[a-z][\s\S]*>/i.test(question.text) ? (
          <div
            className="rich-question text-base leading-relaxed mb-6"
            style={{ color: "var(--foreground)" }}
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
        ) : (
          <p
            className="text-base font-medium leading-relaxed mb-6"
            style={{ color: "var(--foreground)" }}
          >
            {question.text}
          </p>
        )}
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let style: React.CSSProperties = {
              background: "var(--muted)",
              border: "1px solid var(--border)",
            };
            if (submitted) {
              if (i === question.correct)
                style = {
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.4)",
                };
              else if (i === selected)
                style = {
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.4)",
                };
            } else if (selected === i) {
              style = {
                background: "rgba(99,102,241,0.15)",
                border: "1px solid var(--primary)",
              };
            }
            return (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                disabled={submitted}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:opacity-90"
                style={style}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{opt}</span>
                {submitted && i === question.correct && (
                  <CheckCircle2 size={15} className="ml-auto text-green-400" />
                )}
                {submitted && i === selected && i !== question.correct && (
                  <XCircle size={15} className="ml-auto text-red-400" />
                )}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--primary)" }}
            >
              Explanation
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={questionNumber === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-30"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null || saving}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--gradient-primary)" }}
          >
            {saving ? "Saving..." : "Submit Answer"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={questionNumber === total}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--gradient-primary)" }}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

type View =
  | { type: "home" }
  | { type: "sections"; categoryId: string }
  | { type: "practice"; categoryId: string; sectionName: string; qIdx: number };

export default function AptitudeModule() {
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>({ type: "home" });

  // Fetch questions from backend API
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");
        const [data, attemptList] = await Promise.all([
          api.get<AptitudeQuestion[]>("/aptitude-questions"),
          aptitudeService.listAttempts().catch(() => []),
        ]);
        setQuestions(data || []);
        setAttempts((attemptList || []).reduce<Record<string, any>>((acc, attempt: any) => {
          const questionId = String(attempt.question?._id || attempt.question || attempt.questionId || "");
          if (questionId) acc[questionId] = attempt;
          return acc;
        }, {}));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load questions";
        setError(msg);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Build categories from fetched questions: topic -> subtopic -> questions.
  const topics = [...new Set(questions.map((q) => q.topic))];
  const categories: Category[] = topics.map((topic, idx) => {
    const subtopics = [...new Set(questions.filter((q) => q.topic === topic).map((q) => q.subtopic || "General"))];
    return {
      id: `topic-${topic}`,
      name: topic,
      icon: CTX_ICONS[idx % CTX_ICONS.length],
      color: CTX_COLORS[idx % CTX_COLORS.length],
      sections: subtopics.map((subtopic) => ({
        name: subtopic,
        icon: "Folder",
        questions: questions
          .filter((q) => q.topic === topic && (q.subtopic || "General") === subtopic)
          .map((q) => {
            const id = String((q as any).id || (q as any)._id);
            const attempt = attempts[id];
            return {
              id,
              topic: q.topic,
              subtopic: q.subtopic || "General",
              difficulty: q.difficulty,
              text: q.question,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
              attempts: q.attempts,
              correctRate: q.correctRate,
              solved: Boolean(attempt),
              lastSelected: attempt?.selected,
              timeLimit: q.timeLimit,
            };
          }),
      })),
    };
  });

  async function submitAptitudeAnswer(questionId: string, selected: number, timeUsed: number) {
    const result: any = await aptitudeService.submitAnswer({ questionId, selected, timeUsed });
    const attempt = result.attempt || result;
    setAttempts(prev => ({ ...prev, [questionId]: attempt }));
    setQuestions(prev => prev.map(question => {
      const id = String((question as any).id || (question as any)._id);
      if (id !== questionId) return question;
      return {
        ...question,
        attempts: result.questionStats?.attempts ?? question.attempts,
        correctRate: result.questionStats?.correctRate ?? question.correctRate,
      };
    }));
    window.dispatchEvent(new Event("prepace:progress-updated"));
  }
  const goHome = () => setView({ type: "home" });

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader
          size={32}
          className="mx-auto mb-3 animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p style={{ color: "var(--muted-foreground)" }}>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle
          size={32}
          className="mx-auto mb-3"
          style={{ color: "#ef4444" }}
        />
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle
          size={32}
          className="mx-auto mb-3"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p style={{ color: "var(--muted-foreground)" }}>
          No aptitude questions available
        </p>
      </div>
    );
  }

  if (view.type === "sections") {
    const cat = categories.find((c) => c.id === view.categoryId)!;
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goHome}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{
              background: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black">
              {cat.icon} {cat.name}
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {cat.sections.length} sections
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cat.sections.map((sec) => (
            <button
              key={sec.name}
              onClick={() =>
                setView({
                  type: "practice",
                  categoryId: cat.id,
                  sectionName: sec.name,
                  qIdx: 0,
                })
              }
              className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] group"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="text-2xl mb-3">{sec.icon}</div>
              <h3 className="font-bold text-base">{sec.name}</h3>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                {sec.questions.length} questions
              </p>
              <div
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: cat.color }}
              >
                Start Practice{" "}
                <ChevronRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view.type === "practice") {
    const cat = categories.find((c) => c.id === view.categoryId)!;
    const sec = cat.sections.find((s) => s.name === view.sectionName)!;
    const q = sec.questions[view.qIdx];

    return (
      <div className="p-4 lg:p-6">
        <QuestionView
          question={q}
          questionNumber={view.qIdx + 1}
          total={sec.questions.length}
          onNext={() =>
            setView({
              ...view,
              qIdx: Math.min(view.qIdx + 1, sec.questions.length - 1),
            })
          }
          onPrev={() => setView({ ...view, qIdx: Math.max(view.qIdx - 1, 0) })}
          onExit={() =>
            setView({ type: "sections", categoryId: view.categoryId })
          }
          onAnswered={submitAptitudeAnswer}
        />
      </div>
    );
  }

  // Home view — card layout
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Aptitude Practice</h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Select a category to start practicing
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const totalQ = cat.sections.reduce(
            (a, s) => a + s.questions.length,
            0,
          );
          return (
            <button
              key={cat.id}
              onClick={() => setView({ type: "sections", categoryId: cat.id })}
              className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg group"
              style={{
                background: "var(--card)",
                border: `1px solid var(--border)`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: `${cat.color}15` }}
              >
                {cat.icon}
              </div>
              <h3 className="font-black text-base leading-tight mb-1">
                {cat.name}
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {cat.sections.length} topics
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: `${cat.color}15`, color: cat.color }}
                >
                  {totalQ} questions
                </span>
                <ChevronRight
                  size={15}
                  style={{ color: cat.color }}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
              <div
                className="mt-4 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--muted)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: "0%", background: cat.color }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

