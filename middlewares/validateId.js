import mongoose from "mongoose";
import { controllerDecorator } from "../helpers/controllerDecorator.js";
import HttpError from "../helpers/HttpError.js";

export const validateId = controllerDecorator((req, res, next) => {
  const isValid = mongoose.isValidObjectId(req.params.id);
  if (!isValid) {
    throw HttpError(400, "Id is not valid");
  }
  next();
});
