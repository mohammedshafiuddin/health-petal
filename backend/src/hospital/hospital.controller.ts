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
  try {
    const { id } = req.params;
    const { name, description, address, adminId } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }
    
    // Use a transaction to ensure both operations succeed or fail together
    return await db.transaction(async (tx) => {
      const [updatedHospital] = await tx
        .update(hospitalTable)
        .set({
          name,
          description,
          address
        })
        .where(eq(hospitalTable.id, parseInt(id)))
        .returning();
      
      if (!updatedHospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      
      // If an adminId is provided, update the hospital admin
      if (adminId) {
        // First, check if this hospital already has an admin
        const existingAdmin = await tx
          .select()
          .from(hospitalEmployeesTable)
          .where(
            eq(hospitalEmployeesTable.hospitalId, updatedHospital.id)
          )
          .limit(1);
        
        if (existingAdmin.length > 0) {
          // Update the existing admin
          await tx
            .update(hospitalEmployeesTable)
            .set({
              userId: adminId,
              designation: DESIGNATIONS.HOSPITAL_ADMIN
            })
            .where(eq(hospitalEmployeesTable.hospitalId, updatedHospital.id));
        } else {
          // Add a new admin
          await tx
            .insert(hospitalEmployeesTable)
            .values({
              hospitalId: updatedHospital.id,
              userId: adminId,
              designation: DESIGNATIONS.HOSPITAL_ADMIN
            });
        }
      }
      
      return res.status(200).json({
        hospital: updatedHospital,
        message: "Hospital updated successfully"
      });
    });
  } catch (error) {
    console.error("Update hospital error:", error);
    return res.status(500).json({ error: "Failed to update hospital" });
  }
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
    
    // Fetch all doctor IDs for efficient querying
    const doctorIds = hospitalDoctors.map(doctor => doctor.id);
    
    // Early return if no doctors found
    if (doctorIds.length === 0) {
      return res.status(200).json({
        hospital,
        doctors: []
      });
    }
    
    // Get today's availability for all doctors
    const doctorAvailabilities = await db
      .select()
      .from(doctorAvailabilityTable)
      .where(
        and(
          sql`${doctorAvailabilityTable.doctorId} IN (${doctorIds.join(',')})`,
          eq(doctorAvailabilityTable.date, currentDate)
        )
      );
    
    // Organize data by doctor
    const doctorsWithDetails = hospitalDoctors.map(doctor => {
      // Get today's availability for this doctor
      const availability = doctorAvailabilities.find(avail => avail.doctorId === doctor.id) || {
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
