import { Request, Response } from "express";
import { db } from "../db/db_index";
import { 
  hospitalTable, 
  hospitalEmployeesTable,
  usersTable,
  doctorInfoTable,
  doctorAvailabilityTable
} from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { DESIGNATIONS } from "../lib/const-strings";
import { imageUploadS3 } from "../lib/s3-client";
import { ApiError } from "../lib/api-error";

/**
 * Create a new hospital
 */
export const createHospital = async (req: Request, res: Response) => {
  try {
    const { name, description, address, adminId } = req.body;

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    // Use a transaction to ensure both operations succeed or fail together
    return await db.transaction(async (tx) => {
      // Create a new hospital
      const [newHospital] = await tx
        .insert(hospitalTable)
        .values({
          name,
          description,
          address
        })
        .returning();

      // If an admin ID was provided, assign the admin to the hospital
      if (adminId) {
        await tx
          .insert(hospitalEmployeesTable)
          .values({
            hospitalId: newHospital.id,
            userId: adminId,
            designation: DESIGNATIONS.HOSPITAL_ADMIN
          });
      }

      // Handle hospitalImages upload
      let imageUrls: string[] = [];
      if (req.files) {
        imageUrls = await Promise.all(
          (req.files as Express.Multer.File[]).map((file) =>
            imageUploadS3(
              file.buffer,
              file.mimetype,
              `hospital-images/${Date.now()}_${file.originalname}`
            )
          )
        );
      }

      return res.status(201).json({
        hospital: newHospital,
        message: "Hospital created successfully"
      });
    });
  } catch (error) {
    console.error("Create hospital error:", error);
    return res.status(500).json({ error: "Failed to create hospital" });
  }
};

/**
 * Get all hospitals
 */
export const getHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await db.query.hospitalTable.findMany();
    
    return res.status(200).json({
      hospitals,
      count: hospitals.length
    });
  } catch (error) {
    console.error("Get hospitals error:", error);
    return res.status(500).json({ error: "Failed to fetch hospitals" });
  }
};

/**
 * Get a hospital by ID
 */
export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const hospital = await db.query.hospitalTable.findFirst({
      where: eq(hospitalTable.id, parseInt(id))
    });
    
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }
    
    return res.status(200).json({
      hospital
    });
  } catch (error) {
    console.error("Get hospital error:", error);
    return res.status(500).json({ error: "Failed to fetch hospital" });
  }
};

/**
 * Update a hospital
 */
export const updateHospital = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { name, description, address, adminsToAdd, adminsToRemove, doctorsToAdd, doctorsToRemove } = req.body;

    if (!name || !address) {
      throw new ApiError("Name and address are required", 400)
    }

    // Use a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx) => {
      const [updatedHospital] = await tx
        .update(hospitalTable)
        .set({
          name,
          description,
          address,
        })
        .where(eq(hospitalTable.id, parseInt(id)))
        .returning();

      if (!updatedHospital) {
        throw new ApiError("Hospital not found", 404)
      }
      
      // Process admins to remove if any
      if (adminsToRemove && adminsToRemove.length > 0) {
        for (const adminId of adminsToRemove) {
          await tx
            .delete(hospitalEmployeesTable)
            .where(
              and(
                eq(hospitalEmployeesTable.hospitalId, updatedHospital.id),
                eq(hospitalEmployeesTable.userId, adminId),
                eq(hospitalEmployeesTable.designation, DESIGNATIONS.HOSPITAL_ADMIN)
              )
            );
        }
      }

      // Process admins to add if any
      if (adminsToAdd && adminsToAdd.length > 0) {
        for (const adminId of adminsToAdd) {
          // Check if admin is already an employee of this hospital
          const existingAdmin = await tx
            .select()
            .from(hospitalEmployeesTable)
            .where(
              and(
                eq(hospitalEmployeesTable.hospitalId, updatedHospital.id),
                eq(hospitalEmployeesTable.userId, adminId),
                eq(hospitalEmployeesTable.designation, DESIGNATIONS.HOSPITAL_ADMIN)
              )
            )
            .limit(1);

          // Only add if not already an admin
          if (existingAdmin.length === 0) {
            await tx
              .insert(hospitalEmployeesTable)
              .values({
                hospitalId: updatedHospital.id,
                userId: adminId,
                designation: DESIGNATIONS.HOSPITAL_ADMIN,
              });
          }
        }
      }

      // Process doctors to remove if any
      if (doctorsToRemove && doctorsToRemove.length > 0) {
        for (const doctorId of doctorsToRemove) {
          await tx
            .delete(hospitalEmployeesTable)
            .where(
              and(
                eq(hospitalEmployeesTable.hospitalId, updatedHospital.id),
                eq(hospitalEmployeesTable.userId, doctorId),
                eq(hospitalEmployeesTable.designation, DESIGNATIONS.DOCTOR)
              )
            );
        }
      }

      // Process doctors to add if any
      if (doctorsToAdd && doctorsToAdd.length > 0) {
        for (const doctorId of doctorsToAdd) {
          // Check if doctor is already an employee of this hospital
          const existingDoctor = await tx
            .select()
            .from(hospitalEmployeesTable)
            .where(
              and(
                eq(hospitalEmployeesTable.hospitalId, updatedHospital.id),
                eq(hospitalEmployeesTable.userId, doctorId),
                eq(hospitalEmployeesTable.designation, DESIGNATIONS.DOCTOR)
              )
            )
            .limit(1);

          // Only add if not already a doctor
          if (existingDoctor.length === 0) {
            await tx
              .insert(hospitalEmployeesTable)
              .values({
                hospitalId: updatedHospital.id,
                userId: doctorId,
                designation: DESIGNATIONS.DOCTOR,
              });
          }
        }
      }

      return res.status(200).json({
        hospital: updatedHospital,
        message: "Hospital updated successfully",
      });
    });
};

