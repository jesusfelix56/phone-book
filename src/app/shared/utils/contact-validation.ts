import { Contact, ContactFormModel } from '../interfaces/contact.interface';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s()+-]{7,20}$/;
type RequiredContactField =
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email'
  | 'jobTitle';

const fieldLabels: Record<RequiredContactField, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  email: 'Email',
  jobTitle: 'Job title',
};

export function isContactEmailValid(value: string): boolean {
  return emailPattern.test(value.trim());
}

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

export function isContactPhoneValid(value: string): boolean {
  return phonePattern.test(value.trim());
}

export function isContactBodyValid(contact: Omit<Contact, 'id'> | Contact): boolean {
  return (
    !!contact.firstName.trim() &&
    !!contact.lastName.trim() &&
    isContactPhoneValid(contact.phone) &&
    isContactEmailValid(contact.email) &&
    !!contact.jobTitle.trim()
  );
}

export function getContactFormFieldLabel(field: RequiredContactField): string {
  return fieldLabels[field];
}

export function getContactFormFieldError(
  field: keyof Omit<Contact, 'id'>,
  formModel: Omit<Contact, 'id'>,
  formSubmitted: boolean,
): string {
  if (!formSubmitted) {
    return '';
  }

  if (field === 'address') {
    return '';
  }

  const value = formModel[field];
  if (!value.trim()) {
    return `${getContactFormFieldLabel(field)} is required.`;
  }

  if (field === 'email' && !isContactEmailValid(formModel.email)) {
    return 'Email format is invalid.';
  }

  if (field === 'phone' && !isContactPhoneValid(formModel.phone)) {
    return 'Phone format is invalid.';
  }

  return '';
}
