import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PublicRoutingModule } from './public-routing.module';
import { ContactListComponent } from './components/contact-list/contact-list.component';

@NgModule({
  declarations: [ContactListComponent],
  imports: [
    CommonModule,
    FormsModule,
    PublicRoutingModule,
    DataViewModule,
    AvatarModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    DropdownModule,
    ButtonModule,
    CardModule,
  ],
})
export class PublicModule {}
