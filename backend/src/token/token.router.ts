import express from 'express';
import { bookToken, updateDoctorAvailability, getDoctorAvailabilityForNextDays } from './token.controller';

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

export default router;
