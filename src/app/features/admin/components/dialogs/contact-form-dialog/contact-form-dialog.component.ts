import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../../shared/interfaces/contact.interface';
import {
  getContactFormFieldError,
  getContactFormFieldLabel,
} from '../../../../../shared/utils/contact-validation';

@Component({
  selector: 'app-contact-form-dialog',
  templateUrl: './contact-form-dialog.component.html',
  styleUrls: ['./contact-form-dialog.component.scss'],
})
export class ContactFormDialogComponent {
  @Input() visible = false;
  @Input() formModel!: Omit<Contact, 'id'>;
  @Input() formSubmitted = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() formModelChange = new EventEmitter<Omit<Contact, 'id'>>();

  close(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  updateField(field: keyof Omit<Contact, 'id'>, value: string): void {
    this.formModelChange.emit({
      ...this.formModel,
      [field]: value,
    });
  }

  isFieldInvalid(field: keyof Omit<Contact, 'id'>): boolean {
    return !!this.getFieldError(field);
  }

  getFieldError(field: keyof Omit<Contact, 'id'>): string {
    return getContactFormFieldError(field, this.formModel, this.formSubmitted);
  }

  getFieldLabel(field: keyof Omit<Contact, 'id'>): string {
    return getContactFormFieldLabel(field);
  }
}
