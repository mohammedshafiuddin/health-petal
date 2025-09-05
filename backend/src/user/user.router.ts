import { Router } from "express";
import { signup, login, addBusinessUser, getBusinessUsers, getPotentialHospitalAdmins, getUserById, updateUser, getUserResponsibilities } from "./user.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// User routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/business-user", addBusinessUser);
router.get("/business-users", getBusinessUsers);
router.get("/potential-hospital-admins", getPotentialHospitalAdmins);
router.get("/user/:userId", verifyToken, getUserById);
router.put("/:userId", verifyToken, updateUser);
router.get("/responsibilities/:userId", getUserResponsibilities);
router.get("/responsibilities", verifyToken, getUserResponsibilities);

export default router;
