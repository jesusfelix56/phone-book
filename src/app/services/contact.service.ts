import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  MonoTypeOperatorFunction,
  Observable,
  catchError,
  of,
  tap,
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
    return this._contacts$.asObservable();
  }

  addContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    return this._http
      .post<Contact>(this._contactsUrl, contact, this._httpOptions)
      .pipe(
        this._refreshContacts<Contact>(),
        catchError(this._handleError<Contact>('addContact')),
      );
  }

  updateContact(contact: Contact): Observable<Contact> {
    const url = `${this._contactsUrl}/${contact.id}`;
    return this._http.put<Contact>(url, contact, this._httpOptions).pipe(
      this._refreshContacts<Contact>(),
      catchError(this._handleError<Contact>('updateContact', undefined, true)),
    );
  }

  deleteContact(id: number): Observable<void> {
    const url = `${this._contactsUrl}/${id}`;
    return this._http.delete<void>(url, this._httpOptions).pipe(
      this._refreshContacts<void>(),
      catchError(this._handleError<void>('deleteContact')),
    );
  }

  private _loadContacts(): void {
    this._http
      .get<Contact[]>(this._contactsUrl)
      .pipe(catchError(this._handleError<Contact[]>('_loadContacts', [])))
      .subscribe((contacts) => {
        this._contacts$.next(contacts);
      });
  }

  private _refreshContacts<T>(): MonoTypeOperatorFunction<T> {
    return tap(() => this._loadContacts());
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
