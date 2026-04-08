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
  ContactSortOption,
} from '../../../../shared/interfaces/contact.interface';
import { createEmptyContactForm, toContactFormModel } from '../../../../shared/utils/contact-form.factory';

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
  //visibilidad del dialogo de perfil
  profileVisible = false;
  //visibilidad del dialogo de creacion/edicion de contacto
  contactDialogVisible = false;
  //visibilidad del dialogo de eliminacion de contacto
  deleteDialogVisible = false;
  //estado de guardado de contacto
  isSavingContact = false;
  //estado de eliminacion de contacto
  isDeletingContact = false;
  //estado de administrador
  isAdmin = false;
  //estado de carga
  loading = true;
  searchTerm = '';
  //campo de ordenamiento
  selectedSort: ContactSortField = 'firstName';
  //modelo de formulario
  formModel: ContactFormModel = createEmptyContactForm();
  //id del contacto a editar
  editingContactId: number | null = null;
  //contacto a eliminar
  contactToDelete: Contact | null = null;
  //numero de filas por pagina
  readonly rowsPerPage = 12;
  //opciones de ordenamiento
  readonly sortOptions: ContactSortOption[] = [
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

  //abrir el dialogo de perfil
  openProfile(contact: Contact): void {
    this.selectedContact = contact;
    this.profileVisible = true;
  }

  //cerrar el dialogo de perfil
  closeProfile(): void {
    this.profileVisible = false;
    this.selectedContact = null;
  }

  //abrir el dialogo de creacion
  openCreate(): void {
    this.editingContactId = null;
    this.formModel = createEmptyContactForm();
    this.contactDialogVisible = true;
  }

  //abrir el dialogo de edicion
  openEdit(contact: Contact): void {
    this.editingContactId = contact.id;
    this.formModel = toContactFormModel(contact);
    this.contactDialogVisible = true;
  }

  //guardar el contacto
  saveContact(form: ContactFormModel): void {
    if (this.isSavingContact) {
      return;
    }

    this.isSavingContact = true;
    const isCreateMode = this.editingContactId === null;
    const action$ = isCreateMode
      ? this._contactService.addContact(form)
      //si es modo edicion, actualizar el contacto
      : this._contactService.updateContact({ id: this.editingContactId!, ...form });

    //ejecutar la accion
    action$
      .pipe(finalize(() => (this.isSavingContact = false)))
      .subscribe({
        //si la accion es exitosa, cerrar el dialogo y mostrar un mensaje de exito
        next: () => {
          this.closeFormDialog();
          const title = isCreateMode ? 'Contact created' : 'Contact updated';
          this._toast.success(title, 'Contact saved successfully.');
        },
        //si la accion es fallida, mostrar un mensaje de error
        error: () => {
          this._toast.error('Update failed', 'The contact could not be updated. Please try again.');
        },
      });
  }

  //cerrar el dialogo de creacion/edicion
  closeFormDialog(): void {
    this.contactDialogVisible = false;
    this.editingContactId = null;
  }

  //abrir el dialogo de eliminacion
  openDelete(contact: Contact): void {
    this.contactToDelete = contact;
    this.deleteDialogVisible = true;
  }

  //cerrar el dialogo de eliminacion
  closeDeleteDialog(): void {
    this.deleteDialogVisible = false;
    this.contactToDelete = null;
  }

  //confirmar la eliminacion
  confirmDelete(): void {
    if (this.isDeletingContact || !this.contactToDelete) {
      return;
    }

    this.isDeletingContact = true;
    //ejecutar la eliminacion
    this._contactService
      .deleteContact(this.contactToDelete.id)
      .pipe(finalize(() => (this.isDeletingContact = false)))
      .subscribe({
        //si la eliminacion es exitosa, cerrar el dialogo y mostrar un mensaje de exito
        next: () => {
          this.closeDeleteDialog();
          this._toast.success('Contact deleted', 'Contact removed successfully.');
        },
        //si la eliminacion es fallida, mostrar un mensaje de error
        error: () => {
          this._toast.error('Delete failed', 'The contact could not be deleted. Please try again.');
        },
      });
  }

  //obtener el label de resultados filtrados
  get filteredCountLabel(): string {
    const count = this.filteredContacts.length;

    return count === 1 ? '1 result' : `${count} results`;
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
