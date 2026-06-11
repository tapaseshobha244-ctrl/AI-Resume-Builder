import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumesRouter from "./resumes";
import aiRouter from "./ai";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resumesRouter);
router.use(aiRouter);
router.use(paymentsRouter);
router.use(adminRouter);

export default router;
