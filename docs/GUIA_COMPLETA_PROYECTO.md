# Guia completa del proyecto (paso a paso, sin repeticiones)

Esta guia explica **todo `src`** en un flujo unico de ejecucion.  
Regla de lectura: cada archivo aparece una sola vez con su funcion real, lo que exporta, sus variables/metodos y sus conexiones.

---

## 1) Arranque de la aplicacion

### `src/index.html`
- **Rol:** documento host de la SPA.
- **Clave:** contiene `<app-root>` (ancla donde Angular monta la app), `<base href="/">` (routing) y favicon.
- **Exporta/metodos:** no aplica (archivo estatico).
- **Detalle minimo:**
  - el navegador parsea este archivo antes de cargar Angular,
  - `<base href="/">` evita rutas rotas al recargar en rutas internas,
  - si `<app-root>` falta, Angular inicia pero no tiene donde renderizar.

### `src/main.ts`
- **Rol:** entry point ejecutable.
- **Hace:** `platformBrowserDynamic().bootstrapModule(AppModule)` y captura errores con `.catch(...)`.
- **Conecta con:** `src/app/app.module.ts`.
- **Detalle minimo:**
  - crea el contexto inicial de inyeccion de dependencias,
  - dispara el ciclo de vida Angular completo (`ngOnInit`, render, change detection),
  - cualquier error de bootstrap queda visible en consola para diagnostico temprano.

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
- **Detalle minimo:**
  - asegura que el cableado del modulo raiz no se rompio,
  - detecta regresiones de plantilla en el componente host.

---

## 3) Capa core y datos mock

### `src/app/core/guards/auth.guard.ts`
- **Exporta:** `authGuard` (`CanActivateFn`).
- **Flujo:** si `AuthService.isAuthenticated()` es `true`, deja pasar; si no, redirige a `/login` y bloquea ruta.

### `src/app/core/api/mocks/mock-contacts.ts`
- **Exporta:** `CONTACTS: Contact[]` (dataset semilla).
- **Detalle minimo:**
  - define el estado inicial que ve el usuario en listado publico/admin,
  - sirve como referencia de forma de datos durante desarrollo local.

### `src/app/services/in-memory-data.service.ts`
- **Exporta:** `InMemoryDataService`.
- **Metodos:**
  - `createDb()` -> expone `{ contacts }` desde `CONTACTS`.
  - `genId(contacts)` -> siguiente id incremental.
- **Conexion:** backend simulado para todas las llamadas `api/contacts`.
- **Detalle minimo:**
  - `createDb()` expone colecciones como si fueran recursos REST,
  - `genId()` evita colisiones simples al crear nuevos registros,
  - permite probar CRUD completo sin backend real.

---

## 4) Modelos compartidos y validacion

### `src/app/shared/interfaces/contact.interface.ts`
- **Exporta:**
  - `interface Contact`,
  - `type ContactSortField`,
  - `interface ContactSortOption`,
  - `interface ContactColumnOption`.
- **Rol:** contrato tipado comun para servicios y componentes.
- **Detalle minimo:**
  - evita inconsistencias de nombres de campos entre capas,
  - mejora autocompletado y refactor seguro.

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
- **Detalle minimo:**
  - combina lectura reactiva (`isAuthenticated$`) para vistas y sincronica para guard,
  - centraliza la logica de sesion para no duplicarla en componentes.

### `src/app/services/contact.service.ts`
- **Exporta:** `ContactService`.
- **Variables:**
  - `_contactsUrl = 'api/contacts'`,
  - `_contacts$ = new BehaviorSubject<Contact[]>([])`,
  - `_httpOptions` (headers JSON).
- **Constructor:** llama `_loadContacts()`.
- **Metodos publicos:**
  - `getContacts()` -> stream de contactos (entrega copias por item para evitar mutaciones compartidas entre vistas).
  - `addContact(contact)` -> POST + refresh.
  - `updateContact(contact)` -> PUT a `api/contacts/:id` + refresh.
  - `deleteContact(id)` -> DELETE + refresh.