/**
 * Delete a hospital
 */
export const deleteHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [deletedHospital] = await db
      .delete(hospitalTable)
      .where(eq(hospitalTable.id, parseInt(id)))
      .returning();
    
    if (!deletedHospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }
    
    return res.status(200).json({
      message: "Hospital deleted successfully"
    });
  } catch (error) {
    console.error("Delete hospital error:", error);
    return res.status(500).json({ error: "Failed to delete hospital" });
  }
};

/**
 * Get hospital admin dashboard data
 * Returns hospital details along with doctors information including
 * current consultations status
 */
export const getHospitalAdminDashboard = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Validate hospital ID
    if (!hospitalId) {
      return res.status(400).json({ error: "Hospital ID is required" });
    }

    // Get hospital details
    const hospital = await db.query.hospitalTable.findFirst({
      where: eq(hospitalTable.id, parseInt(hospitalId))
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Get doctors working at this hospital
    const hospitalDoctors = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        profilePicUrl: usersTable.profilePicUrl,
        qualifications: doctorInfoTable.qualifications,
        dailyTokenCount: doctorInfoTable.dailyTokenCount,
        consultationFee: doctorInfoTable.consultationFee
      })
      .from(hospitalEmployeesTable)
      .innerJoin(usersTable, eq(hospitalEmployeesTable.userId, usersTable.id))
      .innerJoin(doctorInfoTable, eq(usersTable.id, doctorInfoTable.userId))
      .where(eq(hospitalEmployeesTable.hospitalId, parseInt(hospitalId)));

    // Get admins working at this hospital
    const hospitalAdmins = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        profilePicUrl: usersTable.profilePicUrl
      })
      .from(hospitalEmployeesTable)
      .innerJoin(usersTable, eq(hospitalEmployeesTable.userId, usersTable.id))
      .where(
        and(
          eq(hospitalEmployeesTable.hospitalId, parseInt(hospitalId)),
          eq(hospitalEmployeesTable.designation, DESIGNATIONS.HOSPITAL_ADMIN)
        )
      );

    // Fetch all doctor IDs for efficient querying
    const doctorIds = hospitalDoctors.map((doctor) => doctor.id);

    // Early return if no doctors found
    if (doctorIds.length === 0) {
      return res.status(200).json({
        hospital,
        doctors: [],
        admins: hospitalAdmins
      });
    }

    // Get today's availability for all doctors
    const doctorAvailabilities = await db
      .select()
      .from(doctorAvailabilityTable)
      .where(
        and(
          sql`${doctorAvailabilityTable.doctorId} IN (${doctorIds.join(",")})`,
          eq(doctorAvailabilityTable.date, currentDate)
        )
      );

    // Organize data by doctor
    const doctorsWithDetails = hospitalDoctors.map((doctor) => {
      // Get today's availability for this doctor
      const availability =
        doctorAvailabilities.find((avail) => avail.doctorId === doctor.id) || {
          totalTokenCount: doctor.dailyTokenCount,
          filledTokenCount: 0,
          consultationsDone: 0,
          isStopped: false
        };

      return {
        id: doctor.id,
        name: doctor.name,
        profilePicUrl: doctor.profilePicUrl,
        qualifications: doctor.qualifications,
        consultationFee: doctor.consultationFee,
        tokensIssuedToday: availability.filledTokenCount,
        totalTokenCount: availability.totalTokenCount,
        consultationsDone: availability.consultationsDone,
        currentConsultationNumber: availability.consultationsDone, // Using consultationsDone as current number
        isAvailable: !availability.isStopped,
        availableTokens: availability.totalTokenCount - availability.filledTokenCount
      };
    });

    return res.status(200).json({
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        description: hospital.description
      },
      doctors: doctorsWithDetails,
      admins: hospitalAdmins,
      currentDate,
      totalDoctors: doctorsWithDetails.length,
      totalAppointmentsToday: doctorsWithDetails.reduce((acc, doc) => acc + doc.tokensIssuedToday, 0),
      totalConsultationsDone: doctorsWithDetails.reduce((acc, doc) => acc + doc.consultationsDone, 0)
    });
  } catch (error) {
    console.error("Get hospital admin dashboard error:", error);
    return res.status(500).json({ error: "Failed to fetch hospital admin dashboard data" });
  }
};
