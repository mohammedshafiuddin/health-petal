import { Request, Response, NextFunction } from "express";
import { db } from "../db/db_index";
import { usersTable, userInfoTable, userRolesTable, roleInfoTable, hospitalEmployeesTable, doctorInfoTable, doctorSpecializationsTable, doctorSecretariesTable, hospitalTable, tokenInfoTable } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq, and, or, inArray, isNotNull, ne, gte, sql } from "drizzle-orm";
import { ApiError } from "../lib/api-error";
import jwt from "jsonwebtoken";
import roleManager, { ROLE_NAMES, defaultRole } from "../lib/roles-manager";
import { DESIGNATIONS } from "../lib/const-strings";
import { imageUploadS3 } from '../lib/s3-client';
import fs from 'fs';
import dayjs from 'dayjs';

/**
 * Register a new user
 */
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, mobile, address, password, role, username } = req.body;
    // Parse and log profilePic
    let profilePicUrl = null;
    if (req.file) {
      // Upload to S3 using buffer
      const key = `profile-pics/${Date.now()}_${req.file.originalname}`;
      profilePicUrl = await imageUploadS3(req.file.buffer, req.file.mimetype, key);
    } 

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      throw new ApiError("Missing required fields", 400);
    }

    // Check if user with the same email, mobile, or username already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: (users) => {
        return or(
          eq(users.email, email), 
          eq(users.mobile, mobile),
          username ? eq(users.username, username) : undefined
        );
      },
    });

    if (existingUser) {
      throw new ApiError("User with this email, mobile, or username already exists", 409);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create a new user
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name,
          email,
          mobile,
          address,
          username: username,
          joinDate: new Date().toISOString(),
          profilePicUrl // Save the profilePic URL in the user table
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to create user");
      }

      // Create user info with password
      await tx.insert(userInfoTable).values({
        userId: newUser.id,
        password: hashedPassword,
        isSuspended: false,
        activeTokenVersion: 1,
      });

      // Assign role - use specified role or default to GENERAL_USER if not provided
      const roleToAssign = role || defaultRole;
      
      const roleInfo = await tx.query.roleInfoTable.findFirst({
        where: (roles) => eq(roles.name, roleToAssign),
      });

      if (roleInfo) {
        await tx.insert(userRolesTable).values({
          userId: newUser.id,
          roleId: roleInfo.id,
          addDate: new Date().toISOString(),
        });
      }

      // Return user data
      return res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          mobile: newUser.mobile,
          profilePicUrl: newUser.profilePicUrl, // Include profilePic URL in the response
        },
        message: "User created successfully"
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to create user account", 500));
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { login, password, useUsername } = req.body;
    
    // Validate required fields
    if (!login || !password) {
      throw new ApiError("Missing credentials", 400);
    }

    // Find user based on login method
    let user;
    if (useUsername) {
      // If useUsername flag is set, only check username
      user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.username, login),
        with: {
          userInfo: true
        }
      });
    } else {
      // Mobile number login
      user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.mobile, login),
        with: {
          userInfo: true
        }
      });
    }

    if (!user || !user.userInfo) {
      throw new ApiError(
        useUsername ? "Invalid username or password" : "Invalid mobile number or password", 
        401
      );
    }

    // Check if user is suspended
    if (user.userInfo.isSuspended) {
      throw new ApiError("Account has been suspended", 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.userInfo.password);
    if (!isPasswordValid) {
      throw new ApiError("Invalid credentials", 401);
    }

    // Get user roles
    // Since we don't have the proper relations set up yet for roles,
    // we'll query the role information directly
    const userRolesData = await db
      .select({
        roleId: userRolesTable.roleId
      })
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, user.id));
      
    const roleIds = userRolesData.map(ur => ur.roleId);
    
    let roleNames: string[] = [];
    if (roleIds.length > 0) {
      const roles = await db
        .select({
          name: roleInfoTable.name
        })
        .from(roleInfoTable)
        .where(
          roleIds.length > 1 
            ? inArray(roleInfoTable.id, roleIds) 
            : eq(roleInfoTable.id, roleIds[0])
        );
      
      roleNames = roles.map(r => r.name);
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      roles: roleNames,
      tokenVersion: user.userInfo.activeTokenVersion
    };

    // Sign token with secret key and set expiration
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Prepare response object
    const responseObj = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        roles: roleNames
      },
      token,
      message: "Login successful"
    };
  

    // Return user data with token
    return res.status(200).json(responseObj);
  } catch (error) {
    console.error("Login error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to authenticate user", 500));
  }
};

