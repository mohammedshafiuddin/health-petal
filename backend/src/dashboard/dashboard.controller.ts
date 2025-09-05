import { NextFunction, Request, Response } from "express";
import { db } from "../db/db_index";
import { hospitalEmployeesTable, hospitalTable, doctorInfoTable, usersTable, doctorSpecializationsTable, specializationsTable } from "../db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { ApiError } from "../lib/api-error";

/**
 * Get featured doctors with their associated hospitals and specializations
 * 
 * This is a placeholder implementation that returns doctors with highest consultation fees
 * Later we can replace this with a more sophisticated recommendation algorithm
 */
export const getFeaturedDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(limit) || limit < 1) {
      throw new ApiError("Invalid limit parameter", 400);
    }

    // Query doctors sorted by consultation fee (placeholder for recommendation algorithm)
    const featuredDoctors = await db
      .select({
        id: usersTable.id,
        doctorId: doctorInfoTable.id,
        name: usersTable.name,
        profilePicUrl: usersTable.profilePicUrl,
        qualifications: doctorInfoTable.qualifications,
        consultationFee: doctorInfoTable.consultationFee,
        dailyTokenCount: doctorInfoTable.dailyTokenCount,
      })
      .from(doctorInfoTable)
      .innerJoin(usersTable, eq(doctorInfoTable.userId, usersTable.id))
      .orderBy(desc(doctorInfoTable.consultationFee))
      .limit(limit);

    // For each doctor, fetch their specializations and hospital
    const doctorsWithDetails = await Promise.all(
      featuredDoctors.map(async (doctor) => {
        // Get specializations
        const specializations = await db
          .select({
            id: specializationsTable.id,
            name: specializationsTable.name,
            description: specializationsTable.description,
          })
          .from(doctorSpecializationsTable)
          .innerJoin(
            specializationsTable,
            eq(doctorSpecializationsTable.specializationId, specializationsTable.id)
          )
          .where(eq(doctorSpecializationsTable.doctorId, doctor.id));

        // Get hospital (if any)
        const hospitalEmployment = await db
          .select({
            hospitalId: hospitalTable.id,
            hospitalName: hospitalTable.name,
            hospitalAddress: hospitalTable.address,
            designation: hospitalEmployeesTable.designation,
          })
          .from(hospitalEmployeesTable)
          .innerJoin(
            hospitalTable, 
            eq(hospitalEmployeesTable.hospitalId, hospitalTable.id)
          )
          .where(eq(hospitalEmployeesTable.userId, doctor.id))
          .limit(1);

        // Return the doctor with their specializations and hospital info
        return {
          ...doctor,
          specializations,
          hospital: hospitalEmployment.length > 0 ? {
            id: hospitalEmployment[0].hospitalId,
            name: hospitalEmployment[0].hospitalName,
            address: hospitalEmployment[0].hospitalAddress,
            designation: hospitalEmployment[0].designation,
          } : null
        };
      })
    );

    return res.status(200).json(doctorsWithDetails);
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured hospitals
 * 
 * This is a placeholder implementation that returns hospitals with most employees
 * Later we can replace this with a more sophisticated recommendation algorithm
 */
export const getFeaturedHospitals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(limit) || limit < 1) {
      throw new ApiError("Invalid limit parameter", 400);
    }

    // Subquery to count employees per hospital
    const hospitalCounts = db
      .select({
        hospitalId: hospitalEmployeesTable.hospitalId,
        count: sql<number>`count(${hospitalEmployeesTable.userId})`.as('employeeCount'),
      })
      .from(hospitalEmployeesTable)
      .groupBy(hospitalEmployeesTable.hospitalId)
      .as("hospital_counts");

    // Query hospitals with employee counts
    const featuredHospitals = await db
      .select({
        id: hospitalTable.id,
        name: hospitalTable.name,
        address: hospitalTable.address,
        description: hospitalTable.description,
        employeeCount: hospitalCounts.count,
      })
      .from(hospitalTable)
      .leftJoin(hospitalCounts, eq(hospitalTable.id, hospitalCounts.hospitalId))
      .orderBy(desc(hospitalCounts.count))
      .limit(limit);

    return res.status(200).json(featuredHospitals);
  } catch (error) {
    next(error);
  }
};
