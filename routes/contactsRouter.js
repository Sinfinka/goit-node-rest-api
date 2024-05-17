import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  modifyContactStatus,
} from "../controllers/contactsControllers.js";
import {
  createContactSchema,
  updateContactSchema,
  objectIdSchema,
  favoriteContactSchema,
} from "../schemas/contactsSchemas.js";
import validateBody from "../helpers/validateBody.js";
import validateParams from "../helpers/validateParams.js";

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", validateParams(objectIdSchema), getOneContact);

contactsRouter.delete("/:id", validateParams(objectIdSchema), deleteContact);

contactsRouter.post("/", validateBody(createContactSchema), createContact);

contactsRouter.put(
  "/:id",
  validateParams(objectIdSchema),
  validateBody(updateContactSchema),
  updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  validateParams(objectIdSchema),
  validateBody(favoriteContactSchema),
  modifyContactStatus
);

export default contactsRouter;
