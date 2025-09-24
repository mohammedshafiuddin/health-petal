import { NextFunction, Request, Response } from "express";
import { db } from "../db/db_index";
import {
  tokenInfoTable,
  doctorInfoTable,
  doctorAvailabilityTable,
  usersTable,
  hospitalEmployeesTable,
  doctorSpecializationsTable,
  specializationsTable,
  hospitalTable,
  offlineTokensTable,
  offlineTokensRelations
} from "../db/schema";import { eq, and, sql, desc, gte, inArray } from "drizzle-orm";
import { ApiError } from "../lib/api-error";
import { 
  UpcomingToken, 
  MyTokensResponse, 
  BookTokenPayload, 
  BookTokenResponse,
  PastToken,
  PastTokensResponse,
  HospitalTodaysTokensResponse,
  DoctorTokenSummary,
  DoctorTodaysTokensResponse,
  DoctorTodayToken
} from "shared-types";
import { DESIGNATIONS } from "../lib/const-strings";

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
    
    // Parse the date in a timezone-aware manner to avoid date shifting
    // Expect date in YYYY-MM-DD format from the frontend
    let formattedDate: string;
    
    if (tokenDate.includes('-')) {
      // Date is already in YYYY-MM-DD format (from dayjs or properly formatted date)
      formattedDate = tokenDate;
    } else {
      // Date might be in timestamp format, convert to YYYY-MM-DD
      const bookingDate = new Date(tokenDate);
      formattedDate = bookingDate.toISOString().split('T')[0];
    }
    
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
          createdAt: new Date().toISOString().split('T')[0],
          paymentId: Number(2) // Placeholder, to be updated after payment integration
        })
        .returning();
      
      // Update doctor availability by incrementing the filled token count
      await tx
        .update(doctorAvailabilityTable)
        .set({
          filledTokenCount: filledTokens + 1
        })
        .where(eq(doctorAvailabilityTable.id, availability.id));
      
      // Create response object using shared type
      const response: BookTokenResponse = {
        message: "Token booked successfully",
        token: {
          id: newToken.id,
          doctorId: newToken.doctorId,
          userId: newToken.userId,
          tokenDate: newToken.tokenDate,
          queueNumber: newToken.queueNum,
          description: newToken.description,
          createdAt: newToken.createdAt
        }
      };
      
      // Return success response
      return res.status(201).json(response);
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
    const { doctorId, date, tokenCount, isStopped, filledTokenCount, consultationsDone, isLeave } = req.body;
    console.log({doctorId, tokenCount, date, consultationsDone})
    
    
    // Validate required fields
    if (!doctorId || !date || tokenCount === undefined) {
      throw new ApiError("Missing required fields: doctorId, date, and tokenCount are required", 400);
    }
    
    // Parse the date in a timezone-aware manner to avoid date shifting
    // Expect date in YYYY-MM-DD format from the frontend
    let formattedDate: string;
    
    if (date.includes('-')) {
      // Date is already in YYYY-MM-DD format (from dayjs or properly formatted date)
      formattedDate = date;
    } else {
      // Date might be in timestamp format, convert to YYYY-MM-DD
      const availabilityDate = new Date(date);
      formattedDate = availabilityDate.toISOString().split('T')[0];
    }
    
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
            consultationsDone: consultationsDone !== undefined ? consultationsDone : existingAvailability.consultationsDone,
            isLeave: isLeave !== undefined ? isLeave : existingAvailability.isLeave
          })
          .where(eq(doctorAvailabilityTable.id, existingAvailability.id))
          .returning();
          
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
            isStopped: isStopped !== undefined ? isStopped : false,
            isLeave: isLeave !== undefined ? isLeave : false
          })
          .returning();
          
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
 * Get doctor's availability for the next 3 days or 30 days if full-month is true
 * 
 * @param req Request object containing doctorId and optional full-month query parameter
 * @param res Response object
 * @param next Next function
 */
