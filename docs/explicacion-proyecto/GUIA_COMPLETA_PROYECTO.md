# Guia completa del proyecto (paso a paso, sin repeticiones)

Esta guia explica **todo `src`** en un flujo unico de ejecucion.  
Regla de lectura: cada archivo aparece una sola vez con su funcion real, lo que exporta, sus variables/metodos y sus conexiones.

---

## 1) Arranque de la aplicacion

### `src/index.html`
- **Rol:** documento host de la SPA.
- **Clave:** contiene `<app-root>` (ancla donde Angular monta la app), `<base href="/">` (routing) y favicon.
- **Exporta/metodos:** no aplica (archivo estatico).

### `src/main.ts`
- **Rol:** entry point ejecutable.
- **Hace:** `platformBrowserDynamic().bootstrapModule(AppModule)` y captura errores con `.catch(...)`.
- **Conecta con:** `src/app/app.module.ts`.

---

## 2) Nucleo Angular raiz

### `src/app/app.module.ts`
- **Exporta:** `AppModule`.
- **Declara:** `AppComponent`.
- **Importa y habilita:**
  - navegador/animaciones (`BrowserModule`, `BrowserAnimationsModule`),
  - HTTP (`HttpClientModule`),
  - routing raiz (`AppRoutingModule`),
  - toast global (`ToastModule`),
  - backend mock (`HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false })`).
- **Providers:** `MessageService` (base de toasts).

### `src/app/app-routing.module.ts`
- **Exporta:** `AppRoutingModule`.
- **Rutas raiz:**
  - `''` -> lazy `PublicModule`,
  - `'login'` -> lazy `AuthModule`,
  - `'admin'` -> lazy `AdminModule` con `canActivate: [authGuard]`.

### `src/app/app.component.ts`
- **Exporta:** `AppComponent`.
- **Rol actual:** componente raiz minimo (sin logica de auth ni layout de navegacion).
- **Variables/metodos:** no define estado ni metodos propios.

### `src/app/app.component.html`
- **Rol actual:** host minimo de infraestructura global.
- **Contiene:** `<p-toast>` y `<router-outlet>`.
- **Notas:** la navbar/header ya no vive aqui; se movio a `PublicLayoutComponent`.

### `src/app/app.component.scss`
- **Rol actual:** estilo minimo del host (`:host { display: block; }`).

### `src/app/app.component.spec.ts`
- **Rol:** test basico del root component (creacion y presencia de `router-outlet`).

---

## 3) Capa core y datos mock

### `src/app/core/guards/auth.guard.ts`
- **Exporta:** `authGuard` (`CanActivateFn`).
- **Flujo:** si `AuthService.isAuthenticated()` es `true`, deja pasar; si no, redirige a `/login` y bloquea ruta.

### `src/app/core/api/mocks/mock-contacts.ts`
- **Exporta:** `CONTACTS: Contact[]` (dataset semilla).

### `src/app/services/in-memory-data.service.ts`
- **Exporta:** `InMemoryDataService`.
- **Metodos:**
  - `createDb()` -> expone `{ contacts }` desde `CONTACTS`.
  - `genId(contacts)` -> siguiente id incremental.
- **Conexion:** backend simulado para todas las llamadas `api/contacts`.

---

## 4) Modelos compartidos y validacion

### `src/app/shared/interfaces/contact.interface.ts`
- **Exporta:**
  - `interface Contact`,
  - `type ContactSortField`,
  - `interface ContactSortOption`,
  - `interface ContactColumnOption`.
- **Rol:** contrato tipado comun para servicios y componentes.

### `src/app/shared/utils/contact-validation.ts`
- **Exporta constantes:**
  - `CONTACT_EMAIL_PATTERN`,
  - `CONTACT_PHONE_PATTERN`.
- **Exporta funciones:**
  - `isContactEmailValid(value)`,
  - `isContactPhoneValid(value)`,
  - `isContactBodyValid(contact)` (requiere firstName/lastName/jobTitle + phone/email validos; `address` opcional),
  - `getContactFormFieldLabel(field)`,
  - `getContactFormFieldError(field, formModel, formSubmitted)`.
- **Rol:** reglas unificadas de validacion para admin/formularios.

---

## 5) Servicios de aplicacion

### `src/app/services/auth.service.ts`
- **Exporta:** `AuthService`.
- **Variables:**
  - `_isAuthenticated$` (BehaviorSubject),
  - `_adminUsername = 'admin'`,
  - `_adminPassword = 'admin123'`,
  - `isAuthenticated$` (observable publico).
- **Metodos:**
  - `login(username, password): Observable<boolean>` -> valida credenciales y actualiza subject.
  - `logout(): void` -> emite `false`.
  - `isAuthenticated(): boolean` -> lectura sincronica del estado actual.

### `src/app/services/contact.service.ts`
- **Exporta:** `ContactService`.
- **Variables:**
  - `_contactsUrl = 'api/contacts'`,
  - `_contacts$ = new BehaviorSubject<Contact[]>([])`,
  - `_httpOptions` (headers JSON).
