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
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";

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
  const avatarURL = gravatar.url(emailInLowerCase);
  const userData = {
    email: emailInLowerCase,
    password: passwordHash,
    avatarURL,
  };
  console.log(avatarURL);
  if (existUser !== null) {
    throw HttpError(409, "Email in use");
  }
  const user = await addUser(userData);
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
  await changeUser({ email: emailInLowerCase }, { token });
  res.status(200).json({
    token,
    user: { email: emailInLowerCase, subscription: existUser.subscription },
  });
});

export const logoutUser = controllerDecorator(async (req, res, next) => {
  const { id } = req.user;
  const updatedUser = await changeUser({ _id: id }, { token: null });
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

export const uploadAvatar = controllerDecorator(async (req, res, next) => {
  const avatarsDir = path.resolve("public", "avatars");
  await fs.mkdir(avatarsDir, { recursive: true });
  const uniqueFileName = req.file.filename;
  const newFilePath = path.join(avatarsDir, uniqueFileName);
  await fs.rename(req.file.path, newFilePath);
  const image = await Jimp.read(newFilePath);
  await image.resize(250, 250).write(newFilePath);
  const avatarURL = `/avatars/${uniqueFileName}`;
  const { id } = req.user;
  const updatedUser = await changeUser({ _id: id }, { avatarURL: avatarURL });
  if (updatedUser === null) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ avatarURL });
});

export const getUserAvatar = controllerDecorator(async (req, res, next) => {
  const avatarsDir = path.resolve("public", "avatars");
  const { id } = req.user;
  const user = await findUser({ _id: id });
  const avatarURL = user.avatarURL;
  const avatarPath = path.join(avatarsDir, avatarURL);
  if (user === null) {
    throw HttpError(404, "Not found");
  }
  if (avatarURL === null) {
    throw HttpError(404, "Avatar not found");
  }
  res.status(200).json({ avatarURL: avatarPath });
});
