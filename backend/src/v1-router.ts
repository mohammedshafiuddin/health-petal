import { Router } from "express";
import userRouter from "./user/user.router";
import hospitalRouter from "./hospital/hospital.router";
import doctorRouter from "./doctor/doctor.router.js";
import specializationRouter from "./specialization/specialization.router.js";
import dashboardRouter from "./dashboard/dashboard.router";
import tokenRouter from "./token/token.router";

const router = Router();

router.use('/users', userRouter);
router.use('/hospitals', hospitalRouter);
router.use('/doctors', doctorRouter);
router.use('/specializations', specializationRouter);
router.use('/dashboard', dashboardRouter);
router.use('/tokens', tokenRouter);

const v1Router = router;

export default v1Router;