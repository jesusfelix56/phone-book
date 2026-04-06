import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminContactsComponent } from './components/admin-contacts/admin-contacts.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'contacts',
        component: AdminContactsComponent,
      },
      {
        path: '',
        redirectTo: 'contacts',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
