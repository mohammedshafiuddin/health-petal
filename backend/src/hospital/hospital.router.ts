import { Router } from "express";
import { 
  createHospital, 
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  getHospitalAdminDashboard
} from "./hospital.controller";

const router = Router();

// Hospital routes
router.post("/", createHospital);
router.get("/", getHospitals);

// Hospital admin specific routes
router.get("/admin-dashboard/:hospitalId", getHospitalAdminDashboard);

// Generic hospital routes with parameters
router.get("/:id", getHospitalById);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);

export default router;