- **Constructor:** llama `_loadContacts()`.
- **Metodos publicos:**
  - `getContacts()` -> stream de contactos.
  - `addContact(contact)` -> POST + refresh.
  - `updateContact(contact)` -> PUT + refresh.
  - `deleteContact(id)` -> DELETE + refresh.
- **Metodos privados:**
  - `_loadContacts()` -> GET y `next` del subject.
  - `_refreshContacts<T>()` -> `tap` para recargar tras mutacion.
  - `_handleError<T>(...)` -> fallback con `of(...)`.
- **RxJS usado:** `BehaviorSubject`, `tap`, `catchError`, `of`.

### `src/app/services/app-toast.service.ts`
- **Exporta:** `AppToastService`.
- **Metodos:**
  - `success(summary, detail)`,
  - `error(summary, detail)`,
  - `info(summary, detail)`,
  - `_show(severity, summary, detail)` (privado).
- **Conexion:** centraliza toasts PrimeNG usando `MessageService`.

### `src/app/services/clipboard-toast.service.ts`
- **Exporta:** `ClipboardToastService`.
- **Metodo:** `copyWithFeedback(value, label)`.
  - limpia valor,
  - copia al portapapeles si hay API,
  - muestra toast de feedback.
- **Consumidores:** tarjetas y modal de perfil publico.

---

## 6) Feature Auth (login)

### `src/app/features/auth/auth-routing.module.ts`
- **Rol:** ruta interna del modulo auth.
- **Ruta:** `''` -> `LoginComponent`.

### `src/app/features/auth/auth.module.ts`
- **Declara:** `LoginComponent`.
- **Importa:** `FormsModule`, `AuthRoutingModule` y PrimeNG de formulario/card.

### `src/app/features/auth/components/login/login.component.ts`
- **Variables:** `username`, `password`, `errorMessage`.
- **Metodo `login()`:**
  - llama `AuthService.login(...)`,
  - si invalido: setea `errorMessage`,
  - si valido: limpia error, toast bienvenida y navega a `/admin/contacts`.

### `src/app/features/auth/components/login/login.component.html`
- **Bindings:** `[(ngModel)]` en usuario/password, `*ngIf="errorMessage"`.
- **Evento:** boton `Sign in` -> `login()`.

### `src/app/features/auth/components/login/login.component.scss`
- **Rol:** estilos del formulario y del mensaje de error.

---

## 7) Feature Public (listado de contactos)

### `src/app/features/public/public-routing.module.ts`
- **Estructura actual con layout anidado:**
  - `path: ''` -> `PublicLayoutComponent`.
  - **children**:
    - `''` -> redirige a `contacts`,
    - `'contacts'` -> `ContactListComponent`.
- **Efecto real:** toda la experiencia publica renderiza dentro del layout compartido.

### `src/app/features/public/public.module.ts`
- **Declara:** `PublicLayoutComponent`, `ContactListComponent`, `ContactListFiltersComponent`, `ContactCardComponent`, `ContactProfileDialogComponent`.
- **Importa:** `FormsModule` + PrimeNG para lista/filtros/dialog/tarjetas.

### `src/app/features/public/components/public-layout/public-layout.component.ts`
- **Rol:** shell real de la zona publica (header/nav/logout + contenedor de vistas hijas).
- **Variables:**
  - `isAuthenticated` (control visual de Login/Admin/Logout),
  - `_authSub?` (suscripcion privada para cleanup).
- **Dependencias DI:**
  - `_authService: AuthService`,
  - `_router: Router`.
- **Metodos:**
  - `ngOnInit()` -> subscribe a `AuthService.isAuthenticated$` y sincroniza `isAuthenticated`.
  - `logout()` -> cierra sesion y navega a `/contacts`.
  - `ngOnDestroy()` -> unsubscribe defensivo.

### `src/app/features/public/components/public-layout/public-layout.component.html`
- **Rol:** layout visual reutilizable de la zona publica.
- **Contiene:**
  - marca `Phone Book`,
  - links `Contacts`, `Admin` (condicional por auth), `Login`/`Logout`,
  - `<router-outlet>` hijo para renderizar `ContactListComponent`.
- **Eventos y directivas:**
  - `(click)="logout()"`,
  - `routerLink`, `routerLinkActive`, `*ngIf`, `ng-template`.

### `src/app/features/public/components/public-layout/public-layout.component.scss`
- **Rol:** estilos del layout publico (header/top nav/content responsive).
- **Dependencia SCSS:** `@use 'assets/styles/variables' as *`.
- **Bloques clave:** `.top`, `.topInner`, `.nav`, `.content`, `.contentInner`.

### `src/app/features/public/components/contact-list/contact-list.component.ts`
- **Rol:** contenedor de la vista publica.
- **Variables:**
  - `contacts`, `filteredContacts`,
  - `selectedContact`, `profileVisible`,
  - `loading`, `searchTerm`, `selectedSort`, `sortOptions`,
  - `_contactsSub?`.
