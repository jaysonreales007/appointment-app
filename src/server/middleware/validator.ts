import { body, validationResult } from 'express-validator';

export const validateAppointment = [
  body('date').isDate(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('caseType').isIn(['corporate', 'family', 'civil', 'criminal', 'real_estate']),
  body('notes').optional().trim().escape()
]; 