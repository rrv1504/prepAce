/**
 * Comprehensive API Services Layer
 * Centralized place for all backend API calls
 */

import { api, loadCollection } from "./api";
import type {
  DSAProblem,
  AptitudeQuestion,
  MockTestDef,
  CompanyVisit,
  StudyRoadmap,
  Resource,
  Badge,
  CodeSubmission,
  RoadmapProgress,
  MockTestAttempt,
} from "../context/AppContext";

// ── DSA Problems ──────────────────────────────────────────────────────────────
export const dsaService = {
  listAll: () => api.get<DSAProblem[]>("/dsa-problems"),
  getOne: (id: string) => api.get<DSAProblem>(`/dsa-problems/${id}`),
  create: (data: Partial<DSAProblem>) => api.post("/dsa-problems", data),
  update: (id: string, data: Partial<DSAProblem>) =>
    api.patch(`/dsa-problems/${id}`, data),
  delete: (id: string) => api.delete(`/dsa-problems/${id}`),
};

// ── Aptitude Questions ────────────────────────────────────────────────────────
export const aptitudeService = {
  listAll: () => api.get<AptitudeQuestion[]>("/aptitude-questions"),
  getOne: (id: string) =>
    api.get<AptitudeQuestion>(`/aptitude-questions/${id}`),
  create: (data: Partial<AptitudeQuestion>) =>
    api.post("/aptitude-questions", data),
  update: (id: string, data: Partial<AptitudeQuestion>) =>
    api.patch(`/aptitude-questions/${id}`, data),
  delete: (id: string) => api.delete(`/aptitude-questions/${id}`),
  listAttempts: () => api.get<any[]>("/aptitude-attempts/mine"),
  submitAnswer: (data: { questionId: string; selected: number; timeUsed?: number }) =>
    api.post("/aptitude-attempts", data),
};

// ── Mock Tests ────────────────────────────────────────────────────────────────
export const mockTestService = {
  listAll: () => api.get<MockTestDef[]>("/mock-tests"),
  getOne: (id: string) => api.get<MockTestDef>(`/mock-tests/${id}`),
  create: (data: Partial<MockTestDef>) => api.post("/mock-tests", data),
  update: (id: string, data: Partial<MockTestDef>) =>
    api.patch(`/mock-tests/${id}`, data),
  delete: (id: string) => api.delete(`/mock-tests/${id}`),
};

// ── Mock Attempts (User Test Submissions) ─────────────────────────────────────
export const mockAttemptService = {
  listMine: () => api.get<MockTestAttempt[]>("/mock-attempts/mine"),
  listAll: () => api.get<MockTestAttempt[]>("/mock-attempts"), // admin only
  submit: (data: Partial<MockTestAttempt>) => api.post("/mock-attempts", data),
  create: (data: Partial<MockTestAttempt>) => api.post("/mock-attempts", data),
};

// ── Company Visits ────────────────────────────────────────────────────────────
export const companyVisitService = {
  listAll: () => loadCollection<CompanyVisit>("/company-visits"),
  getOne: (id: string) => api.get<CompanyVisit>(`/company-visits/${id}`),
  respond: (id: string, status: "accepted" | "rejected", reason?: string) =>
    api.post(`/company-visits/${id}/respond`, { status, reason }),
  create: (data: Partial<CompanyVisit>) => api.post("/company-visits", data),
  update: (id: string, data: Partial<CompanyVisit>) =>
    api.patch(`/company-visits/${id}`, data),
  delete: (id: string) => api.delete(`/company-visits/${id}`),
};

// ── Roadmaps ──────────────────────────────────────────────────────────────────
export const roadmapService = {
  listAll: () => loadCollection<StudyRoadmap>("/roadmaps"),
  getOne: (id: string) => api.get<StudyRoadmap>(`/roadmaps/${id}`),
  create: (data: Partial<StudyRoadmap>) => api.post("/roadmaps", data),
  update: (id: string, data: Partial<StudyRoadmap>) =>
    api.patch(`/roadmaps/${id}`, data),
  delete: (id: string) => api.delete(`/roadmaps/${id}`),
};

