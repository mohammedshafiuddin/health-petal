import { Router } from "express";
import { signup, login, addBusinessUser, getBusinessUsers, getPotentialHospitalAdmins, getPotentialDoctorEmployees, getUserById, updateUser, getUserResponsibilities, getUpcomingTokens } from "./user.controller";
import { verifyToken } from "../middleware/auth";
import uploadHandler from '../lib/upload-handler';

const router = Router();

// User routes
router.post("/signup", uploadHandler.single('profilePic'), signup);
router.post("/login", login);
router.post("/business-user", uploadHandler.single('profilePic'), addBusinessUser);
router.get("/business-users", getBusinessUsers);
router.get("/potential-hospital-admins", getPotentialHospitalAdmins);
router.get("/potential-doctor-employees", getPotentialDoctorEmployees);
router.get("/user/:userId", verifyToken, getUserById);
router.put("/:userId", verifyToken, uploadHandler.single('profilePic'), updateUser);
router.get("/responsibilities/:userId", getUserResponsibilities);
router.get("/responsibilities", verifyToken, getUserResponsibilities);
router.get("/upcoming-tokens", verifyToken, getUpcomingTokens);

export default router;
