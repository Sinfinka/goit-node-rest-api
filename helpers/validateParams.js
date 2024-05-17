import HttpError from "./HttpError.js";

export const validateParams = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      next(HttpError(400, error.message));
    }
    next();
  };
  return func;
};

export default validateParams;
