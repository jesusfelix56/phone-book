import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '../../guards/admin.guard';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'contacts',
        pathMatch: 'full',
      },
      {
        path: 'contacts',
        component: ContactListComponent,
      },
      {
        path: 'admin/contacts',
        component: ContactListComponent,
        canActivate: [adminGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsRoutingModule {}
