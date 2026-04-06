import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import {
  Contact,
  ContactColumnOption,
} from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-admin-contacts-table',
  templateUrl: './admin-contacts-table.component.html',
  styleUrls: ['./admin-contacts-table.component.scss'],
})
export class AdminContactsTableComponent {
  @Input() contacts: Contact[] = [];
  @Input() selectedColumns: ContactColumnOption[] = [];
  @Input() selectedContacts: Contact[] = [];

  @Output() selectedContactsChange = new EventEmitter<Contact[]>();
  @Output() rowEditInit = new EventEmitter<Contact>();
  @Output() rowEditSave = new EventEmitter<Contact>();
  @Output() rowEditCancel = new EventEmitter<Contact>();
  @Output() deleteContact = new EventEmitter<Contact>();

  @ViewChild('dt') private _dataTable?: Table;

  applyGlobalFilter(value: string): void {
    this._dataTable?.filterGlobal(value, 'contains');
  }

  clearSelectionOnFilter(): void {
    this.selectedContactsChange.emit([]);
  }
}
