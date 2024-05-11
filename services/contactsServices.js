import Contact from "../db/userModel.js";

export const listContacts = () => Contact.find();

export const getContactById = (id) => Contact.findById(id);

export const addContact = (data) => Contact.create(data);

export const editContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const updateStatusContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });
