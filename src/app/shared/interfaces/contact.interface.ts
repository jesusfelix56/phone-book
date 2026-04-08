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

export interface ContactSortOption {
  label: string;
  value: ContactSortField;
}

export interface ContactColumnOption {
  field: keyof Omit<Contact, 'id'>;
  header: string;
}

export type ContactFormModel = Omit<Contact, 'id'>;

