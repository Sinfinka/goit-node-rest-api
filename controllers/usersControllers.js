import HttpError from "../helpers/HttpError.js";
import { controllerDecorator } from "../helpers/controllerDecorator.js";
import {
  addUser,
  changeUser,
  findUser,
  userList,
} from "../services/usersServices.js";
import bcrypt from "bcrypt";
import crypto, { verify } from "node:crypto";
import jwt from "jsonwebtoken";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";
import mail from "../mailWithMailtrap.js";
import "dotenv/config";

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
  const verificationToken = crypto.randomUUID();
  const avatarURL = gravatar.url(emailInLowerCase);
  const userData = {
    email: emailInLowerCase,
    password: passwordHash,
    avatarURL,
    verificationToken,
  };
  if (existUser !== null) {
    throw HttpError(409, "Email in use");
  }
  const user = await addUser(userData);
  mail.sendMail({
    to: emailInLowerCase,
    from: process.env.EMAIL_FROM,
    subject: "Welcome to Contacts!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Welcome to Contacts!</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering with Contacts. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.BASE_URL}${process.env.PORT}/users/verify/${verificationToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
        </div>
        <p style="font-size: 16px; color: #333;">If the button above does not work, please copy and paste the following URL into your web browser:</p>
        <p style="font-size: 14px; color: #555;">"${process.env.BASE_URL}${process.env.PORT}/users/verify/${verificationToken}"</p>
        <p style="font-size: 16px; color: #333;">Thank you,<br>The Contacts Team</p>
      </div>
    `,
    text: `Hello,\n\nThank you for registering with Contacts. Please verify your email address to complete your registration by clicking the link below:\n\n"${process.env.BASE_URL}${process.env.PORT}/users/verify/${verificationToken}"\n\nIf the link above does not work, please copy and paste the following URL into your web browser:\n\n"${process.env.BASE_URL}${process.env.PORT}/users/verify/${verificationToken}"\n\nThank you,\nThe Contacts Team`,
  });
  res.status(201).json({ user: { email, subscription: user.subscription } });
});

export const verifyUser = controllerDecorator(async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await findUser({ verificationToken: verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await changeUser(user._id, { verificationToken: null, verify: true });
  res.status(200).send("Verification successful");
});

export const sendVerifyEmail = controllerDecorator(async (req, res, next) => {
  const { email } = req.body;
  const emailInLowerCase = email.toLowerCase();
  const user = await findUser({ email: emailInLowerCase });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify === true) {
    return res.status(400).send("Verification has already been passed");
  }
  mail.sendMail({
    to: emailInLowerCase,
    from: process.env.EMAIL_FROM,
    subject: "Welcome to Contacts!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Welcome to Contacts!</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering with Contacts. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.BASE_URL}${process.env.PORT}/users/verify/${user.verificationToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
        </div>
        <p style="font-size: 16px; color: #333;">If the button above does not work, please copy and paste the following URL into your web browser:</p>
        <p style="font-size: 14px; color: #555;">"${process.env.BASE_URL}${process.env.PORT}/users/verify/${user.verificationToken}"</p>
        <p style="font-size: 16px; color: #333;">Thank you,<br>The Contacts Team</p>
      </div>
    `,
    text: `Hello,\n\nThank you for registering with Contacts. Please verify your email address to complete your registration by clicking the link below:\n\n"${process.env.BASE_URL}${process.env.PORT}/users/verify/${user.verificationToken}"\n\nIf the link above does not work, please copy and paste the following URL into your web browser:\n\n"${process.env.BASE_URL}${process.env.PORT}/users/verify/${user.verificationToken}"\n\nThank you,\nThe Contacts Team`,
  });
  res.status(200).send("Verification email sent");
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

  if (existUser.verify === false) {
    throw HttpError(401, "Please, verify you email");
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
  await image.resize(250, 250).writeAsync(newFilePath);
  const avatarURL = path.join("/avatars", uniqueFileName);
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