- **Metodos:**
  - `ngOnInit()` -> subscribe a contactos, aplica filtros, apaga loading.
  - `onSearchChange(value)` y `onSortChange(value)` -> recalculan vista.
  - `clearFilters()` -> reset de filtros.
  - `openProfile(contact)` / `closeProfile()`.
  - `ngOnDestroy()` -> cleanup.
  - `_applyFilters()` -> filtra por nombre/apellido/fullName/telefono y ordena por campo seleccionado.

### `src/app/features/public/components/contact-list/contact-list.component.html`
- integra:
  - `app-contact-list-filters`,
  - skeletons cuando `loading`,
  - `p-dataView` paginado con `filteredContacts`,
  - estado vacio con boton `Clear filters`,
  - `app-contact-profile-dialog`.

### `src/app/features/public/components/contact-list/contact-list.component.scss`
- estilos de layout/grid y estados visuales loading/empty.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.ts`
- **Inputs:** `searchTerm`, `selectedSort`, `sortOptions`.
- **Outputs:** `searchTermChange`, `selectedSortChange`.
- **Rol:** componente presentacional de filtros.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.html`
- input de busqueda y dropdown de orden con `ngModel` y `ngModelChange`.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.scss`
- estilos responsive del bloque de filtros.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.ts`
- **Input:** `contact`.
- **Output:** `viewProfile`.
- **Variables:** `defaultAvatar`, `_namePalette`, `_tagSeverities`.
- **Metodos:**
  - `openProfile()` -> emite contacto al padre.
  - `getNameColor()` / `getTagSeverity()` -> apariencia derivada de `id`.
  - `copyValue(value, label)` -> delega en `ClipboardToastService`.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.html`
- tarjeta con avatar, nombre, jobTitle, phone/email y boton `View profile`.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.scss`
- estilos visuales de card y lineas de informacion.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.ts`
- **Inputs:** `visible`, `contact`.
- **Outputs:** `visibleChange`, `close`.
- **Variables:** `defaultAvatar`, `_namePalette`, `_tagSeverities`.
- **Metodos:**
  - `onClose()` -> emite cierre.
  - `copyValue(value, label)` -> copy + toast.
  - `getNameColor()` -> color dinamico por `id` del contacto.
  - `getTagSeverity()` -> severidad dinamica del `p-tag` por `id`.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.html`
- modal (`p-dialog`) con datos completos y botones de copiar.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.scss`
- estilos del modal de perfil.

---

## 8) Feature Admin (CRUD completo)

### `src/app/features/admin/admin-routing.module.ts`
- **Estructura actual con layout anidado:**
  - `path: ''` -> `AdminLayoutComponent`.
  - **children**:
    - `'contacts'` -> `AdminContactsComponent`,
    - `''` -> redireccion a `contacts`.

### `src/app/features/admin/admin.module.ts`
- **Declara:**
  - `AdminLayoutComponent`,
  - `AdminContactsComponent`,
  - `AdminContactsToolbarComponent`,
  - `AdminContactsTableComponent`,
  - `ContactFormDialogComponent`,
  - `ConfirmDeleteDialogComponent`.
- **Importa:** `FormsModule` + PrimeNG de tabla/dialog/inputs/multiselect/tooltip.

### `src/app/features/admin/components/admin-layout/admin-layout.component.ts`
- **Rol:** shell privado de admin (header/nav/logout + contenedor de vistas hijas admin).
- **Dependencias DI:** `AuthService`, `Router`.
- **Metodo:** `logout()` -> cierra sesion y navega a `/contacts`.

### `src/app/features/admin/components/admin-layout/admin-layout.component.html`
- **Contiene:**
  - marca `Phone Book`,
  - links `Contacts` y `Admin`,
  - boton `Logout`,
  - `<router-outlet>` hijo para renderizar `AdminContactsComponent`.

### `src/app/features/admin/components/admin-layout/admin-layout.component.scss`
- **Rol:** estilos del header/nav privado de admin.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.ts`
- **Rol:** orquestador central del CRUD.
- **Variables:**
  - datos/seleccion: `contacts`, `selectedContact`, `selectedContacts`,
  - visibilidad: `contactDialogVisible`, `deleteDialogVisible`,
  - modo: `deleteDialogMode ('single' | 'bulk')`,
  - columnas: `columns`, `selectedColumns`,
  - formulario: `formModel`, `formSubmitted`,
  - textos dialogo: `deleteDialogTitle`, `deleteDialogMessage`, `deleteDialogConfirmLabel`,
  - internos: `_contactsSub?`, `_clonedContacts`, `_contactsTableComponent?`.
