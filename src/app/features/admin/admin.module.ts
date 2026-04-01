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
import { AdminRoutingModule } from './admin-routing.module';
import { AdminContactsComponent } from './components/admin-contacts/admin-contacts.component';

@NgModule({
  declarations: [AdminContactsComponent],
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
  ],
})
export class AdminModule {}