/**
 * Add a business user (no email/mobile, only username/password/role/name)
 */
export const addBusinessUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, username, password, role, specializationIds, consultationFee, dailyTokenCount, hospitalId } = req.body;

    // Validate required fields
    if (!name || !username || !password || !role) {
      throw new ApiError("Missing required fields", 400);
    }

    // If role is doctor, validate specializationIds and other doctor-specific fields
    if (role === ROLE_NAMES.DOCTOR) {
      if (!specializationIds || !specializationIds.length) {
        throw new ApiError("Specializations are required for doctors", 400);
      }
      
      if (consultationFee === undefined || consultationFee === null) {
        throw new ApiError("Consultation fee is required for doctors", 400);
      }
      
      if (dailyTokenCount === undefined || dailyTokenCount === null) {
        throw new ApiError("Daily token count is required for doctors", 400);
      }
      
    }

    // Check if valid role using the role manager
    const businessRoles = await roleManager.getBusinessRoles();
    const validRoles = businessRoles.map(r => r.name);
    
    if (!validRoles.includes(role)) {
      throw new ApiError(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        400
      );
    }

    // Check if user with the same username already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: (users) => eq(users.username, username),
    });

    if (existingUser) {
      throw new ApiError("User with this username already exists", 409);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle profilePic upload
    let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = await imageUploadS3(
        req.file.buffer,
        req.file.mimetype,
        `profile-pics/${Date.now()}_${req.file.originalname}`
      );
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create a new user with username and a dummy mobile number (no email required)
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name,
          username: username,  // Store username directly in the username field
          mobile: username + '_mobile',  // Dummy mobile for uniqueness
          joinDate: new Date().toISOString(),
          profilePicUrl // Save the profilePic URL in the user table
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to create business user");
      }

      // Create user info with password
      await tx.insert(userInfoTable).values({
        userId: newUser.id,
        password: hashedPassword,
        isSuspended: false,
        activeTokenVersion: 1,
      });

      // Find the role using role manager
      let roleInfo = await roleManager.getRoleByName(role);

      if (!roleInfo) {
        throw new Error("Role not found");
      }

      // Assign role to user
      await tx.insert(userRolesTable).values({
        userId: newUser.id,
        roleId: roleInfo.id,
        addDate: new Date().toISOString(),
      });

      // If user is a doctor, create doctor info and specializations
      if (role === ROLE_NAMES.DOCTOR) {
        // Create doctor info
        const [doctorInfo] = await tx
          .insert(doctorInfoTable)
          .values({
            userId: newUser.id,
            dailyTokenCount: dailyTokenCount || 0,
            consultationFee: consultationFee || 0,
          })
          .returning();

        if (!doctorInfo) {
          throw new Error("Failed to create doctor info");
        }
        
        // Add doctor specializations
        if (specializationIds && specializationIds.length > 0) {
          await tx.insert(doctorSpecializationsTable).values(
            specializationIds.split(',').map((item:string) => item.trim()).map((specializationId: number) => ({
              doctorId: newUser.id, // Use user ID directly since doctorSpecializationsTable now references usersTable
              specializationId,
            }))
          );
        }
        
        if(hospitalId) {

          // Add doctor to the hospital as an employee with DOCTOR designation
          await tx.insert(hospitalEmployeesTable).values({
            hospitalId,
            userId: newUser.id,
            designation: DESIGNATIONS.DOCTOR
          });
        }
      }

      // If role is hospital admin, allow optional hospitalId
      if (role === ROLE_NAMES.HOSPITAL_ADMIN && hospitalId) {
        await tx.insert(hospitalEmployeesTable).values({
          hospitalId,
          userId: newUser.id,
          designation: DESIGNATIONS.HOSPITAL_ADMIN,
        });
      }

      // Return user data
      return res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          username,
          role,
        },
        message: "Business user created successfully"
      });
    });
};

