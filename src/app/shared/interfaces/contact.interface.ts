export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  jobTitle: string;
  address: string;
}

export type ContactSortField = 'firstName' | 'lastName' | 'phone' | 'jobTitle';

export type ContactFormModel = Omit<Contact, 'id'>;

