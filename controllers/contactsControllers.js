import HttpError from "../helpers/HttpError.js";
import { controllerDecorator } from "../helpers/controllerDecorator.js";
import { addContact, editContact, getContactById, listContacts, removeContact } from "../services/contactsServices.js";

export const getAllContacts = controllerDecorator(async (req, res, next) => {
  const contacts = await listContacts();
  if (!contacts.length) {
    throw HttpError(404, "Not found");
  }
  res.status(200).send(contacts);
});

export const getOneContact = controllerDecorator(async (req, res, next) => {
  const { id } = req.params;
  const contact = await getContactById(id);
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).send(contact);
});

export const deleteContact = controllerDecorator(async (req, res, next) => {
  const { id } = req.params;
  const contact = await removeContact(id)
  if (!contact) {
    throw HttpError(404, `Contact with  ID ${id} not found`);
  }
  res.status(200).send(contact);
});

export const createContact = controllerDecorator(async (req, res) => {
  const {name, email, phone} = req.body
  const contact = await addContact(name, email, phone)
  if (!contact) {
    throw HttpError(400, "Body must have at least one field");
  }
  res.status(201).send(contact);
});

export const updateContact = controllerDecorator( async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }
  const { id } = req.params;
  const contact = await editContact(id, req.body)
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(contact);
});
