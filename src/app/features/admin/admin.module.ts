import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminContactsComponent } from './components/admin-contacts/admin-contacts.component';
import { AdminContactsTableComponent } from './components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component';
import { AdminContactsToolbarComponent } from './components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component';
import { ConfirmDeleteDialogComponent } from './components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ContactFormDialogComponent } from './components/dialogs/contact-form-dialog/contact-form-dialog.component';

@NgModule({
  declarations: [
    AdminContactsComponent,
    AdminContactsToolbarComponent,
    AdminContactsTableComponent,
    ContactFormDialogComponent,
    ConfirmDeleteDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    TooltipModule,
  ],
})
export class AdminModule {}
