import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ContactSortField,
  ContactSortOption,
} from '../../../../../../shared/interfaces/contact.interface';

@Component({
  selector: 'app-contact-list-filters',
  templateUrl: './contact-list-filters.component.html',
  styleUrls: ['./contact-list-filters.component.scss'],
})
export class ContactListFiltersComponent {
  @Input() searchTerm = '';
  @Input() selectedSort: ContactSortField = 'firstName';
  @Input() sortOptions: ContactSortOption[] = [];

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() selectedSortChange = new EventEmitter<ContactSortField>();
}