// ── Progress Tracking ─────────────────────────────────────────────────────────
export const progressService = {
  listRoadmaps: async () => {
    const items = await api.get<any[]>("/progress/roadmaps");
    const list = Array.isArray(items) ? items : [];
    return list.map((item) => ({
      roadmapId: String(
        item.roadmap?.id || item.roadmap?._id || item.roadmap || item.roadmapId,
      ),
      startedAt: item.startedAt,
      completedTasks: item.completedTasks || [],
    })) as RoadmapProgress[];
  },
  startRoadmap: (roadmapId: string) =>
    api.post(`/progress/roadmaps/${roadmapId}/start`),
  toggleTask: async (roadmapId: string, taskKey: string) => {
    const updated = await api.patch<any>(
      `/progress/roadmaps/${roadmapId}/tasks`,
      { taskKey },
    );
    return {
      roadmapId: String(
        updated.roadmap?.id ||
          updated.roadmap?._id ||
          updated.roadmap ||
          roadmapId,
      ),
      startedAt: updated.startedAt,
      completedTasks: updated.completedTasks || [],
    } as RoadmapProgress;
  },
};

// ── Resources ─────────────────────────────────────────────────────────────────
export const resourceService = {
  listAll: () => api.get<Resource[]>("/resources"),
  getOne: (id: string) => api.get<Resource>(`/resources/${id}`),
  create: (data: Partial<Resource>) => api.post("/resources", data),
  upload: (data: { file: string; folder?: string; resourceType?: string; filename?: string; type?: string }) =>
    api.post("/resources/upload", data),
  update: (id: string, data: Partial<Resource>) =>
    api.patch(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

// ── Badges ────────────────────────────────────────────────────────────────────
export const badgeService = {
  listAll: () => loadCollection<Badge>("/badges"),
  getOne: (id: string) => api.get<Badge>(`/badges/${id}`),
  create: (data: Partial<Badge>) => api.post("/badges", data),
  update: (id: string, data: Partial<Badge>) => api.patch(`/badges/${id}`, data),
  delete: (id: string) => api.delete(`/badges/${id}`),
};

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionService = {
  listAll: () => api.get<CodeSubmission[]>("/submissions"),
  submit: (data: Partial<CodeSubmission>) => api.post("/submissions", data),
};

// ── Code Execution ────────────────────────────────────────────────────────────
export const codeService = {
  run: (payload: { language: string; code: string; input?: string }) =>
    api.post("/code/run", payload),
  judge: (payload: {
    language: string;
    code: string;
    testCases: Array<{ input: string; expected: string }>;
    problemId?: string;
  }) => api.post("/code/judge", payload),
};

// ── Authentication ────────────────────────────────────────────────────────────
export const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    college?: string;
    branch?: string;
    year?: string;
  }) => api.post("/auth/register", data),

  login: (email: string, password: string) =>
    api.post<{ token: string; user: any }>("/auth/login", { email, password }),

  getProfile: () => api.get<{ user: any }>("/auth/me"),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch<{ user: any }>("/auth/me", data),

  getLeaderboard: (limit = 10) =>
    api.get<{
      entries: Array<{
        rank: number;
        id: string;
        name: string;
        college: string;
        xp: number;
        isMe: boolean;
      }>;
      myRank: number | null;
    }>(`/auth/leaderboard?limit=${limit}`),

  getWeeklyActivity: () =>
    api.get<Array<{ day: string; problems: number; time: number }>>(
      "/auth/weekly-activity",
    ),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const userService = {
  listAll: () => api.get("/users"),
  updateStatus: (id: string, status: string) =>
    api.patch(`/users/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const notificationService = {
  listAll: () => loadCollection<any>("/notifications"),
  create: (data: {
    title: string;
    body: string;
    user?: string;
    type?: string;
    icon?: string;
    iconColor?: string;
  }) => api.post("/notifications", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ── AI Routes ─────────────────────────────────────────────────────────────────
export const aiService = {
  generateQuiz: (payload: any) => api.post("/ai/quiz", payload),
  generateRoadmap: (payload: any) => api.post("/ai/roadmap", payload),
};

export default {
  dsa: dsaService,
  aptitude: aptitudeService,
  mockTest: mockTestService,
  mockAttempt: mockAttemptService,
  companyVisit: companyVisitService,
  roadmap: roadmapService,
  progress: progressService,
  resource: resourceService,
  badge: badgeService,
  submission: submissionService,
  code: codeService,
  auth: authService,
  user: userService,
  notification: notificationService,
  ai: aiService,
};