/**
 * Get all business users
 * Business users are identified by having roles other than 'admin' or 'gen_user'
 */
export const getBusinessUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all users with their roles
    const allUsersWithRoles = await Promise.all(
      (await db.query.usersTable.findMany()).map(async (user) => {
        // Get the user's role
        const userRole = await db.query.userRolesTable.findFirst({
          where: (userRoles) => eq(userRoles.userId, user.id)
        });

        // Get role info if userRole exists using the role manager
        let roleName = 'Unknown';
        if (userRole) {
          const roleInfo = await roleManager.getRoleById(userRole.roleId);
          roleName = roleInfo?.name || 'Unknown';
        }

        return {
          user,
          roleName
        };
      })
    );
    
    // Get business roles from the role manager
    const businessRoles = await roleManager.getBusinessRoles();
    const businessRoleNames = businessRoles.map(role => role.name);
    
    // Filter business users based on role
    const businessUsers = allUsersWithRoles.filter(
      ({ roleName }) => businessRoleNames.includes(roleName)
    );

    // Format the response
    const formattedUsers = businessUsers.map(({ user, roleName }) => {
      return {
        id: user.id,
        name: user.name,
        username: user.username || '', // Use the username field directly
        role: roleName,
        joinDate: user.joinDate
      };
    });

    return res.status(200).json(formattedUsers);

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Get business users error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to fetch business users", 500));
  }
};

/**
 * Get potential hospital admins (users with hospital admin role who are not already assigned to a hospital)
 */
export const getPotentialHospitalAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all users with username and include their roles directly using relations
    const usersWithRoles = await db.query.usersTable.findMany({
      where: (users) => isNotNull(users.username),
      with: {
        roles: {
          with: {
            role: true
          }
        }
      }
    });
    
    // Get all hospital employees
    const hospitalEmployees = await db.query.hospitalEmployeesTable.findMany();
    const employeeUserIds = new Set(hospitalEmployees.map(employee => employee.userId));
    
    // Transform users data to include role names directly
    const usersWithRoleNames = usersWithRoles.map(user => {
      // Extract role names from the relations
      const roleNames = user.roles.map(userRole => userRole.role.name);
      
      return {
        ...user,
        roles: roleNames
      };
    });


    // Filter for:
    // 1. Users with hospital_admin role
    // 2. Users not already assigned to a hospital
    const potentialAdmins = usersWithRoleNames.filter(user => 
      user.roles.includes(ROLE_NAMES.HOSPITAL_ADMIN) && 
      !employeeUserIds.has(user.id)
    );
    

    // Format the response
    const formattedAdmins = potentialAdmins.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username || '',
      roles: user.roles // Direct access to roles array
    }));

    return res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error("Get potential hospital admins error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to fetch potential hospital admins", 500));
  }
};

/**
 * Get potential doctor employees
 * @description Retrieves users with doctor role who are not yet assigned to a hospital
 */
export const getPotentialDoctorEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all users with username and include their roles directly using relations
    const usersWithRoles = await db.query.usersTable.findMany({
      where: (users) => isNotNull(users.username),
      with: {
        roles: {
          with: {
            role: true
          }
        }
      }
    });
    
    // Get all hospital employees
    const hospitalEmployees = await db.query.hospitalEmployeesTable.findMany();
    const employeeUserIds = new Set(hospitalEmployees.map(employee => employee.userId));
    
    // Transform users data to include role names directly
    const usersWithRoleNames = usersWithRoles.map(user => {
      // Extract role names from the relations
      const roleNames = user.roles.map(userRole => userRole.role.name);
      
      return {
        ...user,
        roles: roleNames
      };
    });

    // Filter for:
    // 1. Users with doctor role
    // 2. Users not already assigned to a hospital
    const potentialDoctors = usersWithRoleNames.filter(user => 
      user.roles.includes(ROLE_NAMES.DOCTOR) && 
      !employeeUserIds.has(user.id)
    );
    
    // Format the response
    const formattedDoctors = potentialDoctors.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username || '',
      roles: user.roles // Direct access to roles array
    }));

    return res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error("Get potential doctor employees error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to fetch potential doctor employees", 500));
  }
};

