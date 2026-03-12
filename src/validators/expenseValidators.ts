import { body, param } from 'express-validator';

export const addExpenseValidator = [
  body('group_id').isUUID().withMessage('Group ID is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paid_by').isUUID().withMessage('Paid_by user ID is required'),
  body('splits').isArray({ min: 1 }).withMessage('At least one split is required'),
  body('splits.*.user_id').isUUID().withMessage('Split user ID must be valid'),
  body('splits.*.amount').isNumeric().withMessage('Split amount must be numeric'),
  body('splits.*.weight').optional().isNumeric(),
];

export const groupIdParamValidator = [
  param('groupId').isUUID().withMessage('Invalid group ID'),
];
