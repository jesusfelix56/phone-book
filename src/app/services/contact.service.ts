import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  throwError,
} from 'rxjs';
import { Contact } from '../shared/interfaces/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly _contactsUrl = 'api/contacts';
  private readonly _contacts$ = new BehaviorSubject<Contact[]>([]);
  private readonly _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private _http: HttpClient) {
    this._loadContacts();
  }

  getContacts(): Observable<Contact[]> {
    return this._contacts$
      .asObservable()
      .pipe(map((contacts) => contacts.map((contact) => ({ ...contact }))));
  }

  addContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    return this._http
      .post<Contact>(this._contactsUrl, contact, this._httpOptions)
      .pipe(
        map((createdContact) => {
          const nextContacts = [...this._contacts$.value, { ...createdContact }];
          this._contacts$.next(nextContacts);
          return createdContact;
        }),
        catchError(this._handleError<Contact>('addContact')),
      );
  }

  updateContact(contact: Contact): Observable<Contact> {
    const url = `${this._contactsUrl}/${contact.id}`;
    return this._http.put<Contact | null>(url, contact, this._httpOptions).pipe(
      map((updatedContact) => {
        //si updatedContact es null, usamos el contacto original
        const resolvedContact = updatedContact ?? contact;
        const nextContacts = this._contacts$.value.map((existing) =>
          existing.id === resolvedContact.id ? { ...resolvedContact } : existing,
        );
        this._contacts$.next(nextContacts);
        return resolvedContact;
      }),
      catchError(this._handleError<Contact>('updateContact', undefined, true)),
    );
  }

  deleteContact(id: number): Observable<void> {
    const url = `${this._contactsUrl}/${id}`;
    return this._http.delete<void>(url, this._httpOptions).pipe(
      map(() => {
        const nextContacts = this._contacts$.value.filter((contact) => contact.id !== id);
        this._contacts$.next(nextContacts);
      }),
      catchError(this._handleError<void>('deleteContact')),
    );
  }

  private _loadContacts(): void {
    this._http
      .get<Contact[]>(this._contactsUrl)
      .pipe(catchError(this._handleError<Contact[]>('_loadContacts', [])))
      .subscribe((contacts) => {
        // Store an internal copy to avoid external mutations leaking across views.
        this._contacts$.next(contacts.map((contact) => ({ ...contact })));
      });
  }

  private _handleError<T>(
    operation = 'operation',
    result?: T,
    rethrow = false,
  ) {
    return (error: unknown): Observable<T> => {
      console.error(`${operation} failed`);
      if (rethrow) {
        return throwError(() => error);
      }
      return of(result as T);
    };
  }
}
