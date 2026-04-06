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
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PublicRoutingModule } from './public-routing.module';
import { ContactCardComponent } from './components/contact-list/components/contact-card/contact-card.component';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactListFiltersComponent } from './components/contact-list/components/contact-list-filters/contact-list-filters.component';
import { ContactProfileDialogComponent } from './components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';

@NgModule({
  declarations: [
    ContactListComponent,
    ContactListFiltersComponent,
    ContactCardComponent,
    ContactProfileDialogComponent,
    PublicLayoutComponent,
  ],
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
    TagModule,
    SkeletonModule,
    TooltipModule,
  ],
})
export class PublicModule {}
