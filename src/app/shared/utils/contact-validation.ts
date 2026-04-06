import { Contact } from '../interfaces/contact.interface';

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_PHONE_PATTERN = /^[\d\s()+-]{7,20}$/;

const fieldLabels: Record<keyof Omit<Contact, 'id'>, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  email: 'Email',
  jobTitle: 'Job title',
  address: 'Address',
};

export function isContactEmailValid(value: string): boolean {
  return CONTACT_EMAIL_PATTERN.test(value.trim());
}

export function isContactPhoneValid(value: string): boolean {
  return CONTACT_PHONE_PATTERN.test(value.trim());
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

export function getContactFormFieldLabel(field: keyof Omit<Contact, 'id'>): string {
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
