import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContactColumnOption } from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-admin-contacts-toolbar',
  templateUrl: './admin-contacts-toolbar.component.html',
  styleUrls: ['./admin-contacts-toolbar.component.scss'],
})
export class AdminContactsToolbarComponent {
  @Input() selectedCount = 0;
  @Input() columns: ContactColumnOption[] = [];
  @Input() selectedColumns: ContactColumnOption[] = [];

  @Output() addContact = new EventEmitter<void>();
  @Output() deleteSelected = new EventEmitter<void>();
  @Output() selectedColumnsChange = new EventEmitter<ContactColumnOption[]>();
  @Output() globalFilterChange = new EventEmitter<string>();

  onColumnsChange(columns: ContactColumnOption[]): void {
    this.selectedColumnsChange.emit(columns);
  }

  onGlobalFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.globalFilterChange.emit(value);
  }
}
