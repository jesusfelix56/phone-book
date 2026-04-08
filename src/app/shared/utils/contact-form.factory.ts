import { Contact, ContactFormModel } from '../interfaces/contact.interface';

export function createEmptyContactForm(): ContactFormModel {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    jobTitle: '',
    address: '',
  };
}

export function toContactFormModel(contact: Contact): ContactFormModel {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    email: contact.email,
    jobTitle: contact.jobTitle,
    address: contact.address,
  };
}
