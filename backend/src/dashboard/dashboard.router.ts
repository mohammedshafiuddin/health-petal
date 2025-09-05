import { Router } from "express";
import { getFeaturedDoctors, getFeaturedHospitals } from "./dashboard.controller";

const router = Router();

// Dashboard endpoints
router.get("/featured-doctors", getFeaturedDoctors);
router.get("/featured-hospitals", getFeaturedHospitals);

export default router;
