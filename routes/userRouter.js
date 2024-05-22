import express from "express";
import {
  getAllUsers,
  getCurrentUser,
  loginUser,
  logoutUser,
  modifyUserSubscription,
  registerUser,
} from "../controllers/usersControllers.js";
import validateBody from "../helpers/validateBody.js";
import {
  createUserSchema,
  loginUserSchema,
  userSubscriptionSchema,
} from "../schemas/usersSchemas.js";
import authMiddleware from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/current", authMiddleware, getCurrentUser);
userRouter.post("/register", validateBody(createUserSchema), registerUser);
userRouter.post("/login", validateBody(loginUserSchema), loginUser);
userRouter.post("/logout", authMiddleware, logoutUser);
userRouter.patch(
  "/:id",
  validateBody(userSubscriptionSchema),
  modifyUserSubscription
);

export default userRouter;