- **Metodos:**
  - `ngOnInit()` -> subscribe a contactos y orden.
  - `openCreate()` -> reset + abrir formulario.
  - `save()` -> valida (`isContactBodyValid`) y crea contacto.
  - `openDelete(contact)` -> configura borrado single.
  - `openDeleteSelected()` -> configura borrado bulk.
  - `confirmDeleteDialog()` -> ejecuta single o bulk (`forkJoin`), limpia estado y notifica.
  - `onRowEditInit(contact)` -> clona fila.
  - `onRowEditSave(contact)` -> valida y persiste; rollback si invalido.
  - `onRowEditCancel(contact)` -> restaura clon.
  - `updateFormModel(model)` -> sincroniza cambios del hijo.
  - `closeFormDialog()` -> cierra modal y limpia submit.
  - `onGlobalFilterChange(value)` -> delega a tabla por `ViewChild`.
  - `_emptyForm()` y `_showSuccess(...)` (helpers privados).
  - `ngOnDestroy()` -> unsubscribe.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.html`
- integra toolbar + tabla + dialog formulario + dialog confirmacion.
- conecta todos los Inputs/Outputs del flujo admin.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.scss`
- layout base de la vista admin.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.ts`
- **Inputs:** `selectedCount`, `columns`, `selectedColumns`.
- **Outputs:** `addContact`, `deleteSelected`, `selectedColumnsChange`, `globalFilterChange`.
- **Metodos:** `onColumnsChange(...)`, `onGlobalFilterInput(...)`.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.html`
- boton Add, barra bulk condicional, buscador global y selector de columnas.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.scss`
- estilos responsive de toolbar.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.ts`
- **Inputs:** `contacts`, `selectedColumns`, `selectedContacts`.
- **Outputs:** `selectedContactsChange`, `rowEditInit`, `rowEditSave`, `rowEditCancel`, `deleteContact`.
- **Interno:** `_dataTable?` (`ViewChild('dt')`).
- **Metodos:**
  - `applyGlobalFilter(value)` -> filtro global PrimeNG.
  - `clearSelectionOnFilter()` -> limpia seleccion al filtrar.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.html`
- `p-table` con seleccion multiple, columnas dinamicas, edicion inline y acciones por fila.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.scss`
- estilos de tabla, filas alternas y acciones.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.ts`
- **Inputs:** `visible`, `formModel`, `formSubmitted`.
- **Outputs:** `visibleChange`, `save`, `cancel`, `formModelChange`.
- **Metodos:**
  - `close()`,
  - `updateField(field, value)`,
  - `isFieldInvalid(field)`,
  - `getFieldError(field)`,
  - `getFieldLabel(field)`.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.html`
- formulario de contacto con errores por campo y acciones Save/Cancel.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.scss`
- estilos de grilla de formulario y estados de error.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.ts`
- **Inputs:** `visible`, `title`, `message`, `confirmLabel`.
- **Outputs:** `visibleChange`, `confirm`.
- **Rol:** presentacional; la logica de borrado vive en el contenedor.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.html`
- modal de confirmacion con botones Cancel/Confirm.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.scss`
- estilos del modal de confirmacion.

---

## 9) Assets y estilos globales

### `src/assets/styles/_variables.scss`
- tokens SCSS de color, espaciado, bordes, radios y sombras.
- consumido por estilos globales y componentes.

### `src/styles.scss`
- hoja de estilo global:
  - base tipografica/layout general,
  - overrides visuales para PrimeNG/dialogs/tablas.

### `src/assets/default-user.svg`
- avatar fallback para contactos.

### `src/assets/.gitkeep`
- mantiene la carpeta `assets` versionada en git.

### `src/favicon.ico`
- icono de la pestana del navegador.

---

## 10) Resumen de flujo funcional completo

1. Arranca Angular (`index.html` + `main.ts` + `AppModule`).
2. Router raiz decide modulo por URL.
3. Auth controla acceso admin con `authGuard`.
4. `ContactService` mantiene estado reactivo de contactos y habla con backend mock.
5. `AppComponent` solo hospeda `p-toast` + `router-outlet`.
6. En zona publica, `PublicLayoutComponent` monta header/nav/logout y dentro renderiza `ContactListComponent`.
7. Public muestra listado/filtros/perfil (solo lectura + copy).
8. En zona admin, `AdminLayoutComponent` monta header/nav/logout y dentro renderiza `AdminContactsComponent` (CRUD).
9. Toasts comunican feedback global.
10. Estilos globales + assets cierran la experiencia visual.

---

## 11) Desarrollo detallado (archivo por archivo)

Esta seccion amplía la guia anterior con mas profundidad tecnica.  
En cada archivo se explica: flujo real, exportaciones, variables, metodos, entradas/salidas y conexiones.

### `src/index.html` (detalle)
- **Flujo real:** el navegador carga este archivo antes de que exista Angular. Aqui todavia no hay componentes vivos; solo HTML base.
- **Elementos clave y por que importan:**
  - `<base href="/">`: permite que Angular Router interprete URLs internas sin recargar servidor en cada ruta.
  - `<app-root></app-root>`: marcador donde Angular insertara `AppComponent`.
  - `<link rel="icon" href="favicon.ico">`: conecta el icono de pestana.
- **Conexiones:**
  - entrada de todo el frontend,
  - salida hacia `main.ts` cuando el bundle se ejecuta.

