import User from "../models/userModel.js";

export const userList = () => User.find();

export const addUser = (data) => User.create(data);

export const findUser = (data) => User.findOne(data);

export const changeUser = (userData, changesData) =>
  User.findOneAndUpdate(userData, changesData, { new: true });
