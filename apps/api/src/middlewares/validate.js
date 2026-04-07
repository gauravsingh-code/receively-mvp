import { ValidationError } from '../utils/errors.js';

/**
 * Validation Middleware
 * Validates request data using Zod schemas
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(new ValidationError(error.message));
    }
  };
};