### `src/main.ts` (detalle)
- **Flujo real:**
  1. Importa plataforma browser.
  2. Hace bootstrap de `AppModule`.
  3. Si algo falla en bootstrap, lo captura y lo imprime en consola.
- **Llamadas importantes:**
  - `platformBrowserDynamic().bootstrapModule(AppModule)`:
    - inicializa inyector raiz,
    - compila y monta modulo raiz,
    - arranca ciclo de vida Angular.
  - `.catch((err) => console.error(err))`:
    - evita fallos silenciosos en inicio.

### `src/app/app.module.ts` (detalle)
- **Responsabilidad:** ensamblar el nucleo de la aplicacion.
- **Imports con efecto funcional:**
  - `BrowserModule`: base para app web.
  - `BrowserAnimationsModule`: requerido por varios componentes PrimeNG.
  - `HttpClientModule`: habilita servicios HTTP.
  - `HttpClientInMemoryWebApiModule.forRoot(...)`: intercepta llamadas HTTP y responde desde memoria.
  - `ToastModule`: habilita `<p-toast>`.
  - `AppRoutingModule`: activa rutas globales.
- **Providers:**
  - `MessageService`: motor para emitir notificaciones toast.
- **Conexiones clave:**
  - usa `InMemoryDataService` para mock backend,
  - deja lista la infraestructura que consumirán `ContactService`, `AppToastService`, UI de rutas.

### `src/app/app-routing.module.ts` (detalle)
- **Rol:** enrutar por contexto funcional (public/auth/admin).
- **Tabla de decisiones:**
  - URL `''` -> carga `PublicModule`.
  - URL `'login'` -> carga `AuthModule`.
  - URL `'admin'` -> evalua `authGuard`; si pasa, carga `AdminModule`.
- **Impacto real:**
  - reduce bundle inicial por lazy loading,
  - separa responsabilidades por feature,
  - centraliza seguridad de ruta privada.

### `src/app/app.component.ts` (detalle actual)
- **Rol actual:** clase minima sin estado.
- **Que NO hace ya:**
  - no maneja login/logout,
  - no dibuja navbar,
  - no se suscribe a `AuthService`.
- **Por que es correcto:** esa logica fue movida a `PublicLayoutComponent` para desacoplar shell global de shell publico.

### `src/app/app.component.html` (detalle actual)
- **Contenido exacto:**
  - `<p-toast position="top-right"></p-toast>`
  - `<router-outlet></router-outlet>`
- **Interpretacion:**
  - `p-toast` queda siempre disponible para cualquier feature.
  - `router-outlet` es el punto unico de render de rutas de primer nivel.

### `src/app/app.component.scss` (detalle actual)
- **Contenido minimo:** `:host { display: block; }`
- **Efecto:** garantiza que el componente raiz sea elemento bloque y no rompa layout.

### `src/app/app.component.spec.ts` (detalle)
- **Objetivo del test:** verificar que el root se crea y renderiza.
- **Valor practico:** detecta regresiones tempranas de wiring basico de app.

### `src/app/core/guards/auth.guard.ts` (detalle)
- **Funcion exportada:** `authGuard` (`CanActivateFn`).
- **Flujo exacto:**
  1. Inyecta `AuthService` y `Router`.
  2. Consulta `authService.isAuthenticated()`.
  3. Si `true`: devuelve `true`.
  4. Si `false`: `router.navigate(['/login'])` y devuelve `false`.
- **Efectos:**
  - protege `/admin`,
  - fuerza paso por login si no hay sesion.

### `src/app/core/api/mocks/mock-contacts.ts` (detalle)
- **Exporta:** `CONTACTS`.
- **Rol:** dataset inicial del backend simulado.
- **Conexiones:**
  - consumido por `InMemoryDataService.createDb()`,
  - se transforma en respuestas HTTP de `api/contacts`.

### `src/app/services/in-memory-data.service.ts` (detalle)
- **Clase exportada:** `InMemoryDataService`.
- **Metodo `createDb()`:**
  - devuelve objeto con colecciones mock (`{ contacts }`).
  - usa copia de `CONTACTS` para no mutar la constante fuente.
- **Metodo `genId(contacts)`:**
  - calcula el siguiente id para POST.
  - si lista vacia, devuelve 1.
- **Conexiones:**
  - cableado en `AppModule`,
  - hace transparente el mock para `HttpClient`.

### `src/app/shared/interfaces/contact.interface.ts` (detalle)
- **`Contact`:** entidad principal del dominio.
- **`ContactSortField`:** restringe campos permitidos para ordenar.
- **`ContactSortOption`:** estructura para dropdown de orden.
- **`ContactColumnOption`:** estructura para columnas dinamicas en admin.
- **Valor tecnico:** evita errores de typo y mejora autocompletado/refactor.

### `src/app/shared/utils/contact-validation.ts` (detalle)
- **Constantes:**
  - `CONTACT_EMAIL_PATTERN`: valida formato de correo.
  - `CONTACT_PHONE_PATTERN`: valida formato de telefono.