- **Metodos privados:**
  - `_loadContacts()` -> GET y `next` del subject con copia de datos.
  - `_refreshContacts<T>()` -> `tap` para recargar tras mutacion.
  - `_handleError<T>(...)` -> fallback con `of(...)` o relanza error segun el caso.
- **RxJS usado:** `BehaviorSubject`, `tap`, `catchError`, `of`, `map`, `throwError`.
- **Detalle minimo:**
  - mantiene cache caliente compartida entre vistas,
  - cada mutacion recarga para mantener consistencia global,
  - retorna copias para evitar mutaciones accidentales desde UI.

### `src/app/services/app-toast.service.ts`
- **Exporta:** `AppToastService`.
- **Metodos:**
  - `success(summary, detail)`,
  - `error(summary, detail)`,
  - `info(summary, detail)`,
  - `_show(severity, summary, detail)` (privado).
- **Conexion:** centraliza toasts PrimeNG usando `MessageService`.
- **Detalle minimo:**
  - estandariza severidades y formato de mensajes,
  - evita repetir llamadas directas a `MessageService` en cada componente.

### `src/app/services/clipboard-toast.service.ts`
- **Exporta:** `ClipboardToastService`.
- **Metodo:** `copyWithFeedback(value, label)`.
  - limpia valor,
  - copia al portapapeles si hay API,
  - muestra toast de feedback.
- **Consumidores:** tarjetas y modal de perfil publico.
- **Detalle minimo:**
  - encapsula casos de API de clipboard no disponible,
  - deja una API unica para copiar + notificar.

---

## 6) Feature Auth (login)

### `src/app/features/auth/auth-routing.module.ts`
- **Rol:** ruta interna del modulo auth.
- **Ruta:** `''` -> `LoginComponent`.
- **Detalle minimo:** al cargar `/login`, el modulo resuelve esta ruta por defecto.

### `src/app/features/auth/auth.module.ts`
- **Declara:** `LoginComponent`.
- **Importa:** `FormsModule`, `AuthRoutingModule` y PrimeNG de formulario/card.
- **Detalle minimo:** concentra dependencias de autenticacion sin mezclar concernes de otras features.

### `src/app/features/auth/components/login/login.component.ts`
- **Variables:** `username`, `password`, `errorMessage`.
- **Metodo `login()`:**
  - llama `AuthService.login(...)`,
  - si invalido: setea `errorMessage`,
  - si valido: limpia error, toast bienvenida y navega a `/admin/contacts`.

### `src/app/features/auth/components/login/login.component.html`
- **Bindings:** `[(ngModel)]` en usuario/password, `*ngIf="errorMessage"`.
- **Evento:** boton `Sign in` -> `login()`.
- **Detalle minimo:**
  - la vista solo refleja estado y emite acciones,
  - la decision de autenticar y navegar vive en el `.ts`.

### `src/app/features/auth/components/login/login.component.scss`
- **Rol:** estilos del formulario y del mensaje de error.
- **Detalle minimo:**
  - refuerza jerarquia visual del card,
  - mejora legibilidad de estados de error.

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
- **Detalle minimo:** separa contenedores con estado de componentes presentacionales.

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
- **Detalle minimo:**
  - header/nav se mantiene estable mientras cambia la vista hija,
  - `router-outlet` evita recrear todo el layout en cada navegacion interna.

### `src/app/features/public/components/public-layout/public-layout.component.scss`
- **Rol:** estilos del layout publico (header/top nav/content responsive).
- **Dependencia SCSS:** `@use 'assets/styles/variables' as *`.
- **Bloques clave:** `.top`, `.topInner`, `.nav`, `.content`, `.contentInner`.
- **Detalle minimo:**
  - define layout macro de la pantalla publica,
  - contempla ajustes responsive para navegacion.

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
- **Detalle minimo:**
  - expresa estados de render (cargando, con datos, vacio),
  - concentra eventos de filtros/cards/dialog.

