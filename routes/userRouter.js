import express from "express";
import {
  getAllUsers,
  getCurrentUser,
  verifyUser,
  sendVerifyEmail,
  loginUser,
  logoutUser,
  modifyUserSubscription,
  registerUser,
  uploadAvatar,
  getUserAvatar,
} from "../controllers/usersControllers.js";
import validateBody from "../helpers/validateBody.js";
import {
  createUserSchema,
  loginUserSchema,
  userSubscriptionSchema,
  validateUserEmailSchema,
} from "../schemas/usersSchemas.js";
import authMiddleware from "../middlewares/auth.js";
import uploadMiddleware from "../middlewares/upload.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/current", authMiddleware, getCurrentUser);
userRouter.get("/avatars", authMiddleware, getUserAvatar);
userRouter.post(
  "/verify",
  validateBody(validateUserEmailSchema),
  sendVerifyEmail
);
userRouter.get("/verify/:verificationToken", verifyUser);
userRouter.post("/register", validateBody(createUserSchema), registerUser);
userRouter.post("/login", validateBody(loginUserSchema), loginUser);
userRouter.post("/logout", authMiddleware, logoutUser);
userRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  uploadAvatar
);
userRouter.patch(
  "/:id",
  validateBody(userSubscriptionSchema),
  modifyUserSubscription
);

export default userRouter;