/**
 * Get user by ID
 * @description Retrieves user information including role and specializations if user is a doctor
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {

    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      throw new ApiError("Invalid user ID", 400);
    }

    // Get user with roles
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
      with: {
        roles: {
          with: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Extract role names
    const roleNames = user.roles.map(r => r.role.name);

    // Check if user is a doctor
    const isDoctor = roleNames.includes(ROLE_NAMES.DOCTOR);
    
    // Generate signed URL for profilePic if present
    let signedProfilePicUrl = null;
    if (user.profilePicUrl) {
      const { generateSignedUrlFromS3Url } = await import("../lib/s3-client");
      signedProfilePicUrl = await generateSignedUrlFromS3Url(user.profilePicUrl);
    }

    // Format base user response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      address: user.address,
      profilePicUrl: signedProfilePicUrl,
      joinDate: user.joinDate,
      role: roleNames[0], // Primary role
      roles: roleNames,
    };

    // If user is a doctor, get additional info
    if (isDoctor) {
      // Get doctor info
      const doctorInfo = await db.query.doctorInfoTable.findFirst({
        where: (docs) => eq(docs.userId, userId)
      });
      const hospital = await db.select({
        hospitalName: hospitalTable.name
      }).from(hospitalEmployeesTable)
      .innerJoin(hospitalTable, eq(hospitalEmployeesTable.hospitalId, hospitalTable.id))
      .where(eq(hospitalEmployeesTable.userId, user.id));

      if (doctorInfo) {
        // Get specializations
        const specializations = await db.query.doctorSpecializationsTable.findMany({
          where: (specs) => eq(specs.doctorId, user.id), // Use user ID directly
          with: {
            specialization: true
          }
        });

        // Return user with doctor info
        return res.status(200).json({
          ...userResponse,
          doctorId: doctorInfo.id,
          qualifications: doctorInfo.qualifications,
          dailyTokenCount: doctorInfo.dailyTokenCount,
          consultationFee: doctorInfo.consultationFee,
          hospital: hospital[0].hospitalName,
          specializations: specializations.map(s => ({
            id: s.specialization.id,
        profilePicUrl: null, // Placeholder for signed URL
            description: s.specialization.description
          }))
        });
      }
    }
    
    // Return basic user info if not a doctor or no doctor info found
    return res.status(200).json(userResponse);
};

/**
 * Update user information
 * @description Updates user's basic information and doctor-specific details if applicable
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const { name, email, mobile, address, profilePicUrl, password, qualifications, specializationIds, consultationFee, dailyTokenCount } = req.body;
    
    if (isNaN(userId)) {
      throw new ApiError("Invalid user ID", 400);
    }

    // Verify user exists
    const existingUser = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
      with: {
        roles: {
          with: {
            role: true
          }
        },
        userInfo: true
      }
    });

    if (!existingUser) {
      throw new ApiError("User not found", 404);
    }

    // Check if user is trying to update to an email or mobile that already exists
    // Only perform this check if email or mobile are being updated to different values
    const emailChanged = email !== undefined && email !== null && email !== existingUser.email;
    const mobileChanged = mobile !== undefined && mobile !== null && mobile !== existingUser.mobile;
    
    if (emailChanged || mobileChanged) {
      // Build query conditions for checking conflicts
      const conflictConditions: any[] = [];
      
      if (emailChanged) {
        conflictConditions.push(eq(usersTable.email, email));
      }
      
      if (mobileChanged) {
        conflictConditions.push(eq(usersTable.mobile, mobile));
      }
      
      // Check for conflicts with other users
      if (conflictConditions.length > 0) {
        const conflictingUser = await db.query.usersTable.findFirst({
          where: (users) => {
            return and(
              ne(users.id, userId),
              conflictConditions.length > 1 ? or(...conflictConditions) : conflictConditions[0]
            );
          },
        });

        if (conflictingUser) {
          throw new ApiError("Email or mobile number already in use", 409);
        }
      }
    }

    // Start transaction
    return await db.transaction(async (tx) => {
      // Prepare update object with only provided fields
      const updateData: Record<string, any> = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (mobile) updateData.mobile = mobile;
      if (address !== undefined) updateData.address = address;
      if (profilePicUrl) updateData.profilePicUrl = profilePicUrl;

      // Update password if provided
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        await tx
          .update(userInfoTable)
          .set({ 
            password: hashedPassword,
            // Increment token version to invalidate existing tokens
            activeTokenVersion: existingUser.userInfo?.activeTokenVersion ? 
              existingUser.userInfo.activeTokenVersion + 1 : 
              1
          })
          .where(eq(userInfoTable.userId, userId));
      }

      // Handle profilePic upload
      if (req.file) {
        
        updateData.profilePicUrl = await imageUploadS3(
          req.file.buffer,
          req.file.mimetype,
          `profile-pics/${Date.now()}_${req.file.originalname}`
        );
      }

      // Update user in the database
      await tx.update(usersTable).set(updateData).where(eq(usersTable.id, userId));

      // Check if user is a doctor
      const isDoctor = existingUser.roles.some(role => role.role.name === ROLE_NAMES.DOCTOR);
      
      if (isDoctor) {
        
        // Get doctor info
        const doctorInfo = await tx.query.doctorInfoTable.findFirst({
          where: (doctors) => eq(doctors.userId, userId)
        });

        if (!doctorInfo) {
          throw new ApiError("Doctor information not found", 404);
        }

        // Update doctor qualifications if provided
        const doctorUpdateFields: Record<string, any> = {};
        
        if (qualifications !== undefined) {
          doctorUpdateFields.qualifications = qualifications;
        }
        
        if (consultationFee !== undefined) {
          doctorUpdateFields.consultationFee = consultationFee;
        }
        
        if (dailyTokenCount !== undefined) {
          doctorUpdateFields.dailyTokenCount = dailyTokenCount;
        }
        
        // Only update if there are fields to update
        if (Object.keys(doctorUpdateFields).length > 0) {
          await tx
            .update(doctorInfoTable)
            .set(doctorUpdateFields)
            .where(eq(doctorInfoTable.id, doctorInfo.id));
        }

        // Update specializations if provided
        if (specializationIds && Array.isArray(specializationIds) && specializationIds.length > 0) {
          // First delete existing specializations
          await tx
            .delete(doctorSpecializationsTable)
            .where(eq(doctorSpecializationsTable.doctorId, userId)); // Use userId directly

          // Then insert new specializations
          await tx.insert(doctorSpecializationsTable).values(
            specializationIds.map((specializationId: number) => ({
              doctorId: userId, // Use userId directly
              specializationId,
            }))
          );
        }
      }

      // Fetch updated user data
      const updatedUser = await getUserData(tx, userId);
      
      return res.status(200).json({
        ...updatedUser,
        message: "User updated successfully"
      });
    });
  } catch (error) {
    console.error("Update user error:", error);
    next(error instanceof ApiError ? error : new ApiError("Failed to update user", 500));
  }
};

/**
 * Helper function to get complete user data including role and specializations
 */
