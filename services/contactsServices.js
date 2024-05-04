import * as fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const contactsPath = path.resolve("db", "contacts.json");

export async function listContacts() {
  const data = JSON.parse(
    await fs.readFile(contactsPath, { encoding: "utf-8" })
  );
  return data;
}

async function writeToContactsFile(data) {
  try {
    await fs.writeFile(contactsPath, JSON.stringify(data, undefined, 2));
  } catch (error) {
  }
}

export async function getContactById(contactId) {
  const contacts = await listContacts();
  const contact = contacts.find((contact) => contact.id === contactId);
  if (typeof contact === "undefined") return null;
  return contact;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();
  const deleteContact = contacts.find((contact) => contact.id === contactId);
  if (typeof deleteContact === "undefined") return null;
  const newContactsList = contacts.filter(
    (contact) => contact.id !== deleteContact.id
  );
  await writeToContactsFile(newContactsList);
  return deleteContact;
}

export async function addContact(name, email, phone) {
  const contacts = await listContacts();
  const id = crypto.randomUUID();
  const newContact = { id, name, email, phone };
  contacts.push(newContact);
  await writeToContactsFile(contacts);
  return newContact;
}

export async function editContact(id, data) {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    return null;
  }
  contacts[index] = { ...contacts[index], ...data };
  await writeToContactsFile(contacts);
  return contacts[index];
}