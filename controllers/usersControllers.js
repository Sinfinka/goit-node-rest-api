import HttpError from "../helpers/HttpError.js";
import { controllerDecorator } from "../helpers/controllerDecorator.js";
import {
  addUser,
  changeUser,
  findUser,
  userList,
} from "../services/usersServices.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getAllUsers = controllerDecorator(async (req, res, next) => {
  const users = await userList();
  if (!users.length) {
    throw HttpError(404, "Not found");
  }
  res.status(200).send(users);
});

export const getCurrentUser = (req, res, next) => {
  const { email, subscription } = req.user;
  res.send({ email, subscription });
};

export const registerUser = controllerDecorator(async (req, res) => {
  const { email, password } = req.body;
  const emailInLowerCase = email.toLowerCase();
  const existUser = await findUser({ email: emailInLowerCase });
  const passwordHash = await bcrypt.hash(password, 10);
  const userData = { email: emailInLowerCase, password: passwordHash };
  if (existUser !== null) {
    throw HttpError(409, "Email in use");
  }
  const user = await addUser(userData);
  if (!user) {
    throw HttpError(400, "Body must have at least one field");
  }
  res.status(201).json({ user: { email, subscription: user.subscription } });
});

export const loginUser = controllerDecorator(async (req, res, next) => {
  const { email, password } = req.body;
  const emailInLowerCase = email.toLowerCase();
  const existUser = await findUser({ email: emailInLowerCase });

  if (existUser === null) {
    throw HttpError(409, "Email not found");
  }
  const isMatch = await bcrypt.compare(password, existUser.password);
  if (!isMatch) {
    throw HttpError(401, "Email or password is wrong");
  }
  const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  await changeUser({ email }, { token });
  res
    .status(200)
    .json({ token, user: { email, subscription: existUser.subscription } });
});

export const logoutUser = controllerDecorator(async (req, res, next) => {
  const { _id } = req.user;
  const updatedUser = await changeUser(_id, { token: null });
  if (!updatedUser) {
    throw HttpError(404, "User not found");
  }
  res.sendStatus(204);
});

export const modifyUserSubscription = controllerDecorator(
  async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const result = await changeUser({ _id: id }, req.body);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(result);
  }
);
