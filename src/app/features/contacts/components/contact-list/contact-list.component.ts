import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { AppToastService } from '../../../../services/app-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { ContactService } from '../../../../services/contact.service';
import { ContactsViewModelService } from '../../../../services/contacts-view-model.service';
import {
  Contact,
  ContactFormModel,
  ContactSortField,
} from '../../../../shared/interfaces/contact.interface';
import { createEmptyContactForm, toContactFormModel } from '../../../../shared/utils/contact-validation';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {

  //contactos
  contacts: Contact[] = [];
  //contactos filtrados
  filteredContacts: Contact[] = [];
  selectedContact: Contact | null = null;
  //estado de administrador
  isAdmin = false;
  //estado de carga
  loading = true;
  searchTerm = '';
  //campo de ordenamiento
  selectedSort: ContactSortField = 'firstName';
  //modelo de formulario
  formModel: ContactFormModel = createEmptyContactForm();
  profileVisible = false;
  dialogOpen = false;
  deleteDialogVisible = false;
  saving = false;
  deleting = false;
  editingId: number | null = null;
  toDelete: Contact | null = null;
  //numero de filas por pagina
  rowsPerPage = 12;
  //opciones de ordenamiento
  sortOptions: Array<{ label: string; value: ContactSortField }> = [
    { label: 'Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Job Title', value: 'jobTitle' },
  ];

  //suscripcion a contactos
  private _contactsSub?: Subscription;
  //suscripcion a autenticacion
  private _authSub?: Subscription;

  //servicio de contactos
  constructor(
    private _contactService: ContactService,
    private _authService: AuthService,
    //servicio de view model
    private _viewModelService: ContactsViewModelService,
    private _toast: AppToastService,
  ) {}

  //inicializar el componente
  ngOnInit(): void {
    this._subscribeAuth();
    this._subscribeContacts();
  }

  //destruir el componente
  ngOnDestroy(): void {
    this._contactsSub?.unsubscribe();
    this._authSub?.unsubscribe();
  }

  //manejar el cambio de busqueda
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this._applyFilters();
  }

  //manejar el cambio de ordenamiento
  onSortChange(value: ContactSortField): void {
    this.selectedSort = value;
    this._applyFilters();
  }

  //limpiar filtros
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSort = 'firstName';
    this._applyFilters();
  }

  //limpiar busqueda
  clearSearch(): void {
    this.searchTerm = '';
    this._applyFilters();
  }

  //abrir el dialogo de creacion
  openCreate(): void {
    this.editingId = null;
    this.formModel = createEmptyContactForm();
    this.dialogOpen = true;
  }

  //guardar el contacto
  saveContact(form: ContactFormModel): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    const isCreateMode = this.editingId === null;
    const action$ = isCreateMode
      ? this._contactService.addContact(form)
      //si es modo edicion, actualizar el contacto
      : this._contactService.updateContact({ id: this.editingId!, ...form });

    //ejecutar la accion
    action$
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        //si la accion es exitosa, cerrar el dialogo y mostrar un mensaje de exito
        next: () => {
          this.closeFormDialog();
          const title = isCreateMode ? 'Contact created' : 'Contact updated';
          this._toast.success(title, 'Contact saved successfully.');
        },
        error: () => {
          const title = isCreateMode ? 'Create failed' : 'Update failed';
          this._toast.error(title, 'The contact could not be saved. Please try again.');
        },
      });
  }

  //confirmar la eliminacion
  confirmDelete(): void {
    if (this.deleting || !this.toDelete) {
      return;
    }

    this.deleting = true;
    //ejecutar la eliminacion
    this._contactService
      .deleteContact(this.toDelete.id)
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
      )
      .subscribe({
        //si la eliminacion es exitosa, cerrar el dialogo y mostrar un mensaje de exito
        next: () => {
          this.closeDeleteDialog();
          this._toast.success('Contact deleted', 'Contact removed successfully.');
        },
        error: () => {
          this._toast.error('Delete failed', 'Could not delete this contact.');
        },
      });
  }

  //obtener el label de resultados filtrados
  get filteredCountLabel(): string {
    const count = this.filteredContacts.length;

    return count === 1 ? '1 result' : `${count} results`;
  }

  //abrir el dialogo de perfil
  openProfile(contact: Contact): void {
    this.selectedContact = contact;
    this.profileVisible = true;
  }

  //abrir el dialogo de edicion
  openEdit(contact: Contact): void {
    this.editingId = contact.id;
    this.formModel = toContactFormModel(contact);
    this.dialogOpen = true;
  }

  //cerrar el dialogo de perfil
  closeProfile(): void {
    this.profileVisible = false;
    this.selectedContact = null;
  }

  //cerrar el dialogo de creacion/edicion
  closeFormDialog(): void {
    this.dialogOpen = false;
    this.editingId = null;
  }

  //abrir el dialogo de eliminacion
  openDelete(contact: Contact): void {
    this.toDelete = contact;
    this.deleteDialogVisible = true;
  }

  //cerrar el dialogo de eliminacion
  closeDeleteDialog(): void {
    this.deleteDialogVisible = false;
    this.toDelete = null;
  }

  //aplicar filtros
  private _applyFilters(): void {
    this.filteredContacts = this._viewModelService.filterAndSortContacts(
      this.contacts,
      this.searchTerm,
      this.selectedSort,
    );
  }

  //suscribirse a autenticacion
  private _subscribeAuth(): void {
    this._authSub = this._authService
      .isAuthenticated$
      .subscribe((isAuthenticated) => (this.isAdmin = isAuthenticated));
  }

  //suscribirse a contactos
  private _subscribeContacts(): void {
    this._contactsSub = this._contactService.getContacts().subscribe((contacts) => {
      this.contacts = [...contacts];
      this._applyFilters();
      this.loading = false;
    });
  }
}
