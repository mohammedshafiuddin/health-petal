import { NextFunction, Request, Response } from "express";
import { db } from "../db/db_index";
import { tokenInfoTable, doctorInfoTable, doctorAvailabilityTable, runningCounterTable, usersTable } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { ApiError } from "../lib/api-error";

/**
 * Book a token for a doctor
 * 
 * @param req Request object containing doctorId, userId, tokenDate, and optional description
 * @param res Response object
 * @param next Next function
 */
export const bookToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract data from request body
    const { doctorId, userId, tokenDate, description } = req.body;
    
    // Validate required fields
    if (!doctorId || !userId || !tokenDate) {
      throw new ApiError("Missing required fields: doctorId, userId, and tokenDate are required", 400);
    }
    
    // Parse the token date (assuming it's in ISO format)
    const bookingDate = new Date(tokenDate);
    
    // Format date to YYYY-MM-DD for database queries
    const formattedDate = bookingDate.toISOString().split('T')[0];
    
    // Check if doctor exists and is a doctor (would have an entry in doctorInfoTable)
    const doctor = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, doctorId)
    });
    
    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }
    
    // Check if this user ID exists in doctorInfoTable (confirming they are a doctor)
    const doctorInfo = await db.query.doctorInfoTable.findFirst({
      where: eq(doctorInfoTable.userId, doctorId)
    });
    
    if (!doctorInfo) {
      throw new ApiError("User is not registered as a doctor", 400);
    }
    
    // Check if user exists
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId)
    });
    
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    
    // Check doctor's availability for that day
    const availability = await db.query.doctorAvailabilityTable.findFirst({
      where: and(
        eq(doctorAvailabilityTable.doctorId, doctorId),
        eq(doctorAvailabilityTable.date, formattedDate)
      )
    });
    
    // If no availability record exists, doctor is not available for booking
    if (!availability) {
      throw new ApiError("Doctor is not available for booking on this date", 400);
    }
    
    // If doctor has stopped accepting tokens for that day
    if (availability.isStopped) {
      throw new ApiError("Doctor is not accepting appointments for this date", 400);
    }
    
    // Calculate available tokens
    const totalTokens = availability.totalTokenCount;
    const filledTokens = availability.filledTokenCount;
    const availableTokens = totalTokens - filledTokens;
    
    // If no tokens are available
    if (availableTokens <= 0) {
      throw new ApiError("No more appointments available for this date", 400);
    }
    
    console.log(`Doctor ${doctorId} on ${formattedDate}: Total: ${totalTokens}, Filled: ${filledTokens}, Available: ${availableTokens}`);
    
    // Use a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Get the next queue number (current filled tokens + 1)
      const nextQueueNumber = filledTokens + 1;
      
      // Insert new token record
      const [newToken] = await tx
        .insert(tokenInfoTable)
        .values({
          doctorId: doctorId,
          userId: userId,
          tokenDate: formattedDate,
          queueNum: nextQueueNumber,
          description: description || null,
          createdAt: new Date().toISOString().split('T')[0]
        })
        .returning();
      
      // Update doctor availability by incrementing the filled token count
      await tx
        .update(doctorAvailabilityTable)
        .set({
          filledTokenCount: filledTokens + 1
        })
        .where(eq(doctorAvailabilityTable.id, availability.id));
      
      // Return success response
      return res.status(201).json({
        message: "Token booked successfully",
        token: {
          id: newToken.id,
          doctorId: newToken.doctorId,
          userId: newToken.userId,
          tokenDate: newToken.tokenDate,
          queueNum: newToken.queueNum,
          description: newToken.description
        },
        remainingTokens: availableTokens - 1
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor's availability for a specific date
 * 
 * @param req Request object containing doctorId, date, tokenCount, and optional isStopped flag
 * @param res Response object
 * @param next Next function
 */
export const updateDoctorAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract data from request body
    const { doctorId, date, tokenCount, isStopped, filledTokenCount, consultationsDone } = req.body;
    
    // Validate required fields
    if (!doctorId || !date || tokenCount === undefined) {
      throw new ApiError("Missing required fields: doctorId, date, and tokenCount are required", 400);
    }
    
    // Parse the date (assuming it's in ISO format)
    const availabilityDate = new Date(date);
    
    // Format date to YYYY-MM-DD for database queries
    const formattedDate = availabilityDate.toISOString().split('T')[0];
    
    // Check if doctor exists and is a doctor
    const doctor = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, doctorId)
    });
    
    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }
    
    const doctorInfo = await db.query.doctorInfoTable.findFirst({
      where: eq(doctorInfoTable.userId, doctorId)
    });
    
    if (!doctorInfo) {
      throw new ApiError("User is not registered as a doctor", 400);
    }
    
    // Check if doctor already has an availability record for this date
    const existingAvailability = await db.query.doctorAvailabilityTable.findFirst({
      where: and(
        eq(doctorAvailabilityTable.doctorId, doctorId),
        eq(doctorAvailabilityTable.date, formattedDate)
      )
    });
    
    // Use a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      let availability;
      
      if (existingAvailability) {
        // If tokens are being reduced, make sure we don't reduce below already filled tokens
        if (tokenCount < existingAvailability.filledTokenCount) {
          throw new ApiError(`Cannot reduce token count below already filled tokens (${existingAvailability.filledTokenCount})`, 400);
        }
        
        // Update existing availability
        [availability] = await tx
          .update(doctorAvailabilityTable)
          .set({
            totalTokenCount: tokenCount,
            isStopped: isStopped !== undefined ? isStopped : existingAvailability.isStopped,
            filledTokenCount: filledTokenCount !== undefined ? filledTokenCount : existingAvailability.filledTokenCount,
            consultationsDone: consultationsDone !== undefined ? consultationsDone : existingAvailability.consultationsDone
          })
          .where(eq(doctorAvailabilityTable.id, existingAvailability.id))
          .returning();
          
        console.log(`Updated availability for doctor ${doctorId} on ${formattedDate}`);
      } else {
        // Create new availability record
        [availability] = await tx
          .insert(doctorAvailabilityTable)
          .values({
            doctorId: doctorId,
            date: formattedDate,
            totalTokenCount: tokenCount,
            filledTokenCount: 0,
            consultationsDone: consultationsDone !== undefined ? consultationsDone : 0,
            isStopped: isStopped !== undefined ? isStopped : false
          })
          .returning();
          
        console.log(`Created new availability for doctor ${doctorId} on ${formattedDate}`);
      }
      
      // Return success response
      return res.status(200).json({
        message: existingAvailability ? "Doctor availability updated successfully" : "Doctor availability created successfully",
        availability: {
          id: availability.id,
          doctorId: availability.doctorId,
          date: availability.date,
          totalTokenCount: availability.totalTokenCount,
          filledTokenCount: availability.filledTokenCount,
          consultationsDone: availability.consultationsDone,
          isStopped: availability.isStopped,
          availableTokens: availability.totalTokenCount - availability.filledTokenCount
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's availability for the next 3 days
 * 
 * @param req Request object containing doctorId
 * @param res Response object
 * @param next Next function
 */
export const getDoctorAvailabilityForNextDays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract doctor ID from request query
    const doctorId = req.query.doctorId as string;
    
    // Validate doctor ID
    if (!doctorId) {
      throw new ApiError("Missing required query parameter: doctorId", 400);
    }
    
    // Check if doctor exists and is a doctor
    const doctor = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, parseInt(doctorId))
    });
    
    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }
    
    const doctorInfo = await db.query.doctorInfoTable.findFirst({
      where: eq(doctorInfoTable.userId, parseInt(doctorId))
    });
    
    if (!doctorInfo) {
      throw new ApiError("User is not registered as a doctor", 400);
    }
    
    // Calculate dates for the next 3 days
    const today = new Date();
    const nextDays = [];
    
    for (let i = 0; i <= 2; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      nextDays.push(nextDay.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    
    // Get doctor's availability for each of the next 3 days
    const availabilityResults = await Promise.all(
      nextDays.map(async (date) => {
        const availability = await db.query.doctorAvailabilityTable.findFirst({
          where: and(
            eq(doctorAvailabilityTable.doctorId, parseInt(doctorId)),
            eq(doctorAvailabilityTable.date, date)
          )
        });
        
        return {
          date,
          availability: availability ? {
            id: availability.id,
            doctorId: availability.doctorId,
            date: availability.date,
            totalTokenCount: availability.totalTokenCount,
            filledTokenCount: availability.filledTokenCount,
            consultationsDone: availability.consultationsDone,
            isStopped: availability.isStopped,
            availableTokens: availability.totalTokenCount - availability.filledTokenCount
          } : null
        };
      })
    );
    
    // Return the availability for the next 3 days
    res.status(200).json({
      message: "Doctor availability for the next 3 days retrieved successfully",
      doctorId: parseInt(doctorId),
      availabilities: availabilityResults
    });
  } catch (error) {
    next(error);
  }
};
