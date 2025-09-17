import express from 'express';
import { 
  bookToken, 
  updateDoctorAvailability, 
  getDoctorAvailabilityForNextDays, 
  getMyUpcomingTokens, 
  getMyPastTokens,
  getHospitalTodaysTokens,
  getDoctorTodaysTokens,
  updateTokenStatus
} from './token.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/token/book
 * @desc    Book a token for a doctor
 * @access  Public
 */
router.post('/book', bookToken);

/**
 * @route   POST /api/token/doctor-availability
 * @desc    Update doctor's availability for a specific date
 * @access  Public
 */
router.post('/doctor-availability', updateDoctorAvailability);

/**
 * @route   GET /api/token/doctor-availability/next-days
 * @desc    Get doctor's availability for the next 3 days
 * @access  Public
 */
router.get('/doctor-availability/next-days', getDoctorAvailabilityForNextDays);

/**
 * @route   GET /api/token/my-tokens
 * @desc    Get current user's upcoming tokens
 * @access  Private - Requires authentication
 */
router.get('/my-tokens', verifyToken, getMyUpcomingTokens);

/**
 * @route   GET /api/token/my-past-tokens
 * @desc    Get current user's past tokens
 * @access  Private - Requires authentication
 */
router.get('/my-past-tokens', verifyToken, getMyPastTokens);

/**
 * @route   GET /api/token/hospital-today
 * @desc    Get today's tokens for all doctors in a hospital (hospital admin view)
 * @access  Private - Requires authentication (hospital admin only)
 */
router.get('/hospital-today', verifyToken, getHospitalTodaysTokens);

/**
 * @route   GET /api/token/doctor-today/:doctorId
 * @desc    Get today's tokens for a specific doctor
 * @access  Private - Requires authentication
 */
router.get('/doctor-today/:doctorId', verifyToken, getDoctorTodaysTokens);

/**
 * @route   PATCH /api/token/:id/status
 * @desc    Update token status
 * @access  Private - Requires authentication
 */
router.patch('/:id/status', verifyToken, updateTokenStatus);

export default router;