- **Funciones y uso real:**
  - `isContactEmailValid(value)` -> usada para validar campo email.
  - `isContactPhoneValid(value)` -> usada para validar campo phone.
  - `isContactBodyValid(contact)` -> valida bloque completo antes de crear/actualizar.
  - `getContactFormFieldLabel(field)` -> etiqueta legible por campo.
  - `getContactFormFieldError(...)` -> mensaje de error contextual, dependiente de `formSubmitted`.
- **Regla importante:** `address` no es obligatoria.

### `src/app/services/auth.service.ts` (detalle)
- **Estado interno:**
  - `_isAuthenticated$` (`BehaviorSubject<boolean>`) inicia en `false`.
  - `_adminUsername`, `_adminPassword` (credenciales demo).
- **Salida publica:**
  - `isAuthenticated$` observable de solo lectura.
- **Metodos:**
  - `login(username, password)`:
    - compara credenciales,
    - hace `next(isValid)`,
    - retorna `Observable<boolean>`.
  - `logout()`:
    - hace `next(false)`.
  - `isAuthenticated()`:
    - retorna valor actual sincrono (ideal para guard).
- **Conexiones:** login component + public layout + guard.

### `src/app/services/contact.service.ts` (detalle)
- **Estado y constantes:**
  - `_contactsUrl = 'api/contacts'`
  - `_contacts$` (cache reactiva)
  - `_httpOptions` (headers JSON)
- **Constructor:** llama `_loadContacts()` para tener datos desde inicio.
- **API publica:**
  - `getContacts()` -> stream vivo de contactos.
  - `addContact(contact)` -> POST y recarga lista.
  - `updateContact(contact)` -> PUT y recarga.
  - `deleteContact(id)` -> DELETE y recarga.
- **Infra privada:**
  - `_loadContacts()` -> GET + `next`.
  - `_refreshContacts<T>()` -> operador `tap` reutilizable.
  - `_handleError<T>()` -> fallback `of(...)`.
- **Comportamiento importante:**
  - cada mutacion recarga lista completa para mantener consistencia entre vistas public/admin.

### `src/app/services/app-toast.service.ts` (detalle)
- **Fachada de mensajes:**
  - `success`, `error`, `info` llaman a `_show`.
  - `_show` delega en `MessageService.add(...)`.
- **Objetivo:** unificar la forma de notificar en toda la app.

### `src/app/services/clipboard-toast.service.ts` (detalle)
- **Metodo central:** `copyWithFeedback(value, label)`.
- **Flujo:**
  1. limpia texto con `trim`,
  2. si vacio, corta,
  3. intenta copiar con `navigator.clipboard.writeText`,
  4. muestra toast de exito/fallback.
- **Conexiones:** `contact-card` y `contact-profile-dialog`.

### `src/app/features/auth/auth-routing.module.ts` (detalle)
- **Ruta unica interna:** `''` -> `LoginComponent`.
- **Conexion con raiz:** se activa cuando el root route carga `AuthModule` en `/login`.

### `src/app/features/auth/auth.module.ts` (detalle)
- **Declara:** `LoginComponent`.
- **Importa:**
  - `FormsModule` (ngModel),
  - modulos PrimeNG de card/input/boton,
  - `AuthRoutingModule`.

### `src/app/features/auth/components/login/login.component.ts` (detalle)
- **Variables:**
  - `username`, `password` (estado form),
  - `errorMessage` (feedback visual).
- **Metodo `login()`:**
  - llama `AuthService.login(...)`,
  - si falla: mensaje de error,
  - si ok: limpia error, toast y navega a `/admin/contacts`.
- **Efecto global:** cambia estado de sesion que consumen guard/layout.

### `src/app/features/auth/components/login/login.component.html` (detalle)
- **Bindings:**
  - `[(ngModel)]` en user/password.
  - `*ngIf="errorMessage"` para error.
- **Evento:** boton submit ejecuta `login()`.

### `src/app/features/auth/components/login/login.component.scss` (detalle)
- **Rol:** estilos del card/form, labels e indicador de error.

### `src/app/features/public/public-routing.module.ts` (detalle)
- **Estructura actual:**
  - route padre `''` usa `PublicLayoutComponent`.
  - children:
    - `''` -> redirect `contacts`,
    - `'contacts'` -> `ContactListComponent`.
- **Beneficio:** un shell publico reutilizable para todas las rutas publicas.

### `src/app/features/public/public.module.ts` (detalle)
- **Declaraciones:**
  - `PublicLayoutComponent`,
  - `ContactListComponent`,
  - `ContactListFiltersComponent`,
  - `ContactCardComponent`,
  - `ContactProfileDialogComponent`.
- **Imports clave:**
  - `FormsModule` para ngModel,
  - PrimeNG para listados, filtros, tarjetas, dialogos, tooltips, skeleton.

### `src/app/features/public/components/public-layout/public-layout.component.ts` (detalle)
- **Estado:**
  - `isAuthenticated` para render condicional de menu.
  - `_authSub?` para limpiar suscripcion.