async function getUserData(db: any, userId: number) {
  // Get user with roles
  const user = await db.query.usersTable.findFirst({
    where: (users: any) => eq(users.id, userId),
    with: {
      roles: {
        with: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Extract role names
  const roleNames = user.roles.map((r: any) => r.role.name);

  // Check if user is a doctor
  const isDoctor = roleNames.includes(ROLE_NAMES.DOCTOR);
  
  // Format base user response
  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    username: user.username,
    address: user.address,
    profilePicUrl: user.profilePicUrl,
    joinDate: user.joinDate,
    role: roleNames[0], // Primary role
    roles: roleNames,
  };

  // If user is a doctor, get additional info
  if (isDoctor) {
    // Get doctor info
    const doctorInfo = await db.query.doctorInfoTable.findFirst({
      where: (docs: any) => eq(docs.userId, userId)
    });

    if (doctorInfo) {
      // Get specializations
      const specializations = await db.query.doctorSpecializationsTable.findMany({
        where: (specs: any) => eq(specs.doctorId, doctorInfo.id),
        with: {
          specialization: true
        }
      });

      // Return user with doctor info
      return {
        ...userResponse,
        doctorId: doctorInfo.id,
        qualifications: doctorInfo.qualifications,
        dailyTokenCount: doctorInfo.dailyTokenCount,
        specializations: specializations.map((s: any) => ({
          id: s.specialization.id,
          name: s.specialization.name,
          description: s.specialization.description
        }))
      };
    }
  }

  // Return basic user info if not a doctor or no doctor info found
  return userResponse;
}

/**
 * Get user responsibilities
 * Returns information about what the user is responsible for,
 * including which hospital they are an admin for, if applicable
 * and which doctors they are a secretary for
 */
export const getUserResponsibilities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId) || req.user?.userId;
    
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }
    
    // Check if the user is an admin for any hospital
    const hospitalAdmin = await db.query.hospitalEmployeesTable.findFirst({
      where: (he) => 
        and(
          eq(he.userId, userId),
          eq(he.designation, DESIGNATIONS.HOSPITAL_ADMIN)
        )
    });
    
    // Check if the user is a secretary for any doctors
    const secretaryFor = await db
      .select({ doctorId: doctorSecretariesTable.doctorId })
      .from(doctorSecretariesTable)
      .where(eq(doctorSecretariesTable.secretaryId, userId));
    
    const response = {
      hospitalAdminFor: hospitalAdmin ? hospitalAdmin.hospitalId : null,
      secretaryFor: secretaryFor.length > 0 ? secretaryFor.map(item => item.doctorId) : []
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user responsibilities:', error);
    next(error instanceof ApiError ? error : new ApiError('Failed to get user responsibilities', 500));
  }
};

