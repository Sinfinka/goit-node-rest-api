import { controllerDecorator } from "../helpers/controllerDecorator.js";
import HttpError from "../helpers/HttpError.js";
import Contact from "../models/contactModel.js";
import {
  addContact,
  editContact,
  getContactById,
  listContacts,
  removeContact,
  updateStatusContact,
} from "../services/contactsServices.js";

export const getAllContacts = controllerDecorator(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const { favorite } = req.body;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const filter = { owner: req.user.id };
  if (favorite !== undefined) {
    filter.favorite = !!favorite;
  }
  const contacts = await listContacts(filter)
    .skip(skip)
    .limit(limitNumber)
    .exec();
  const total = await Contact.countDocuments(filter);
  res.status(200).send({
    contacts,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

export const getOneContact = controllerDecorator(async (req, res, next) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const contact = await getContactById({ _id: id, owner });
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).send(contact);
});

export const createContact = controllerDecorator(async (req, res) => {
  const data = req.body;
  const contact = await addContact({ ...data, owner: req.user._id });
  if (!contact) {
    throw HttpError(400, "Body must have at least one field");
  }
  res.status(201).send(contact);
});

export const updateContact = controllerDecorator(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }
  const { id } = req.params;
  const contact = await editContact(id, req.body);
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(contact);
});

export const deleteContact = controllerDecorator(async (req, res, next) => {
  const { id } = req.params;
  const contact = await removeContact(id);

  if (!contact) {
    throw HttpError(404, `Contact with  ID ${id} not found`);
  }
  res.status(200).send(contact);
});

export const modifyContactStatus = controllerDecorator(
  async (req, res, next) => {
    const { id } = req.params;
    const result = await updateStatusContact(id, req.body);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(result);
  }
);
