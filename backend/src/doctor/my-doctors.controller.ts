import { NextFunction, Request, Response } from "express";
import { db } from "../db/db_index.js";
import {
  usersTable,
  doctorInfoTable,
  doctorSpecializationsTable,
  hospitalEmployeesTable,
  doctorSecretariesTable,
  specializationsTable,
} from "../db/schema.js";
import { eq, and, sql, inArray } from "drizzle-orm";
import { ApiError } from "../lib/api-error.js";
import { DESIGNATIONS } from "../lib/const-strings.js";
import { Doctor } from "shared-types";

/**
 * Get doctors based on user's responsibilities:
 * - If the user is a hospital admin, returns all doctors in that hospital
 * - If the user is a secretary, returns all doctors they are secretary for
 * - Otherwise returns an empty list
 */
export const getMyDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    // First check if the user is a hospital admin
    const hospitalAdmin = await db.query.hospitalEmployeesTable.findFirst({
      where: (he) =>
        and(
          eq(he.userId, userId),
          eq(he.designation, DESIGNATIONS.HOSPITAL_ADMIN)
        ),
    });
    
    let doctors: Doctor[] = [];

    if (hospitalAdmin) {
      // User is a hospital admin, get all doctors in their hospital
      doctors = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          mobile: usersTable.mobile,
          doctorInfo: {
            id: doctorInfoTable.id,
            qualifications: doctorInfoTable.qualifications,
            dailyTokenCount: doctorInfoTable.dailyTokenCount,
            consultationFee: doctorInfoTable.consultationFee,
          },
          specializations: sql<
            Array<{ id: number; name: string; description: string | null }>
          >`
                        (SELECT json_agg(json_build_object(
                            'id', ${specializationsTable.id},
                            'name', ${specializationsTable.name},
                            'description', ${specializationsTable.description}
                        ))
                        FROM ${doctorSpecializationsTable}
                        JOIN ${specializationsTable} ON ${doctorSpecializationsTable.specializationId} = ${specializationsTable.id}
                        WHERE ${doctorSpecializationsTable.doctorId} = ${usersTable.id}
                        GROUP BY ${doctorSpecializationsTable.doctorId})`,
        })
        .from(usersTable)
        .innerJoin(doctorInfoTable, eq(doctorInfoTable.userId, usersTable.id))
        .innerJoin(
          hospitalEmployeesTable,
          eq(hospitalEmployeesTable.userId, usersTable.id)
        )
        .where(eq(hospitalEmployeesTable.hospitalId, hospitalAdmin.hospitalId));
    } else {
      // Check if the user is a secretary for any doctors
      const secretaryFor = await db
        .select({ doctorId: doctorSecretariesTable.doctorId })
        .from(doctorSecretariesTable)
        .where(eq(doctorSecretariesTable.secretaryId, userId));

      if (secretaryFor.length > 0) {
        const doctorIds = secretaryFor.map((item) => item.doctorId);

        // User is a secretary, get all doctors they are secretary for
        doctors = await db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            username: usersTable.username,
            email: usersTable.email,
            mobile: usersTable.mobile,
            doctorInfo: {
              id: doctorInfoTable.id,
              qualifications: doctorInfoTable.qualifications,
              dailyTokenCount: doctorInfoTable.dailyTokenCount,
              consultationFee: doctorInfoTable.consultationFee,
            },
            specializations: sql<
              Array<{ id: number; name: string; description: string | null }>
            >`
                            (SELECT json_agg(json_build_object(
                                'id', ${specializationsTable.id},
                                'name', ${specializationsTable.name},
                                'description', ${specializationsTable.description}
                            ))
                            FROM ${doctorSpecializationsTable}
                            JOIN ${specializationsTable} ON ${doctorSpecializationsTable.specializationId} = ${specializationsTable.id}
                            WHERE ${doctorSpecializationsTable.doctorId} = ${usersTable.id}
                            GROUP BY ${doctorSpecializationsTable.doctorId})`,
          })
          .from(usersTable)
          .innerJoin(doctorInfoTable, eq(doctorInfoTable.userId, usersTable.id))
          .where(inArray(usersTable.id, doctorIds));
      }
    }
    

    return res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching my doctors:", error);
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Failed to fetch doctors", 500)
    );
  }
};


