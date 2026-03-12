import { body, param } from 'express-validator';

export const createGroupValidator = [
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').optional().isString(),
];

export const groupIdParamValidator = [
  param('groupId').isUUID().withMessage('Invalid group ID'),
];