- **Metodos:**
  - `ngOnInit()` -> subscribe a `AuthService.isAuthenticated$`.
  - `logout()` -> cierra sesion y redirige a `/contacts`.
  - `ngOnDestroy()` -> libera suscripcion.
- **Rol arquitectonico:** reemplaza el antiguo shell de `AppComponent`.

### `src/app/features/public/components/public-layout/public-layout.component.html` (detalle)
- **Partes:**
  - header con marca,
  - menu con `Contacts`, `Admin`, `Login/Logout`,
  - `<router-outlet>` interno para vistas hijas publicas.
- **Directivas/eventos:**
  - `routerLink`, `routerLinkActive`,
  - `*ngIf` para auth-aware links,
  - `(click)="logout()"`.

### `src/app/features/public/components/public-layout/public-layout.component.scss` (detalle)
- **Define:**
  - estructura de alto nivel (`.top`, `.content`),
  - comportamiento responsive,
  - estilos de links activos y boton logout.

### `src/app/features/public/components/contact-list/contact-list.component.ts` (detalle)
- **Variables de estado:**
  - `contacts`: fuente original.
  - `filteredContacts`: salida filtrada/ordenada.
  - `selectedContact`: contacto activo del modal.
  - `profileVisible`: visibilidad modal.
  - `loading`: skeleton vs data.
  - `searchTerm`: texto de busqueda.
  - `selectedSort`: criterio activo.
  - `sortOptions`: opciones del selector.
  - `_contactsSub?`: suscripcion de datos.
- **Metodos y efectos:**
  - `ngOnInit()` -> subscribe a stream de contactos, aplica filtros iniciales.
  - `onSearchChange(value)` -> actualiza texto y recomputa listado.
  - `onSortChange(value)` -> cambia orden y recomputa.
  - `clearFilters()` -> reset de busqueda y orden por defecto.
  - `openProfile(contact)` -> abre dialogo.
  - `closeProfile()` -> cierra dialogo y limpia seleccion.
  - `ngOnDestroy()` -> cleanup.
  - `_applyFilters()`:
    - filtra por nombre/apellido/nombre completo/telefono,
    - ordena por campo seleccionado.

### `src/app/features/public/components/contact-list/contact-list.component.html` (detalle)
- **Flujo visual:**
  1. muestra filtros,
  2. si `loading`, renderiza skeletons,
  3. si no, muestra `p-dataView` paginado,
  4. si no hay resultados, muestra estado vacio,
  5. maneja modal de perfil.
- **Eventos clave:** filtros, `viewProfile`, `close`, limpiar filtros.

### `src/app/features/public/components/contact-list/contact-list.component.scss` (detalle)
- **Rol:** grilla responsive, estilos de skeleton y empty state.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.ts` (detalle)
- **Inputs:** `searchTerm`, `selectedSort`, `sortOptions`.
- **Outputs:** `searchTermChange`, `selectedSortChange`.
- **Rol:** componente tonto (presentacional), sin logica de negocio.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.html` (detalle)
- input de busqueda y dropdown de orden con enlace bidireccional via emisiones.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.scss` (detalle)
- panel responsive de filtros y espaciado.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.ts` (detalle)
- **Input:** `contact`.
- **Output:** `viewProfile`.
- **Variables:**
  - `defaultAvatar`,
  - `_namePalette`,
  - `_tagSeverities`.
- **Metodos:**
  - `openProfile()` -> avisa al padre que abra dialogo.
  - `getNameColor()` -> color dinamico por id.
  - `getTagSeverity()` -> estilo dinamico de tag.
  - `copyValue(...)` -> copy + toast.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.html` (detalle)
- card de contacto con:
  - nombre + job title,
  - phone/email con botones copy,
  - boton `View profile`.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.scss` (detalle)
- estilo de tarjeta, cabecera, lineas de info y boton final.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.ts` (detalle)
- **Inputs:** `visible`, `contact`.
- **Outputs:** `visibleChange`, `close`.
- **Variables internas:**
  - `defaultAvatar`,
  - `_namePalette`,
  - `_tagSeverities`.
- **Metodo `onClose()`:** sincroniza cierre y notifica al padre.
- **Metodo `copyValue(...)`:** delega copia y feedback.
- **Metodo `getNameColor()`:** devuelve color consistente por contacto.
- **Metodo `getTagSeverity()`:** devuelve severidad consistente para el `jobTitle`.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.html` (detalle)
- dialogo modal con datos extendidos (phone/email/address) y acciones copy/back.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.scss` (detalle)
- estilos de cabecera, lineas de dato y pie de acciones.

### `src/app/features/admin/admin-routing.module.ts` (detalle)
- rutas internas con shell privado:
  - route padre `''` usa `AdminLayoutComponent`,
  - children:
    - `'contacts'` -> `AdminContactsComponent`,
    - `''` -> redirect a `contacts`.

### `src/app/features/admin/admin.module.ts` (detalle)
- declara `AdminLayoutComponent`, los componentes admin y dialogos.
- importa formularios + modulos PrimeNG de tabla/dialog/control.

### `src/app/features/admin/components/admin-layout/admin-layout.component.ts` (detalle)
- **Metodo `logout()`:**
  - llama `AuthService.logout()`,
  - redirige a `/contacts`.
- **Rol arquitectonico:** shell privado del modulo admin (equivalente al shell publico, pero para rutas protegidas).

### `src/app/features/admin/components/admin-layout/admin-layout.component.html` (detalle)
- **Partes:**
  - header con marca,
  - menu con `Contacts`, `Admin` y boton `Logout`,
  - `<router-outlet>` interno para vistas hijas admin.

### `src/app/features/admin/components/admin-layout/admin-layout.component.scss` (detalle)
- **Define:**
  - estilos de `.top`, `.topInner`, `.nav`,
  - comportamiento responsive del header de admin.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.ts` (detalle)
