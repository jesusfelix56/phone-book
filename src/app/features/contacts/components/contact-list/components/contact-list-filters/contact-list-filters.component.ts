import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContactSortField } from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-contact-list-filters',
  templateUrl: './contact-list-filters.component.html',
  styleUrls: ['./contact-list-filters.component.scss'],
})
export class ContactListFiltersComponent {
  
  @Input() searchTerm = '';
  @Input() selectedSort: ContactSortField = 'firstName';
  @Input() sortOptions: Array<{ label: string; value: ContactSortField }> = [];
  @Input() canCreateContact = false;
  @Input() showClearSearch = false;

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() selectedSortChange = new EventEmitter<ContactSortField>();
  @Output() createContact = new EventEmitter<void>();
  @Output() clearSearch = new EventEmitter<void>();
}