### `src/app/features/public/components/contact-list/contact-list.component.scss`
- estilos de layout/grid y estados visuales loading/empty.
- **Detalle minimo:**
  - organiza densidad visual de tarjetas,
  - mantiene lectura clara en distintos anchos.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.ts`
- **Inputs:** `searchTerm`, `selectedSort`, `sortOptions`.
- **Outputs:** `searchTermChange`, `selectedSortChange`.
- **Rol:** componente presentacional de filtros.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.html`
- input de busqueda y dropdown de orden con `ngModel` y `ngModelChange`.
- **Detalle minimo:** emite cambios al padre; no aplica logica de filtrado local.

### `src/app/features/public/components/contact-list/components/contact-list-filters/contact-list-filters.component.scss`
- estilos responsive del bloque de filtros.
- **Detalle minimo:** prioriza alineacion y uso rapido de controles.

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
- **Detalle minimo:** expone acciones atomicas (`copy`, `viewProfile`) sin mezclar reglas de negocio.

### `src/app/features/public/components/contact-list/components/contact-card/contact-card.component.scss`
- estilos visuales de card y lineas de informacion.
- **Detalle minimo:** marca jerarquia visual de nombre, rol y datos de contacto.

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
- **Detalle minimo:** controlado por estado externo (`visible`) para mantener una sola fuente de verdad.

### `src/app/features/public/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.scss`
- estilos del modal de perfil.
- **Detalle minimo:** mejora legibilidad de secciones y acciones del modal.

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
- **Detalle minimo:** encapsula todo el stack CRUD admin en un modulo lazy aislado.

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
- **Detalle minimo:** implementa shell privado persistente para rutas de administracion.

### `src/app/features/admin/components/admin-layout/admin-layout.component.scss`
- **Rol:** estilos del header/nav privado de admin.
- **Detalle minimo:** mantiene consistencia visual con la zona publica para UX uniforme.

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
  - `onRowEditSave(contact)` -> valida y persiste; rollback si invalido o si falla backend, con toast de error.
  - `onRowEditCancel(contact)` -> restaura clon.
  - `updateFormModel(model)` -> sincroniza cambios del hijo.
  - `closeFormDialog()` -> cierra modal y limpia submit.
  - `onGlobalFilterChange(value)` -> delega a tabla por `ViewChild`.
  - `_emptyForm()` y `_showSuccess(...)` (helpers privados).
  - `ngOnDestroy()` -> unsubscribe.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.html`
- integra toolbar + tabla + dialog formulario + dialog confirmacion.
- conecta todos los Inputs/Outputs del flujo admin.
- **Detalle minimo:**
  - conecta componentes especializados sin duplicar logica,
  - deja la persistencia y validacion en el contenedor principal.

### `src/app/features/admin/components/admin-contacts/admin-contacts.component.scss`
- layout base de la vista admin.
- **Detalle minimo:** ordena visualmente toolbar, tabla y dialogs en una sola pantalla de gestion.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.ts`
- **Inputs:** `selectedCount`, `columns`, `selectedColumns`.
- **Outputs:** `addContact`, `deleteSelected`, `selectedColumnsChange`, `globalFilterChange`.
- **Metodos:** `onColumnsChange(...)`, `onGlobalFilterInput(...)`.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.html`
- boton Add, barra bulk condicional, buscador global y selector de columnas.
- **Detalle minimo:** concentra acciones globales para reducir friccion operativa.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-toolbar/admin-contacts-toolbar.component.scss`
- estilos responsive de toolbar.
- **Detalle minimo:** asegura que acciones primarias sigan visibles en pantallas pequenas.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.ts`
- **Inputs:** `contacts`, `selectedColumns`, `selectedContacts`.
- **Outputs:** `selectedContactsChange`, `rowEditInit`, `rowEditSave`, `rowEditCancel`, `deleteContact`.
- **Interno:** `_dataTable?` (`ViewChild('dt')`).
- **Metodos:**
  - `applyGlobalFilter(value)` -> filtro global PrimeNG.
  - `clearSelectionOnFilter()` -> limpia seleccion al filtrar.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.html`
