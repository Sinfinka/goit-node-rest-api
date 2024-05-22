import Contact from "../models/contactModel.js";

export const listContacts = (owner) => Contact.find(owner);

export const getContactById = (id, owner) => Contact.findOne(id, owner);

export const addContact = (data) => Contact.create(data);

export const editContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

export const removeContact = async (id) => Contact.findByIdAndDelete(id);

export const updateStatusContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });
