import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { controllerDecorator } from "../helpers/controllerDecorator.js";

export const authMiddleware = controllerDecorator(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    throw HttpError(401, "Not authorized");
  }

  const [bearer, token] = authorizationHeader.split(" ");
  if (bearer !== "Bearer") {
    throw HttpError(401, "Not authorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user === null || user.token !== token) {
      throw HttpError(401, "Not authorized");
    }
    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
});

export default authMiddleware;
