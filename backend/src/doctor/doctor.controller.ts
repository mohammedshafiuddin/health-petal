import { NextFunction, Request, Response } from "express";
import { db } from "../db/db_index.js";
import { usersTable, doctorInfoTable, doctorSpecializationsTable, hospitalEmployeesTable, doctorSecretariesTable } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { ApiError } from "../lib/api-error.js";

/**
 * Get doctors who are not associated with any hospital
 */
export const getUnassignedDoctors = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Get all doctors who are not in the hospital_employees table
        const doctors = await db
            .select({
                id: usersTable.id,
                name: usersTable.name,
                username: usersTable.username,
            })
            .from(usersTable)
            .innerJoin(doctorInfoTable, eq(doctorInfoTable.userId, usersTable.id))
            .where(
                // Only select users that don't exist in hospital_employees table
                sql`NOT EXISTS (
                    SELECT 1 FROM ${hospitalEmployeesTable} 
                    WHERE ${hospitalEmployeesTable.userId} = ${usersTable.id}
                )`
            );
            
        
        return res.status(200).json(doctors);
    } catch (error) {
        next(error);
    }
};

/**
 * Get doctor responders for a specific doctor
 * Fetches the secretaries assigned to a particular doctor who can respond on their behalf
 * 
 * @param req Request object containing doctorId query parameter
 * @param res Response object
 * @param next Next function
 */
export const getDoctorResponders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract doctorId from query parameters
        const doctorIdParam = req.query.doctorId;
        
        if (!doctorIdParam) {
            throw new ApiError("Missing required parameter: doctorId", 400);
        }
        
        // Convert doctorId to number
        const doctorId = parseInt(doctorIdParam as string, 10);
        
        // Check if doctorId is a valid number
        if (isNaN(doctorId)) {
            throw new ApiError("Invalid doctorId: must be a number", 400);
        }
        
        // Check if the doctor exists
        const doctor = await db.query.doctorInfoTable.findFirst({
            where: eq(doctorInfoTable.userId, doctorId),
            with: {
                user: true
            }
        });
        
        if (!doctor) {
            throw new ApiError("Doctor not found", 404);
        }
        
        // Fetch all secretaries for this doctor
        const secretaries = await db
            .select({
                id: usersTable.id,
                name: usersTable.name,
                email: usersTable.email,
                mobile: usersTable.mobile,
                profilePicUrl: usersTable.profilePicUrl
            })
            .from(doctorSecretariesTable)
            .innerJoin(usersTable, eq(doctorSecretariesTable.secretaryId, usersTable.id))
            .where(eq(doctorSecretariesTable.doctorId, doctorId));
        
        return res.status(200).json({
            doctorId: doctorId,
            doctorName: doctor.user.name,
            responders: secretaries,
            count: secretaries.length
        });
    } catch (error) {
        next(error);
    }
};
