import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminContactsComponent } from './components/admin-contacts/admin-contacts.component';

const routes: Routes = [
  {
    path: 'contacts',
    component: AdminContactsComponent,
  },
  {
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