- `p-table` con seleccion multiple, columnas dinamicas, edicion inline y acciones por fila.
- **Detalle minimo:**
  - tabla orientada a interaccion rica (seleccion, edicion, acciones),
  - la decision de guardar/cancelar se delega al padre via eventos.

### `src/app/features/admin/components/admin-contacts/components/admin-contacts-table/admin-contacts-table.component.scss`
- estilos de tabla, filas alternas y acciones.
- **Detalle minimo:** aumenta escaneabilidad y claridad de controles por fila.

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
- **Detalle minimo:** prioriza feedback por campo para reducir errores de captura.

### `src/app/features/admin/components/dialogs/contact-form-dialog/contact-form-dialog.component.scss`
- estilos de grilla de formulario y estados de error.
- **Detalle minimo:** optimiza legibilidad de labels, inputs y mensajes de validacion.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.ts`
- **Inputs:** `visible`, `title`, `message`, `confirmLabel`.
- **Outputs:** `visibleChange`, `confirm`.
- **Rol:** presentacional; la logica de borrado vive en el contenedor.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.html`
- modal de confirmacion con botones Cancel/Confirm.
- **Detalle minimo:** exige confirmacion explicita antes de acciones destructivas.

### `src/app/features/admin/components/dialogs/confirm-delete-dialog/confirm-delete-dialog.component.scss`
- estilos del modal de confirmacion.
- **Detalle minimo:** refuerza contraste visual entre accion segura y accion destructiva.

---

## 9) Assets y estilos globales

### `src/assets/styles/_variables.scss`
- tokens SCSS de color, espaciado, bordes, radios y sombras.
- consumido por estilos globales y componentes.
- **Detalle minimo:** centraliza decisiones de diseno para evitar valores hardcodeados dispersos.

### `src/styles.scss`
- hoja de estilo global:
  - base tipografica/layout general,
  - overrides visuales para PrimeNG/dialogs/tablas.
- **Detalle minimo:** punto unico para reglas transversales que no deben depender de encapsulacion por componente.

### `src/assets/default-user.svg`
- avatar fallback para contactos.
- **Detalle minimo:** evita imagen rota cuando un contacto no tiene foto propia.

### `src/assets/.gitkeep`
- mantiene la carpeta `assets` versionada en git.
- **Detalle minimo:** preserva estructura del proyecto aunque el directorio este temporalmente vacio.

### `src/favicon.ico`
- icono de la pestana del navegador.
- **Detalle minimo:** mejora reconocimiento visual de la app en pestanas e historial.

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

## 11) Criterio de cobertura (completo y sin duplicados)

Cada archivo se explica una sola vez en las secciones **1 a 9** con este criterio:

- **Para `.ts`:**
  - rol real en ejecucion,
  - exportaciones,
  - variables/estado relevante,
  - funciones/metodos (publicos y privados si afectan flujo),
  - entradas/salidas (`@Input`, `@Output`, retornos),
  - dependencias y conexiones con otros archivos.
- **Para `.html`:**
  - estructura visual,
  - bindings/directivas/eventos,
  - comunicacion con su `.ts` y con componentes hijos/padre.
- **Para `.scss`:**
  - bloques principales que estiliza,
  - impacto visual/responsive y dependencias de variables.
- **Para assets/config estaticos (`.svg`, `.ico`, `.gitkeep`, `index.html`):**
  - funcion concreta en runtime o versionado,
  - razon de existencia en el proyecto.

`10) Resumen de flujo` es solo un mapa global para orientarse rapido; el detalle canonico sigue estando en `1-9`.