export const getDoctorAvailabilityForNextDays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract doctor ID and full-month query parameter from request query
    const doctorId = req.query.doctorId as string;
    const fullMonth = req.query['full-month'] === 'true'; // Convert string to boolean
    
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
    
    // Determine how many days to fetch based on full-month parameter
    const daysCount = fullMonth ? 30 : 3;
    
    // Calculate dates for the specified number of days
    const today = new Date();
    const nextDays = [];
    
    for (let i = 0; i < daysCount; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      nextDays.push(nextDay.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    
    // Get doctor's availability for each of the next days
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
            availableTokens: availability.totalTokenCount - availability.filledTokenCount,
            isLeave: availability.isLeave,
            isPaused: availability.isPaused,
            pauseReason: availability.pauseReason ? availability.pauseReason : null
          } : null
        };
      })
    );
    
    // Return the availability for the requested number of days
    const message = fullMonth 
      ? "Doctor availability for the next 30 days retrieved successfully" 
      : "Doctor availability for the next 3 days retrieved successfully";
      
    res.status(200).json({
      message: message,
      doctorId: parseInt(doctorId),
      availabilities: availabilityResults
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all upcoming tokens for the current user
 * This endpoint returns only future tokens (today or later), not past ones
 * 
 * @param req Request object with authenticated user
 * @param res Response object
 * @param next Next function
 */
export const getMyUpcomingTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const userId = req.user.userId;
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // Query tokens for this user that are from today onwards
    const tokens = await db.query.tokenInfoTable.findMany({
      where: and(
        eq(tokenInfoTable.userId, userId),
        gte(tokenInfoTable.tokenDate, formattedToday)
      ),
      orderBy: [tokenInfoTable.tokenDate, tokenInfoTable.queueNum],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            mobile: true,
            profilePicUrl: true,
          }
        }
      }
    });
    
    // For each token, fetch the current consultation number from doctorAvailability
    const tokensWithConsultationNumbers = await Promise.all(tokens.map(async (token) => {
      // Get the doctor's availability for this token's date
      const availability = await db.query.doctorAvailabilityTable.findFirst({
        where: and(
          eq(doctorAvailabilityTable.doctorId, token.doctorId),
          eq(doctorAvailabilityTable.date, token.tokenDate)
        )
      });
      
      return {
        ...token,
        currentConsultationNumber: availability?.consultationsDone || 0
      };
    }));
    
    // Format the response with relevant token information
    const formattedTokens: UpcomingToken[] = tokensWithConsultationNumbers.map(token => ({
      id: token.id,
      tokenDate: token.tokenDate,
      queueNumber: token.queueNum,
      description: token.description,
      createdAt: token.createdAt,
      currentConsultationNumber: token.currentConsultationNumber,
      doctor: {
        id: token.doctor.id,
        name: token.doctor.name,
        mobile: token.doctor.mobile,
        profilePicUrl: token.doctor.profilePicUrl
      }
    }));
    
    const response: MyTokensResponse = {
      message: "Upcoming tokens retrieved successfully",
      tokens: formattedTokens
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all past tokens for the current user
 * This endpoint returns only past tokens (before today), not upcoming ones
 * 
 * @param req Request object with authenticated user
 * @param res Response object
 * @param next Next function
 */
export const getMyPastTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const userId = req.user.userId;
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // Query tokens for this user that are before today
    const tokens = await db.query.tokenInfoTable.findMany({
      where: and(
        eq(tokenInfoTable.userId, userId),
        sql`${tokenInfoTable.tokenDate} < ${formattedToday}`
      ),
      orderBy: [desc(tokenInfoTable.tokenDate), tokenInfoTable.queueNum],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            mobile: true,
            profilePicUrl: true,
          }
        }
      }
    });
    
    // Format the response with relevant token information
    const formattedTokens: PastToken[] = tokens.map(token => ({
      id: token.id,
      tokenDate: token.tokenDate,
      queueNumber: token.queueNum,
      description: token.description,
      createdAt: token.createdAt,
      // For past tokens, default to 'COMPLETED' for simplicity
      status: 'COMPLETED',
      doctor: {
        id: token.doctor.id,
        name: token.doctor.name,
        mobile: token.doctor.mobile,
        profilePicUrl: token.doctor.profilePicUrl
      }
    }));
    
    const response: PastTokensResponse = {
      message: "Past tokens retrieved successfully",
      tokens: formattedTokens
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's tokens for all doctors in a hospital (hospital admin view)
 * 
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const getHospitalTodaysTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the current user's ID from the request object (set by verifyToken middleware)
    const userId = req.user?.userId;

    
    if (!userId) {
      
      throw new ApiError("User not authenticated", 401);
    }
    
    // Find the hospital where the user is an admin
    const hospitalEmployee = await db.query.hospitalEmployeesTable.findFirst({
      where: eq(hospitalEmployeesTable.userId, userId),
    });
    
    if (!hospitalEmployee) {
      throw new ApiError("User is not associated with any hospital", 404);
    }
    
    const hospitalId = hospitalEmployee.hospitalId;
    
    // Get the hospital name
    const hospital = await db.query.hospitalTable.findFirst({
      where: eq(hospitalTable.id, hospitalId),
    });
    
    
    if (!hospital) {
      throw new ApiError("Hospital not found", 404);
    }
    
    // Get all doctors who work at this hospital
    const hospitalDoctors = await db.query.hospitalEmployeesTable.findMany({
      where: and(
        eq(hospitalEmployeesTable.hospitalId, hospitalId),
        eq(hospitalEmployeesTable.designation, DESIGNATIONS.DOCTOR)
    ),

    });
    
    
    // Extract doctor IDs
    const doctorIds = hospitalDoctors.map(doctor => doctor.userId);
    
    if (doctorIds.length === 0) {
      // Return empty response if no doctors in hospital
      const response: HospitalTodaysTokensResponse = {
        message: "No doctors found in this hospital",
        hospitalId,
        hospitalName: hospital.name,
        date: new Date().toISOString().split('T')[0],
        doctors: [],
      };
      
      return res.status(200).json(response);
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get doctor information with specializations and token summaries for each doctor
    const doctorSummaries: DoctorTokenSummary[] = [];
    
    // Process each doctor
    for (const doctorId of doctorIds) {
      // Get doctor details
      const doctor = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, doctorId),
      });
      
      if (!doctor) continue;
      
      // Get doctor specializations
      const doctorSpecializations = await db.query.doctorSpecializationsTable.findMany({
        where: eq(doctorSpecializationsTable.doctorId, doctorId),
        with: {
          specialization: true,
        },
      });
      
      const specializationNames = doctorSpecializations.map(spec => spec.specialization.name);
      
      // Get today's availability
      const availability = await db.query.doctorAvailabilityTable.findFirst({
        where: and(
          eq(doctorAvailabilityTable.doctorId, doctorId),
          eq(doctorAvailabilityTable.date, today)
        ),
      });
      
      // Get tokens for today with patient details
      const tokens = await db.query.tokenInfoTable.findMany({
        where: and(
          eq(tokenInfoTable.doctorId, doctorId),
          eq(tokenInfoTable.tokenDate, today)
        ),
        with: {
          user: true, // Include patient details
        },
        orderBy: tokenInfoTable.queueNum,
      });
      
      // Calculate token statistics
      const totalTokens = tokens.length;
      const completedTokens = availability?.consultationsDone || 0;
      const currentTokenNumber = availability ? availability.consultationsDone + 1 : null;
      const inProgressTokens = currentTokenNumber && currentTokenNumber <= totalTokens ? 1 : 0;
      const upcomingTokens = Math.max(0, totalTokens - completedTokens - inProgressTokens);
      
      // Format individual tokens for this doctor
      const individualTokens = tokens.map(token => {
        return {
          id: token.id,
          queueNumber: token.queueNum,
          patientId: token.userId,
          patientName: token.user.name,
          patientMobile: token.user.mobile,
          description: token.description
        };
      });
      
      // Add to summary with individual tokens
      doctorSummaries.push({
        id: doctorId,
        name: doctor.name,
        specializations: specializationNames,
        totalTokens,
        completedTokens,
        inProgressTokens,
        upcomingTokens,
        currentTokenNumber,
        tokens: individualTokens, // Include individual tokens
      });
    }
    
    // Create the response
    const response: HospitalTodaysTokensResponse = {
      message: "Today's tokens retrieved successfully",
      hospitalId,
      hospitalName: hospital.name,
      date: today,
      doctors: doctorSummaries,
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update token status
 * 
 * @param req Request object containing token ID and status
 * @param res Response object
 * @param next Next function
 */
export const updateTokenStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenId = parseInt(req.params.id);
    const { status, consultationNotes } = req.body;
    const userId = req.user?.userId;

    // Validate token ID
    if (isNaN(tokenId)) {
      throw new ApiError("Invalid token ID", 400);
    }

    // Validate required fields
    if (!status && !consultationNotes) {
      throw new ApiError("Status or consultation notes are required", 400);
    }

    // Validate status if provided
    const validStatuses = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      throw new ApiError("Invalid status. Must be one of: UPCOMING, IN_PROGRESS, COMPLETED, MISSED, CANCELLED", 400);
    }

    // Check if token exists
    const token = await db.query.tokenInfoTable.findFirst({
      where: eq(tokenInfoTable.id, tokenId),
    });

    if (!token) {
      throw new ApiError("Token not found", 404);
    }

    // Check if user is authorized to update this token
    // Either the user is the doctor for this token or a hospital admin
    const isDoctor = token.doctorId === userId;
    
    let isHospitalAdmin = false;
    if (!isDoctor) {
      // Check if user is a hospital admin where the doctor works
      const doctorInSameHospital = await db.query.hospitalEmployeesTable.findFirst({
        where: and(
          eq(hospitalEmployeesTable.userId, token.doctorId)
        ),
      });
      
      if (doctorInSameHospital) {
        const userHospital = await db.query.hospitalEmployeesTable.findFirst({
          where: and(
            eq(hospitalEmployeesTable.userId, userId),
            eq(hospitalEmployeesTable.hospitalId, doctorInSameHospital.hospitalId)
          ),
        });
        
        isHospitalAdmin = !!userHospital;
      }
    }
    
    if (!isDoctor && !isHospitalAdmin) {
      throw new ApiError("Not authorized to update this token", 403);
    }

    // Update token status
    const updateData: any = {};
    if (status) updateData.status = status;
    if (consultationNotes) updateData.consultationNotes = consultationNotes;

    const [updatedToken] = await db
      .update(tokenInfoTable)
      .set(updateData)
      .where(eq(tokenInfoTable.id, tokenId))
      .returning();

    // If status is being set to COMPLETED or MISSED, update doctor's consultation count
    if (status === 'COMPLETED' || status === 'MISSED') {
      // Get doctor's availability for this date
      const availability = await db.query.doctorAvailabilityTable.findFirst({
        where: and(
          eq(doctorAvailabilityTable.doctorId, token.doctorId),
          eq(doctorAvailabilityTable.date, token.tokenDate)
        ),
      });
      
      if (availability) {
        // Update consultationsDone count
        await db
          .update(doctorAvailabilityTable)
          .set({
            consultationsDone: availability.consultationsDone + 1
          })
          .where(eq(doctorAvailabilityTable.id, availability.id));
      }
    }

    return res.status(200).json({
      message: "Token updated successfully",
      token: updatedToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's tokens for a specific doctor
 * 
 * @param req Request object containing doctorId
 * @param res Response object
 * @param next Next function
 */
export const getDoctorTodaysTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    
    if (isNaN(doctorId)) {
      throw new ApiError("Invalid doctor ID", 400);
    }
    
    // Get current user ID (for authorization check)
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }
    
    // Check if the doctor exists
    const doctor = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, doctorId),
    });
    
    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user is authorized to view this doctor's tokens
    // Either the user is the doctor, or the user is a hospital admin where the doctor works
    let isAuthorized = doctorId === userId;
    
    if (!isAuthorized) {
      // Check if user is a hospital admin where the doctor works
      const userHospital = await db.query.hospitalEmployeesTable.findFirst({
        where: eq(hospitalEmployeesTable.userId, userId),
      });
      
      if (userHospital) {
        const doctorInSameHospital = await db.query.hospitalEmployeesTable.findFirst({
          where: and(
            eq(hospitalEmployeesTable.userId, doctorId),
            eq(hospitalEmployeesTable.hospitalId, userHospital.hospitalId)
          ),
        });
        
        isAuthorized = !!doctorInSameHospital;
      }
    }
    
    if (!isAuthorized) {
      throw new ApiError("Not authorized to view this doctor's tokens", 403);
    }
    
    // Get the doctor's availability for today
    const availability = await db.query.doctorAvailabilityTable.findFirst({
      where: and(
        eq(doctorAvailabilityTable.doctorId, doctorId),
        eq(doctorAvailabilityTable.date, today)
      ),
    });
    
    // Get all online tokens for the doctor for today
    const onlineTokens = await db.query.tokenInfoTable.findMany({
      where: and(
        eq(tokenInfoTable.doctorId, doctorId),
        eq(tokenInfoTable.tokenDate, today)
      ),
      with: {
        user: true,
      },
      orderBy: tokenInfoTable.queueNum,
    });

    // Get all offline tokens for the doctor for today
    const offlineTokens = await db.query.offlineTokensTable.findMany({
      where: and(
        eq(offlineTokensTable.doctorId, doctorId),
        eq(offlineTokensTable.date, today)
      ),
      orderBy: offlineTokensTable.tokenNum,
    });

    // Combine and sort all tokens
    const allTokens = [
      ...onlineTokens.map(token => ({
        type: 'online',
        id: token.id,
        queueNum: token.queueNum,
        patientId: token.userId,
        patientName: token.user.name,
        patientMobile: token.user.mobile,
        description: token.description,
      })),
      ...offlineTokens.map(token => ({
        type: 'offline',
        id: token.id,
        queueNum: token.tokenNum,
        patientId: null, // Offline tokens don't have a registered userId
        patientName: token.patientName,
        patientMobile: token.mobileNumber,
        description: token.description,
      })),
    ].sort((a, b) => a.queueNum - b.queueNum);
    
    // Current token number (consultation in progress)
    const currentTokenNumber = availability ? availability.consultationsDone + 1 : null;
    const completedTokens = availability?.consultationsDone || 0;
    
    // Format the tokens with patient information and status
    const formattedTokens: DoctorTodayToken[] = allTokens.map(token => {
      let status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
      
      if (token.queueNum < (currentTokenNumber || 0)) {
        status = 'COMPLETED';
      } else if (token.queueNum === currentTokenNumber) {
        status = 'IN_PROGRESS';
      } else {
        status = 'UPCOMING';
      }
      
      return {
        id: token.id,
        queueNumber: token.queueNum,
        patientId: token.patientId,
        patientName: token.patientName,
        patientMobile: token.patientMobile,
        description: token.description,
        status,
      };
    });
    
    // Create the response
    const response: DoctorTodaysTokensResponse = {
      message: "Doctor's today's tokens retrieved successfully",
      doctorId,
      doctorName: doctor.name,
      date: today,
      currentTokenNumber,
      totalTokens: allTokens.length,
      completedTokens,
      tokens: formattedTokens,
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create an offline token for a doctor (hospital admin only)
 * 
 * @param req Request object containing doctorId, userId, tokenDate, and optional description
 * @param res Response object
 * @param next Next function
 */
export const createOfflineToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientName, patientMobile:mobileNumber, date:tokenDate, symptoms:description } = req.body;
    const adminUserId = req.user?.userId; // User making the request (hospital admin)

    // Validate required fields
    if (!doctorId || !patientName || !mobileNumber || !tokenDate) {
      throw new ApiError("Missing required fields: doctorId, patientName, mobileNumber, and tokenDate are required", 400);
    }

    if (!adminUserId) {
      throw new ApiError("User not authenticated", 401);
    }

    // Parse the date in a timezone-aware manner to avoid date shifting
    // Expect date in YYYY-MM-DD format from the frontend
    let formattedDate: string;
    
    if (tokenDate.includes('-')) {
      // Date is already in YYYY-MM-DD format (from dayjs or properly formatted date)
      formattedDate = tokenDate;
    } else {
      // Date might be in timestamp format, convert to YYYY-MM-DD
      const bookingDate = new Date(tokenDate);
      formattedDate = bookingDate.toISOString().split('T')[0];
    }

    // --- Authorization Check: Ensure the requesting user is a hospital admin for the doctor's hospital ---
    const doctorHospitalEmployee = await db.query.hospitalEmployeesTable.findFirst({
      where: eq(hospitalEmployeesTable.userId, doctorId),
    });

    if (!doctorHospitalEmployee) {
      throw new ApiError("Doctor is not associated with any hospital", 404);
    }

    const adminHospitalEmployee = await db.query.hospitalEmployeesTable.findFirst({
      where: and(
        eq(hospitalEmployeesTable.userId, adminUserId),
        eq(hospitalEmployeesTable.hospitalId, doctorHospitalEmployee.hospitalId),
        eq(hospitalEmployeesTable.designation, DESIGNATIONS.HOSPITAL_ADMIN) // Ensure admin is a hospital admin
      ),
    });

    if (!adminHospitalEmployee) {
      throw new ApiError("Not authorized to create offline tokens for this doctor. Only hospital admins can create offline tokens for doctors in their hospital.", 403);
    }
    // --- End Authorization Check ---

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
    
    // Check doctor's availability for that day
    const availability = await db.query.doctorAvailabilityTable.findFirst({
      where: and(
        eq(doctorAvailabilityTable.doctorId, doctorId),
        eq(doctorAvailabilityTable.date, formattedDate)
      )
    });
    
    if (!availability) {
      throw new ApiError("Doctor is not available for booking on this date", 400);
    }
    
    if (availability.isStopped) {
      throw new ApiError("Doctor is not accepting appointments for this date", 400);
    }
    
    const totalTokens = availability.totalTokenCount;
    const filledTokens = availability.filledTokenCount;
    const availableTokens = totalTokens - filledTokens;
    
    if (availableTokens <= 0) {
      throw new ApiError("No more appointments available for this date", 400);
    }
    
    return await db.transaction(async (tx) => {
      const nextQueueNumber = filledTokens + 1;
      
      // Insert new offline token record
      const [newOfflineToken] = await tx
        .insert(offlineTokensTable)
        .values({
          doctorId: doctorId,
          patientName: patientName,
          mobileNumber: mobileNumber,
          date: formattedDate,
          tokenNum: nextQueueNumber,
          description: description || null,
          createdAt: new Date().toISOString().split('T')[0],
        })
        .returning();
      
      // Update doctor availability by incrementing the filled token count
      await tx
        .update(doctorAvailabilityTable)
        .set({
          filledTokenCount: filledTokens + 1
        })
        .where(eq(doctorAvailabilityTable.id, availability.id));
      
      // Create response object
      const response = {
        message: "Offline token created successfully",
        token: {
          id: newOfflineToken.id,
          doctorId: newOfflineToken.doctorId,
          patientName: newOfflineToken.patientName,
          mobileNumber: newOfflineToken.mobileNumber,
          tokenDate: newOfflineToken.date,
          queueNumber: newOfflineToken.tokenNum,
          description: newOfflineToken.description,
          createdAt: newOfflineToken.createdAt
        }
      };
      
      return res.status(201).json(response);
    });
  } catch (error) {
    next(error);
  }
};