const express = require("express");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const Badge = require("../models/Badge");
const CompanyVisit = require("../models/CompanyVisit");
const Contest = require("../models/Contest");
const DSAProblem = require("../models/DSAProblem");
const InterviewExperience = require("../models/InterviewExperience");
const JudgeConfig = require("../models/JudgeConfig");
const MockTest = require("../models/MockTest");
const Notification = require("../models/Notification");
const Resource = require("../models/Resource");
const Roadmap = require("../models/Roadmap");
const StudyTask = require("../models/StudyTask");
const authRoutes = require("./authRoutes");
const aiRoutes = require("./aiRoutes");
const aptitudeProgressRoutes = require("./aptitudeProgressRoutes");
const codeRoutes = require("./codeRoutes");
const createCrudRouter = require("./crudRoutes");
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/auth");
const { respondToVisit } = require("../controllers/companyVisitController");
const {
  downloadResourceFile,
  openResourceFile,
  uploadResourceFile,
} = require("../controllers/resourceController");
const mockAttemptRoutes = require("./mockAttemptRoutes");
const notificationRoutes = require("./notificationRoutes");
const progressRoutes = require("./progressRoutes");
const submissionRoutes = require("./submissionRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "prepace-api" });
});

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/users", userRoutes);
router.use("/aptitude-attempts", aptitudeProgressRoutes);
router.use("/code", codeRoutes);
router.post("/company-visits/:id/respond", protect, respondToVisit);
router.use("/company-visits", createCrudRouter(CompanyVisit));
router.use("/dsa-problems", createCrudRouter(DSAProblem));
router.use("/aptitude-questions", createCrudRouter(AptitudeQuestion));
router.use("/mock-tests", createCrudRouter(MockTest));
router.use("/mock-attempts", mockAttemptRoutes);
router.post("/resources/upload", protect, requireAdmin, uploadResourceFile);
router.get("/resources/:id/download", protect, downloadResourceFile);
router.get("/resources/:id/open", protect, openResourceFile);
router.use("/resources", createCrudRouter(Resource));
router.use("/roadmaps", createCrudRouter(Roadmap));
router.use("/progress", progressRoutes);
router.use("/badges", createCrudRouter(Badge));
router.use("/submissions", submissionRoutes);
router.use("/study-tasks", createCrudRouter(StudyTask, { userScoped: true }));
router.use(
  "/interview-experiences",
  createCrudRouter(InterviewExperience, { publicWrite: true }),
);
router.use("/notifications", notificationRoutes);
router.use("/judge-configs", createCrudRouter(JudgeConfig));
router.use("/contests", createCrudRouter(Contest));

module.exports = router;