/**
 * Get user's upcoming tokens
 * Returns a list of upcoming appointments for the user
 */
export const getUpcomingTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }
    
    // Query the database for upcoming tokens
    const upcomingTokens = await db
      .select({
        id: tokenInfoTable.id,
        doctorId: tokenInfoTable.doctorId,
        tokenDate: tokenInfoTable.tokenDate,
        queueNum: tokenInfoTable.queueNum,
        description: tokenInfoTable.description,
        status: tokenInfoTable.status,
        createdAt: tokenInfoTable.createdAt,
        doctor: {
          id: usersTable.id,
          name: usersTable.name,
          profilePicUrl: usersTable.profilePicUrl
        },
        hospital: {
          name: hospitalTable.name
        }
      })
      .from(tokenInfoTable)
      .innerJoin(usersTable, eq(tokenInfoTable.doctorId, usersTable.id))
      .innerJoin(hospitalEmployeesTable, eq(tokenInfoTable.doctorId, hospitalEmployeesTable.userId))
      .innerJoin(hospitalTable, eq(hospitalEmployeesTable.hospitalId, hospitalTable.id))
      .where(
        and(
          eq(tokenInfoTable.userId, userId),
          eq(tokenInfoTable.status, 'UPCOMING'),
          gte(tokenInfoTable.tokenDate, sql`CURRENT_DATE`)
        )
      )
      .orderBy(tokenInfoTable.tokenDate);
    
    // Transform the data to match our UpcomingAppointment interface
    const upcomingAppointments = upcomingTokens.map(token => ({
      id: token.id,
      doctorName: token.doctor.name,
      doctorImageUrl: token.doctor.profilePicUrl || undefined,
      date: token.tokenDate.toString().split('T')[0],
      hospital: token.hospital.name,
      queueNumber: token.queueNum,
      status: token.status
    }));
    
    return res.status(200).json({
      appointments: upcomingAppointments
    });
  } catch (error) {
    console.error('Error getting upcoming tokens:', error);
    next(error instanceof ApiError ? error : new ApiError('Failed to get upcoming tokens', 500));
  }
};