- **Estado de pagina:**
  - dataset: `contacts`,
  - seleccion: `selectedContact`, `selectedContacts`,
  - visibilidad dialogs: `contactDialogVisible`, `deleteDialogVisible`,
  - modo borrado: `deleteDialogMode`,
  - columnas: `columns`, `selectedColumns`,
  - formulario: `formModel`, `formSubmitted`,
  - textos dinamicos de confirmacion,
  - snapshots de edicion: `_clonedContacts`,
  - acceso a tabla hija: `_contactsTableComponent`.
- **Metodos clave:**
  - `openCreate()` + `save()` (alta),
  - `openDelete()`, `openDeleteSelected()`, `confirmDeleteDialog()` (borrado single/bulk),
  - `onRowEditInit/Save/Cancel` (edicion inline con rollback),
  - `onGlobalFilterChange()` (filtro global delegado por `ViewChild`).
- **Conexiones:** `ContactService`, `AppToastService`, validadores, toolbar/tabla/dialogos.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.html` (detalle)
- compone y conecta todo el flujo admin por Inputs/Outputs:
  - toolbar emite acciones globales,
  - tabla emite seleccion/edicion/borrado,
  - dialogo form emite cambios de modelo y submit,
  - dialogo confirm emite aceptar/cancelar.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.scss` (detalle)
- layout de la vista admin.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.ts` (detalle)
- **Inputs:** contador seleccion, columnas disponibles y activas.
- **Outputs:** add, delete selected, selectedColumnsChange, globalFilterChange.
- **Metodos:** parsea input de busqueda y propaga eventos.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.html` (detalle)
- barra superior con acciones de crear, borrar seleccionados, buscar y elegir columnas.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.scss` (detalle)
- estilos responsive de toolbar y barra bulk.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.ts` (detalle)
- **Inputs:** datos, columnas visibles, seleccion actual.
- **Outputs:** cambios de seleccion y ciclo de edicion por fila.
- **Interno:** `_dataTable` para filtro global PrimeNG.
- **Metodos:**
  - `applyGlobalFilter(value)`,
  - `clearSelectionOnFilter()`.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.html` (detalle)
- `p-table` editable por filas con:
  - seleccion multiple,
  - columnas dinamicas,
  - acciones editar/guardar/cancelar/eliminar.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.scss` (detalle)
- estilos de wrapper, zebra rows y celdas de acciones.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.ts` (detalle)
- **Inputs:** `visible`, `formModel`, `formSubmitted`.
- **Outputs:** `visibleChange`, `save`, `cancel`, `formModelChange`.
- **Metodos:**
  - `close()`,
  - `updateField(...)`,
  - `isFieldInvalid(...)`,
  - `getFieldError(...)`,
  - `getFieldLabel(...)`.
- **Comportamiento:** validacion visual controlada por `formSubmitted`.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.html` (detalle)
- formulario de contacto con mensajes por campo y acciones Save/Cancel.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.scss` (detalle)
- grilla, estilos de error e interacciones del modal.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.ts` (detalle)
- **Inputs:** visibilidad, titulo, mensaje, texto boton confirmar.
- **Outputs:** cerrar (`visibleChange`) y confirmar (`confirm`).
- **Nota:** componente presentacional; la ejecucion de borrado vive en el padre.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.html` (detalle)
- modal simple de confirmacion con botones cancelar/confirmar.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.scss` (detalle)
- estilos de mensaje y acciones.

### `src/assets/styles/_variables.scss` (detalle)
- **Rol:** fuente unica de tokens de diseño (colores, spacing, radios, etc.).
- **Impacto:** uniformidad visual entre componentes.

### `src/styles.scss` (detalle)
- **Rol:** estilos globales y overrides de PrimeNG.
- **Impacto:** reglas transversales no encapsuladas.

### `src/assets/default-user.svg` (detalle)
- avatar fallback visual para contactos.

### `src/assets/.gitkeep` (detalle)
- mantiene versionada la carpeta de assets aunque quede vacia.

### `src/favicon.ico` (detalle)
- icono mostrado por el navegador en la pestana.
