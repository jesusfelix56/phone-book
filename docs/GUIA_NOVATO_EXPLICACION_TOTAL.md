# Guia total para novatos - Phone Book App

Esta guia explica **todo el flujo** de la app, de inicio a fin, usando los archivos reales del proyecto.  
Objetivo: que una persona nueva pueda presentar como funciona, por que esta hecho asi, y que hace cada parte.

---

## 1) Que tipo de app es esta

Es una app Angular para gestionar contactos:
- Lista contactos con busqueda, ordenamiento y paginacion.
- Muestra perfil detallado por contacto.
- Permite crear, editar y eliminar contactos solo si el usuario esta autenticado como admin.
- Usa datos mockeados en memoria (no backend real) mediante `angular-in-memory-web-api`.
- Usa PrimeNG para componentes UI (dialogos, botones, cards, toast, etc.).

---

## 2) Estructura general que debes saber

- `src/main.ts`: punto de arranque de Angular.
- `src/index.html`: HTML base donde Angular monta la app.
- `src/styles.scss`: estilos globales y overrides.
- `src/app/app.module.ts`: modulo raiz con imports globales.
- `src/app/app-routing.module.ts`: rutas principales lazy-loaded.
- `src/app/features/auth/*`: modulo de login.
- `src/app/features/contacts/*`: modulo principal de contactos.
- `src/app/services/*`: logica reutilizable (auth, datos, toasts, view-model).
- `src/app/shared/*`: tipos e utilidades de validacion.
- `src/app/core/api/mocks/mock-contacts.ts`: datos iniciales.
- `src/assets/styles/_variables.scss`: variables de diseno.

---

## 3) Flujo completo de ejecucion (de extremo a extremo)

1. El navegador carga `index.html`.
2. `main.ts` ejecuta `platformBrowserDynamic().bootstrapModule(AppModule)`.
3. `AppModule`:
   - registra HttpClient,
   - activa `HttpClientInMemoryWebApiModule` con `InMemoryDataService`,
   - activa `ToastModule`,
   - activa `AppRoutingModule`.
4. `AppComponent` renderiza:
   - `<p-toast>` (mensajes globales),
   - `<router-outlet>` (contenido de ruta).
5. Router principal:
   - `''` carga `ContactsModule`,
   - `'login'` carga `AuthModule`.
6. En contactos, la ruta base renderiza `AppLayoutComponent`; desde ahi existe vista general y vista admin protegida.
7. `ContactListComponent`:
   - se suscribe al estado de admin,
   - se suscribe a contactos desde `ContactService`,
   - filtra/ordena con `ContactsViewModelService`,
   - controla dialogos (perfil, formulario, confirmacion de borrado).
8. `ContactService` hace CRUD contra `api/contacts` (in-memory), actualiza un `BehaviorSubject`, y notifica a la UI.

---

## 4) Explicacion archivo por archivo (con decisiones)

## 4.1 Raiz de `src`

### `src/main.ts`
- Importa `platformBrowserDynamic` y `AppModule`.
- Arranca la app con `bootstrapModule(AppModule)`.
- Hace `catch(console.error)` para no silenciar errores de inicio.
- Decision: bootstrap clasico de Angular con modulo raiz.

### `src/index.html`
- Define el documento base.
- `<app-root></app-root>` es el host donde Angular inserta `AppComponent`.
- `<base href="/">` permite que el router funcione bien con rutas.

### `src/styles.scss`
- `@use 'assets/styles/variables' as *;` para compartir tokens visuales.
- Aplica `box-sizing: border-box` global.
- Quita margen default del navegador en `html, body`.
- Define estilo global de `.contact-profile-dialog` para header/content/footer del dialogo PrimeNG.
- Decision: centralizar ajustes globales para no repetir en cada componente.

### `src/assets/styles/_variables.scss`
- Define paleta (`$accent`, `$danger`, `$muted`, etc.).
- Define spacing (`$space-md`, `$space-lg`).
- Define radios y sombras.
- Decision: usar design tokens para consistencia y mantenimiento.

### `src/assets/default-user.svg`
- Avatar por defecto.
- Se usa desde `ContactUiService` (`defaultAvatar`).

### `src/favicon.ico`
- Icono del sitio en la pestana del navegador.

---

## 4.2 App shell y enrutamiento

### `src/app/app.module.ts`
- Importa modulos Angular base: `BrowserModule`, `BrowserAnimationsModule`, `HttpClientModule`.
- Monta API fake con:
  - `HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false })`.
- Importa `ToastModule` (PrimeNG).
- Importa `AppRoutingModule`.
- Provee `MessageService` (usado por toasts).
- Bootstrapea `AppComponent`.
- Decision: no depender de backend real mientras se desarrolla UI/flujo.

### `src/app/app-routing.module.ts`
- Ruta `''` lazy-load de `ContactsModule`.
- Ruta `'login'` lazy-load de `AuthModule`.
- Decision: lazy loading mejora escalabilidad y separa features.

### `src/app/app.component.ts`
- Componente raiz sin logica extra (solo shell).

### `src/app/app.component.html`
- `<p-toast position="top-right"></p-toast>`: contenedor global de notificaciones.
- `<router-outlet></router-outlet>`: zona dinamica por ruta.

### `src/app/app.component.scss`
- `:host { display: block; }` para layout estable.

### `src/app/app.component.spec.ts`
- Test 1: crea el componente correctamente.
- Test 2: valida que existe `router-outlet`.
- Decision: smoke tests basicos del shell.

---

## 4.3 Core API / mocks

### `src/app/core/api/mocks/mock-contacts.ts`
- Exporta `CONTACTS: Contact[]` con 26 registros semilla.
- Campos: `id`, `firstName`, `lastName`, `phone`, `email`, `jobTitle`, `address`.
- Decision: datos realistas para probar busqueda, ordenamiento y paginacion.

---

## 4.4 Shared (tipos y utilidades)

### `src/app/shared/interfaces/contact.interface.ts`
- `Contact`: contrato principal de entidad.
- `ContactSortField`: union de campos permitidos para ordenar.
- `ContactFormModel = Omit<Contact, 'id'>`: modelo de formulario sin id.
- Decision: tipado fuerte evita errores de runtime.

### `src/app/shared/utils/contact-validation.ts`
- Regex:
  - `emailPattern`: valida formato correo basico.
  - `phonePattern`: valida telefono con digitos y simbolos permitidos.
- `createEmptyContactForm()`: crea modelo vacio.
- `toContactFormModel(contact)`: convierte entidad a modelo de formulario.
- `isContactEmailValid`, `isContactPhoneValid`: validadores reutilizables.
- `isContactBodyValid`: valida required + formato.
- `getContactFormFieldLabel`: mapea campo a etiqueta legible.
- `getContactFormFieldError(field, formModel, formSubmitted)`:
  - no valida si no se envio/formulario no interactuado,
  - `address` es opcional,
  - required para resto de campos,
  - mensajes especificos para email/phone invalido.
- Decision: separar validacion de los componentes para mantenerlos limpios.

---

## 4.5 Servicios de aplicacion

### `src/app/services/auth.service.ts`
- Usa `BehaviorSubject<boolean>` para estado auth y `BehaviorSubject<UserRole | null>` para rol.
- `UserRole` actual: solo `'admin'`.
- Expone `isAuthenticated$`, `role$`, `isAdmin$`, `isAuthenticated()`, `isAdmin()`, `getRole()`.
- `login(username, password)`:
  - resuelve rol con `_resolveRole(...)`,
  - hoy solo acepta `admin / 123`,
  - emite estado y rol,
  - retorna `Observable<boolean>` (`of(isValid)`).
- `logout()` limpia auth y rol.
- Decision: separar autenticacion de rol para permitir proteccion por guard.

### `src/app/services/app-toast.service.ts`
- Encapsula `MessageService` de PrimeNG.
- Metodos publicos: `success`, `error`, `info`.
- `copyWithFeedback(value, label)`:
  - limpia string,
  - usa `navigator.clipboard.writeText` si existe,
  - muestra toast de confirmacion.
- `_show(...)` privado: unifica el formato del toast.
- Decision: centralizar mensajes para no duplicar codigo en componentes.

### `src/app/services/contact.service.ts`
- Fuente de verdad reactiva: `_contacts$` (`BehaviorSubject<Contact[] | null>`).
- URL API fake: `'api/contacts'`.
- Constructor llama `_loadContacts()` al iniciar.
- `getContacts()`:
  - filtra `null`,
  - clona contactos para evitar mutaciones externas.
- `addContact(contact)`:
  - POST,
  - actualiza subject agregando creado,
  - maneja error con rethrow para que componente muestre toast error.
- `updateContact(contact)`:
  - PUT a `api/contacts/:id`,
  - si respuesta es `null`, usa `contact` enviado (`resolvedContact`),
  - reemplaza contacto en `_contacts$`.
- `deleteContact(id)`:
  - DELETE,
  - remueve del arreglo local.
- `_loadContacts()`:
  - GET inicial,
  - si falla, retorna `[]`,
  - clona resultado antes de guardar.
- `_handleError(...)`:
  - helper comun para log y fallback/rethrow.
- Nota: las operaciones CRUD no validan rol dentro del servicio; la proteccion queda en routing/auth (segun decision del proyecto).
- Decision clave: mantener cache reactiva local para refrescar UI al instante tras CRUD.

### `src/app/services/contact-ui.service.ts`
- Define reglas de presentacion:
  - avatar default,
  - color de nombre segun `id % palette.length`,
  - severidad de tag segun `id % severities.length`.
- `getDisplayData(contact)` retorna todo listo para pintar en UI.
- Decision: separar logica visual calculada del template.

### `src/app/services/contact-clipboard.service.ts`
- Servicio nuevo para eliminar codigo repetido de copiado entre componentes.
- Encapsula 3 metodos:
  - `phone(contact)`,
  - `email(contact)`,
  - `address(contact)`.
- Internamente delega a `AppToastService.copyWithFeedback(...)`.
- Decision: centralizar comportamiento comun (DRY), mejorar mantenimiento y facilitar pruebas.

### `src/app/services/contacts-view-model.service.ts`
- `filterAndSortContacts(contacts, searchTerm, selectedSort)`:
  - normaliza `searchTerm`,
  - filtra por first name, last name, full name, phone,
  - ordena por campo seleccionado.
- `_normalizeValue(value)`:
  - lower case,
  - elimina tildes (`normalize('NFD') + regex diacriticos`),
  - limpia simbolos no alfanumericos,
  - compacta espacios.
- Decision: busqueda robusta (tolerante a acentos/simbolos).

### `src/app/services/in-memory-data.service.ts`
- Implementa `InMemoryDbService`.
- `createDb()` retorna `{ contacts }` usando mocks.
- `genId(contacts)` calcula nuevo id incremental.
- Decision: backend simulado con CRUD realista para desarrollo local.

---

## 4.6 Feature Auth

### `src/app/features/auth/auth.module.ts`
- Declara `LoginComponent`.
- Importa `CommonModule`, `FormsModule`, `AuthRoutingModule`.
- Importa PrimeNG de login (`CardModule`, `InputTextModule`, `ButtonModule`).

### `src/app/features/auth/auth-routing.module.ts`
- Ruta hija `''` -> `LoginComponent`.

### `src/app/features/auth/components/login/login.component.ts`
- Estado local: `username`, `password`, `errorMessage`.
- Inyecta `AuthService`, `Router`, `AppToastService`.
- `login()`:
  - llama `authService.login(...)`,
  - si invalido: setea `errorMessage`,
  - si valido: limpia error, muestra toast admin, navega a `/admin/contacts`.
- Decision: login simple y claro para demo.

### `src/app/features/auth/components/login/login.component.html`
- Card con header y texto de ayuda de credenciales.
- Hint actualizado: `usuario admin, contrasena 123`.
- Dos inputs con `[(ngModel)]`.
- Error condicional `*ngIf`.
- Boton Sign in con `(click)="login()"`.
- Eventos clave:
  - `ngModelChange` implicito via two-way binding,
  - click de submit manual.

### `src/app/features/auth/components/login/login.component.scss`
- Maqueta centrada, espaciados y colores con variables.
- `.error` usa `$danger`.

### `src/app/features/auth/components/login/login.component.spec.ts`
- Test de creacion.
- Test de credenciales invalidas (no toast, no navigate).
- Test de credenciales validas (toast + navigate).

---

## 4.7 Feature Contacts: routing y layout

### `src/app/features/contacts/contacts.module.ts`
- Declara todos los componentes de contactos:
  - layout,
  - lista,
  - filtros,
  - card,
  - profile dialog,
  - form dialog,
  - confirm delete dialog.
- Importa Forms + PrimeNG necesario (DataView, Dialog, Dropdown, Skeleton, Tooltip, etc.).

### `src/app/features/contacts/contacts-routing.module.ts`
- Ruta base `''` usa `AppLayoutComponent`.
- Redirecciona `''` a `'contacts'`.
- Ruta `'contacts'` renderiza `ContactListComponent`.
- Ruta `'admin/contacts'` renderiza `ContactListComponent` con `canActivate: [adminGuard]`.
- `adminGuard` es guard funcional (`CanActivateFn`) para evitar API en desuso.
- Decision: layout compartido + capa de proteccion por rol en routing.

### `src/app/features/contacts/components/app-layout/app-layout.component.ts`
- Mantiene `isAuthenticated` y `isAdmin` para mostrar Login/Admin/Logout segun estado.
- `ngOnInit`: se suscribe a `authService.isAuthenticated$`.
- `ngOnInit`: tambien se suscribe a `authService.isAdmin$`.
- `logout()`:
  - llama `authService.logout()`,
  - navega a `/contacts`.
- `ngOnDestroy`: desuscribe.

### `src/app/features/contacts/components/app-layout/app-layout.component.html`
- Header sticky con branding y nav.
- Muestra link `Admin` solo cuando `isAdmin === true`.
- Muestra `Login` si no autenticado y `Logout` si autenticado.
- Contiene `router-outlet` hijo.

### `src/app/features/contacts/components/app-layout/app-layout.component.scss`
- Navbar sticky con blur/backdrop.
- Responsive: mobile columna, desktop fila.
- Decision: dar sensacion de app moderna y mantener navegacion visible.

---

## 4.8 Contact list (componente orquestador)

### `src/app/features/contacts/components/contact-list/contact-list.component.ts`

Es el cerebro de la feature.

- Estado principal:
  - `contacts`, `filteredContacts`,
  - `searchTerm`, `selectedSort`,
  - `loading`, `isAdmin`,
  - control de dialogos (`profileVisible`, `dialogOpen`, `deleteDialogVisible`),
  - control de operaciones (`saving`, `deleting`),
  - `editingId`, `toDelete`, `formModel`.
- `ngOnInit()`:
  - `_subscribeAuth()` para habilitar acciones admin,
  - `_subscribeContacts()` para cargar lista.
- `onSearchChange`, `onSortChange`, `clearFilters`, `clearSearch`:
  - actualizan estado y ejecutan `_applyFilters()`.
- `openCreate()`:
  - modo creacion (`editingId = null`),
  - resetea formulario,
  - abre dialogo.
- `openEdit(contact)`:
  - pone `editingId`,
  - transforma contacto a `formModel`,
  - abre dialogo.
- `saveContact(form)`:
  - evita doble submit con `saving`,
  - decide crear o editar,
  - usa `finalize` para liberar loading,
  - en exito cierra dialogo y lanza toast,
  - en error muestra toast de fallo.
- `openDelete(contact)`, `confirmDelete()`, `closeDeleteDialog()`:
  - flujo seguro para borrado con confirmacion.
- `openProfile`, `closeProfile`:
  - control de detalle del contacto.
- getter `filteredCountLabel`:
  - pluralizacion simple (`1 result` / `n results`).
- privados:
  - `_applyFilters()` delega en `ContactsViewModelService`,
  - `_subscribeAuth()` y `_subscribeContacts()` para reactividad.
- `ngOnDestroy()` limpia subscripciones.

Decision tecnica:
- Componente contenedor (smart component) que concentra estado y orquesta componentes presentacionales hijos.

### `src/app/features/contacts/components/contact-list/contact-list.component.html`
- Renderiza titulo y subtitulo.
- Inserta `app-contact-list-filters` con:
  - Inputs: estado actual de filtros.
  - Outputs: eventos de cambios/acciones.
- Mientras `loading`: muestra skeletons.
- Cuando termina: usa `p-dataView` con paginacion.
- Repite tarjetas via `app-contact-card`.
- Maneja estado vacio con template `empty`.
- Monta 3 dialogos:
  - perfil,
  - formulario (create/edit),
  - confirmacion delete.

Eventos clave:
- Hijo -> padre por `EventEmitter` (`searchTermChange`, `onEdit`, `delete`, `save`, `onConfirm`, etc.).
- Padre -> hijo por bindings (`[visible]`, `[contact]`, `[isSaving]`, etc.).

### `src/app/features/contacts/components/contact-list/contact-list.component.scss`
- Grid responsive.
- Estilos de skeleton y empty state.
- Ajustes para mobile/desktop.

---

## 4.9 Contact list filters

### `.../contact-list-filters.component.ts`
- Inputs: `searchTerm`, `selectedSort`, `sortOptions`, `canCreateContact`, `showClearSearch`.
- Outputs: `searchTermChange`, `selectedSortChange`, `createContact`, `clearSearch`.
- Es componente "tonto" (presentacional).

### `.../contact-list-filters.component.html`
- Input de busqueda con icono y boton clear condicional.
- Dropdown de ordenamiento.
- Boton "Create contact" visible solo si admin.

### `.../contact-list-filters.component.scss`
- Barra sticky para filtros.
- Fondo translucido + blur.
- Ajuste responsive de acciones.

---

## 4.10 Contact card

### `.../contact-card.component.ts`
- Inputs: `contact`, `isAdmin`.
- Outputs:
  - `profileClick`,
  - `onEdit`,
  - `delete`.
- Usa `ContactUiService` para `displayData` (avatar, color, tag).
- Ya no contiene metodos `copyPhone/copyEmail`; ahora expone `contactClipboard` y usa servicio compartido.

### `.../contact-card.component.html`
- Card PrimeNG con:
  - header (avatar + nombre + cargo),
  - cuerpo (phone/email con botones copy),
  - footer (ver/editar/eliminar).
- Edit/Delete solo con `*ngIf="isAdmin"`.
- Los botones copy llaman directo:
  - `(click)="contactClipboard.phone(contact)"`
  - `(click)="contactClipboard.email(contact)"`

### `.../contact-card.component.scss`
- Apariencia de card, tipografia, truncado de texto.
- `::ng-deep` para ajustar internals de PrimeNG cuando no hay API directa de estilo.

---

## 4.11 Contact profile dialog

### `.../contact-profile-dialog.component.ts`
- Inputs: `visible`, `contact`.
- Outputs: `visibleChange`, `close`.
- `onClose()` sincroniza cierre con padre.
- Ya no contiene `copyPhone/copyEmail/copyAddress`; usa `contactClipboard` compartido.
- `hasAddress()` evita mostrar bloque vacio.

### `.../contact-profile-dialog.component.html`
- `p-dialog` modal no draggable/resizable.
- Header con avatar + nombre + tag.
- Secciones de phone/email/address (address condicional).
- Boton Back para cerrar.
- Los botones copy llaman al servicio comun:
  - `(click)="contactClipboard.phone(contact)"`
  - `(click)="contactClipboard.email(contact)"`
  - `(click)="contactClipboard.address(contact)"`

### `.../contact-profile-dialog.component.scss`
- Estilos de header y bloques de informacion.
- CTA alineada a la derecha.

---

## 4.12 Contact form dialog (create/edit + validaciones)

### `.../contact-form-dialog.component.ts`
- Inputs:
  - `visible`,
  - `editingId`,
  - `initialModel`,
  - `saving`.
- Outputs:
  - `visibleChange`,
  - `cancel`,
  - `save`.
- `ngOnChanges`:
  - cuando abre dialogo o cambia modelo inicial,
  - clona datos para no mutar el original,
  - resetea validacion,
  - enfoca primer campo.
- `onFormFieldChange()` activa validacion visual.
- `getFieldError`, `isFieldInvalid` usan util shared.
- `canSaveContact` combina `!saving` + `isContactBodyValid`.
- `submit()`:
  - fuerza mostrar validaciones,
  - si valido, emite `save` con copia del modelo.
- `_focusFirstNameField()` usa `setTimeout` para esperar render del dialog.

### `.../contact-form-dialog.component.html`
- Dialog con titulo dinamico:
  - create vs edit.
- Formulario con 6 campos.
- Asterisco en requeridos.
- Clases invalidas por campo.
- Mensaje general si hay errores.
- Botones Cancel/Save con disabled/loading.

### `.../contact-form-dialog.component.scss`
- Grid responsive del formulario.
- Estados de error (`p-invalid`, `fieldError`, `formError`).
- `hiddenError` para reservar altura y evitar "saltos" de layout.

---

## 4.13 Confirm delete dialog

### `.../confirm-delete-dialog.component.ts`
- Inputs: `visible`, `contact`, `deleting`.
- Outputs: `visibleChange`, `cancel`, `onConfirm`.
- `submitDelete()` evita doble click si `deleting`.
- `close()` bloquea cierre durante borrado.

### `.../confirm-delete-dialog.component.html`
- Dialog de confirmacion.
- Mensaje con nombre del contacto.
- Botones Cancel y Delete.
- Delete muestra loading mientras elimina.

### `.../confirm-delete-dialog.component.scss`
- Estilo simple del texto y acciones.

---

## 5) Eventos y comunicacion entre componentes (importante para exponer)

- Patron usado: **Input/Output** entre padre-hijo.
- `ContactListComponent` (padre) envia estado a hijos.
- Hijos emiten eventos al padre con `EventEmitter`.
- Ejemplos:
  - filtros emiten `searchTermChange` y `selectedSortChange`,
  - card emite `profileClick`, `onEdit`, `delete`,
  - form dialog emite `save` y `cancel`,
  - delete dialog emite `onConfirm`.

Por que asi:
- Claridad de responsabilidades.
- Hijos reutilizables y sin conocimiento del backend.
- Estado centralizado en el componente contenedor.

---

## 6) Validaciones que existen realmente

- Campos requeridos: `firstName`, `lastName`, `phone`, `email`, `jobTitle`.
- Campo opcional: `address`.
- Email: regex simple de formato valido.
- Telefono: permite digitos, espacios, `()+-`, longitud 7-20.
- Validacion de formulario:
  - por campo (`getContactFormFieldError`),
  - global (`isContactBodyValid` para habilitar Save).
- UX:
  - no se muestran errores hasta interactuar/enviar (`showValidation`).

---

## 7) Decisiones de diseno/estilo que debes poder justificar

- Variables SCSS globales: consistencia visual.
- Sticky header + sticky filtros: acceso rapido a navegacion y busqueda.
- Skeletons durante carga: mejor percepcion de rendimiento.
- Empty state claro: orienta al usuario cuando no hay resultados.
- Dialogos para CRUD: evita navegar entre pantallas y simplifica flujo.
- Toasts globales: feedback inmediato de acciones (copiar, guardar, eliminar).
- `::ng-deep` solo donde PrimeNG no ofrece API de estilo suficiente.
- Refactor DRY: logica de copiado centralizada en `ContactClipboardService` para evitar duplicidad entre card y profile dialog.

---

## 8) Seguridad y limites actuales (honesto para tu exposicion)

- Login hardcodeado (`admin/123`), no apto para produccion.
- Hay guard funcional para `'/admin/contacts'` (`adminGuard`), pero sigue siendo una seguridad de frontend.
- La ruta `'/contacts'` permanece publica por decision funcional; la proteccion fuerte siempre debe hacerse en backend real.
- API en memoria: datos se reinician al refrescar.
- Errores HTTP se loguean y se manejan con toasts; no hay tracking externo.

---

## 9) Script corto para explicar la app en una presentacion

1. "La app inicia en `main.ts`, monta `AppModule` y usa `AppComponent` como shell con toast + router-outlet."
2. "El enrutamiento principal carga modulos por demanda: contactos y login."
3. "Los datos de contactos salen de un backend simulado en memoria (`InMemoryDataService` + mocks)."
4. "El componente `ContactListComponent` orquesta estado, filtros, CRUD y dialogos."
5. "La validacion esta desacoplada en utilidades compartidas para mantener componentes limpios."
6. "La UI usa PrimeNG y estilos SCSS con variables globales para consistencia."
7. "El flujo actual es solo admin autenticado para entrar por `'/admin/contacts'`; el menu se adapta mostrando acceso Admin."

---

## 10) Resumen tecnico final (1 frase)

Es una arquitectura Angular modular, con estado local reactivo por feature, servicios desacoplados para datos/UI/validacion, y una capa de presentacion basada en componentes PrimeNG comunicados por Input/Output.

---

## 11) Cobertura 100% de la lista de rutas que pediste

Esta seccion confirma, una por una, las rutas que compartiste y que hace cada una.

### Raiz
- `src`: carpeta base del frontend Angular.
- `src/app`: codigo fuente principal de la app.
- `src/assets`: recursos estaticos (imagenes, estilos compartidos).
- `src/favicon.ico`: icono de pestana.
- `src/index.html`: host HTML base.
- `src/main.ts`: bootstrap Angular.
- `src/styles.scss`: estilos globales.

### Core/API
- `src/app/core`: agrupacion de piezas de dominio tecnico.
- `src/app/core/api`: capa de API (en este proyecto, usada con mocks).
- `src/app/core/api/mocks`: mocks de datos.
- `src/app/core/api/mocks/mock-contacts.ts`: dataset inicial de contactos.

### Features
- `src/app/features`: modulos funcionales por negocio.
- `src/app/features/auth`: feature de login.
- `src/app/features/auth/components`: componentes de auth (login).
- `src/app/features/auth/auth-routing.module.ts`: rutas internas de auth.
- `src/app/features/auth/auth.module.ts`: modulo auth.

- `src/app/features/contacts`: feature principal.
- `src/app/features/contacts/components`: componentes de contactos.
- `src/app/features/contacts/components/app-layout`: layout con navbar + router hijo.
- `src/app/features/contacts/components/app-layout/app-layout.component.html`: estructura del layout.
- `src/app/features/contacts/components/app-layout/app-layout.component.scss`: estilos del layout.
- `src/app/features/contacts/components/app-layout/app-layout.component.ts`: estado auth + logout.

- `src/app/features/contacts/components/contact-list`: contenedor principal de la vista.
- `src/app/features/contacts/components/contact-list/components`: subcomponentes UI.

- `src/app/features/contacts/components/contact-list/components/confirm-delete-dialog`: dialogo borrar.
- `src/app/features/contacts/components/contact-list/components/confirm-delete-dialog/confirm-delete-dialog.component.html`: texto + acciones.
- `src/app/features/contacts/components/contact-list/components/confirm-delete-dialog/confirm-delete-dialog.component.scss`: estilos del dialogo.
- `src/app/features/contacts/components/contact-list/components/confirm-delete-dialog/confirm-delete-dialog.component.ts`: eventos close/confirm.

- `src/app/features/contacts/components/contact-list/components/contact-card`: tarjeta visual.
- `src/app/features/contacts/components/contact-list/components/contact-card/contact-card.component.html`: plantilla de tarjeta.
- `src/app/features/contacts/components/contact-list/components/contact-card/contact-card.component.scss`: estilos de tarjeta.
- `src/app/features/contacts/components/contact-list/components/contact-card/contact-card.component.ts`: emits de acciones.

- `src/app/features/contacts/components/contact-list/components/contact-form-dialog`: formulario create/edit.
- `src/app/features/contacts/components/contact-list/components/contact-form-dialog/contact-form-dialog.component.html`: campos + errores + botones.
- `src/app/features/contacts/components/contact-list/components/contact-form-dialog/contact-form-dialog.component.scss`: grid + estados invalidos.
- `src/app/features/contacts/components/contact-list/components/contact-form-dialog/contact-form-dialog.component.ts`: validacion y submit.

- `src/app/features/contacts/components/contact-list/components/contact-list-filters`: barra de filtros.
- `src/app/features/contacts/components/contact-list/components/contact-list-filters/contact-list-filters.component.html`: input, dropdown y create.
- `src/app/features/contacts/components/contact-list/components/contact-list-filters/contact-list-filters.component.scss`: sticky + responsive.
- `src/app/features/contacts/components/contact-list/components/contact-list-filters/contact-list-filters.component.ts`: Inputs/Outputs de filtros.

- `src/app/features/contacts/components/contact-list/components/contact-profile-dialog`: perfil detallado.
- `src/app/features/contacts/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.html`: dialog de detalle.
- `src/app/features/contacts/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.scss`: estilos del perfil.
- `src/app/features/contacts/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.ts`: copy y cierre.

- `src/app/features/contacts/components/contact-list/contact-list.component.html`: vista principal (filtros, lista, dialogos).
- `src/app/features/contacts/components/contact-list/contact-list.component.scss`: estilo de la vista principal.
- `src/app/features/contacts/components/contact-list/contact-list.component.ts`: orquestador de estado.
- `src/app/features/contacts/contacts-routing.module.ts`: rutas internas de contactos.
- `src/app/features/contacts/contacts.module.ts`: modulo de contactos.

### Services / Shared / Shell
- `src/app/services`: logica transversal.
- `src/app/services/app-toast.service.ts`: toasts y feedback de copiado.
- `src/app/services/auth.service.ts`: auth mock reactiva.
- `src/app/services/contact-ui.service.ts`: decisiones visuales calculadas.
- `src/app/services/contact.service.ts`: CRUD + cache reactiva local.
- `src/app/services/contacts-view-model.service.ts`: filtro + ordenamiento.
- `src/app/services/in-memory-data.service.ts`: DB mock en memoria.

- `src/app/shared`: tipos/utilidades compartidas.
- `src/app/app-routing.module.ts`: router principal.
- `src/app/app.component.html`: toast + outlet.
- `src/app/app.component.scss`: host block.
- `src/app/app.component.spec.ts`: tests base de app shell.
- `src/app/app.component.ts`: componente raiz.
- `src/app/app.module.ts`: modulo raiz.

### Assets extra
- `src/assets/styles`: tokens de estilo.
- `src/assets/.gitkeep`: asegura versionado de carpeta vacia si aplica.
- `src/assets/default-user.svg`: avatar por defecto.

---

## 12) Flujo detallado por evento (click a click)

### Flujo A: login exitoso
1. Usuario escribe en inputs (`[(ngModel)]`) de `login.component.html`.
2. Click en `Sign in` dispara `(click)="login()"`.
3. `LoginComponent.login()` llama `AuthService.login(user, pass)`.
4. Si es `admin/123`, `AuthService` emite `true` en `BehaviorSubject`.
5. `LoginComponent` muestra toast de bienvenida y navega a `/contacts`.
6. `AppLayoutComponent`, suscrito a `isAuthenticated$`, actualiza navbar y muestra `Logout`.

### Flujo B: busqueda de contactos
1. Usuario escribe en filtro.
2. `contact-list-filters` emite `searchTermChange`.
3. `ContactListComponent.onSearchChange()` actualiza `searchTerm`.
4. Llama `_applyFilters()`.
5. `ContactsViewModelService.filterAndSortContacts(...)` normaliza y filtra.
6. `filteredContacts` cambia y la vista se renderiza sola.

### Flujo C: crear contacto
1. Admin click en `Create contact`.
2. Se ejecuta `openCreate()`: resetea `formModel`, abre dialogo.
3. Usuario rellena formulario; `onFormFieldChange()` activa validacion visual.
4. Click en `Save` llama `submit()`.
5. Si `canSaveContact` es true, emite evento `save` al padre.
6. `ContactListComponent.saveContact()` llama `ContactService.addContact()`.
7. `ContactService` hace POST y actualiza `_contacts$`.
8. Suscripcion de lista recibe nuevo arreglo, se aplica filtro, se refresca UI.
9. Se cierra dialogo y se muestra toast de exito.

### Flujo D: editar contacto
1. Admin click en icono editar de tarjeta.
2. `openEdit(contact)` carga `editingId` y `formModel` con datos actuales.
3. Guardado llama `updateContact({ id, ...form })`.
4. `ContactService` hace PUT y reemplaza item en cache local.
5. UI se actualiza y toast confirma exito.

### Flujo E: eliminar contacto
1. Admin click en icono basura.
2. `openDelete(contact)` abre dialogo confirmacion.
3. Click en `Delete` llama `confirmDelete()`.
4. `ContactService.deleteContact(id)` borra en API mock y luego en cache local.
5. Se cierra dialogo, se limpia `toDelete`, toast de exito.

### Flujo F: copiar telefono/email/address
1. Usuario click en boton copy.
2. Componente llama `AppToastService.copyWithFeedback(...)`.
3. Si existe `navigator.clipboard.writeText`, copia al portapapeles.
4. Muestra toast `"... copied"`.

---

## 13) Mini guia "linea por linea" de archivos criticos

No repite literalmente las 500+ lineas, pero te da una explicacion secuencial exacta para exponer codigo en vivo.

### `src/main.ts` (5 lineas)
- Lineas 1-2: imports minimos para arrancar app.
- Linea 4: bootstrap del modulo principal.
- Linea 5: captura errores de inicio.

### `src/app/app.module.ts`
- Imports 1-10: dependencias base + modulo de API mock + toast + routing.
- Decorador `@NgModule`:
  - `declarations`: componente raiz.
  - `imports`: infraestructura global.
  - `providers`: `MessageService` para toasts.
  - `bootstrap`: punto inicial de UI.

### `src/app/services/contact.service.ts`
- Propiedades privadas:
  - URL endpoint,
  - subject cacheado,
  - headers HTTP.
- Constructor: precarga contactos.
- `getContacts`: expone stream limpio (sin null + copias).
- `addContact` / `updateContact` / `deleteContact`: CRUD + sincronizacion de cache.
- `_loadContacts`: hydrata estado al inicio.
- `_handleError`: estrategia unificada de errores.

### `src/app/features/contacts/components/contact-list/contact-list.component.ts`
- Bloque de estado: todo lo que la pantalla necesita para renderizar/actuar.
- Bloque ciclo de vida: suscripciones en `ngOnInit`, limpiezas en `ngOnDestroy`.
- Bloque eventos de UI: buscar, ordenar, limpiar, abrir/cerrar dialogos.
- Bloque CRUD: `saveContact` y `confirmDelete` con `finalize`.
- Bloque privados: aplicar filtros y conectar streams de auth/datos.

### `src/app/shared/utils/contact-validation.ts`
- Primero define reglas (regex, labels).
- Luego funciones puras de validacion (sin side effects).
- Al final, mensaje de error por campo para conectar directo con UI.

---

## 14) Preguntas tipicas de profesor + respuesta corta

- "Por que `BehaviorSubject` y no variable normal?"
  - Porque necesitamos estado reactivo que emita cambios a todos los suscriptores y, ademas, entregue el ultimo valor al suscribirse.

- "Entonces, por que no usar `Subject` en vez de `BehaviorSubject`?"
  - `Subject` no guarda valor actual. `BehaviorSubject` si, por eso sirve para estado de autenticacion y lista cacheada.

- "Por que separar `ContactsViewModelService`?"
  - Para no mezclar reglas de vista (filtrar/ordenar) con el componente; mejora legibilidad, testeo y reuso.

- "Por que normalizar texto con `normalize('NFD')` y regex?"
  - Para que busquedas como "Jose" encuentren "Jose" y "José" (con/sin tilde), mejorando UX.

- "Por que usar `Omit<Contact, 'id'>` en formularios?"
  - Porque el usuario no define `id`; ese valor lo resuelve la capa de datos (`genId`).

- "Por que `finalize` en guardar/eliminar?"
  - Porque garantiza apagar `saving/deleting` en exito y error, evitando duplicar logica.

- "Por que `Input/Output` y no acceso directo entre componentes?"
  - Porque reduce acoplamiento, hace componentes mas reutilizables y mantiene flujo de datos predecible.

- "Que ventaja tiene usar servicios (`ContactService`, `AuthService`)?"
  - Centralizan reglas de negocio y acceso a datos; varios componentes pueden reutilizar la misma logica sin copiar codigo.

- "Por que se clonan objetos de contacto (`{ ...contact }`)?"
  - Para evitar mutaciones accidentales desde la UI que alteren estado compartido sin control.

- "Por que hay `filter((contacts) => contacts !== null)` en `getContacts()`?"
  - Porque el subject arranca en `null` hasta terminar la carga inicial; asi la UI recibe solo arreglos validos.

- "Por que el modulo de contactos esta lazy-loaded?"
  - Reduce costo de carga inicial y mejora escalabilidad cuando crece el proyecto.

- "Por que usar `angular-in-memory-web-api`?"
  - Permite desarrollar y probar flujo HTTP real (GET/POST/PUT/DELETE) sin depender de backend.

- "Es mala practica tener login hardcodeado?"
  - Para produccion, si. Para demo/prototipo, acelera validacion de UX y arquitectura.

- "Por que no hay `Route Guard` si existe auth?"
  - Ya existe guard funcional (`adminGuard`) en `'/admin/contacts'`; en produccion se complementa con autorizacion real en backend.

- "Por que usar PrimeNG en vez de CSS puro para todo?"
  - Acelera desarrollo con componentes robustos (dialog, dropdown, toast), manteniendo consistencia visual.

- "Por que `::ng-deep` aparece en estilos?"
  - Se usa como excepcion para ajustar partes internas de componentes de libreria cuando no hay API de estilo suficiente.

- "Como evita la app dobles envios al guardar/borrar?"
  - Con flags (`saving`, `deleting`) + botones deshabilitados + return temprano en metodos.

- "Que validaciones hay realmente?"
  - Required en nombre/apellido/telefono/email/jobTitle, formato de email y telefono; address es opcional.

- "Por que los errores de formulario no aparecen desde el inicio?"
  - Para no castigar al usuario con ruido visual antes de interactuar (`showValidation`).

- "Por que hay toasts para acciones?"
  - Dan feedback inmediato (exito/error) y mejoran percepcion de control de la interfaz.

- "Como se sincroniza UI despues de CRUD?"
  - El servicio actualiza `_contacts$`; la suscripcion en `ContactListComponent` recibe el nuevo estado y re-renderiza.

- "Que papel cumple `ContactsViewModelService` despues del CRUD?"
  - Reaplica busqueda y orden al nuevo arreglo para mantener resultados consistentes.

- "Que pasa si falla una llamada HTTP?"
  - Se loguea error; en operaciones CRUD se re-lanza para que el componente muestre toast de error.

- "Por que `Router.navigate(['/contacts'])` en login/logout?"
  - Para llevar al usuario a la vista principal tras autenticar o cerrar sesion.

- "Que pruebas hay ahora?"
  - Smoke tests de `AppComponent` y pruebas unitarias basicas de `LoginComponent` para credenciales validas/invalidas.

- "Que faltaria para un nivel produccion?"
  - Guard de rutas, backend real, JWT/refresh token, interceptores HTTP, manejo centralizado de errores, tests E2E y monitoreo.

- "Si te piden explicar arquitectura en 20 segundos, que dices?"
  - "Es una app Angular modular, con rutas lazy-loaded, servicios para estado y datos, componentes presentacionales conectados por Input/Output, y una capa de validacion/utilidades compartidas."

### Mini bloque para responder oralmente sin trabarte

- Estructura recomendada de respuesta:
  1) "Que problema resuelve",
  2) "Donde vive la logica",
  3) "Como fluye el dato",
  4) "Como se maneja error/estado",
  5) "Que mejoraria en produccion".

- Ejemplo rapido:
  - "Esta pantalla lista contactos. La logica de datos vive en `ContactService`, la de filtro en `ContactsViewModelService`. El componente orquesta eventos de hijos, actualiza estado reactivo y muestra feedback con toasts. Si falla HTTP, se informa al usuario y no se rompe la UI."

---

## 16) Preguntas dificiles con trampa (y como responder)

Esta seccion esta pensada para cuando te quieran "arrinconar" en una defensa tecnica.

### Trampa 1: "Si usas in-memory API, entonces no sabes integrar backend real"
- Respuesta recomendada:
  - "Si, si se integrar backend real. Aqui use in-memory para desacoplar tiempos del frontend y validar primero UX, validaciones y flujo HTTP. El cambio a backend real se hace reemplazando la base URL y ajustando contrato/respuestas."

### Trampa 2: "Tu auth no sirve, cualquiera entra"
- Respuesta recomendada:
  - "Correcto, es auth de demo. La app separa bien capas y permite evolucionar a JWT + guard + interceptor sin rehacer componentes."

### Trampa 3: "No hay manejo real de errores"
- Respuesta recomendada:
  - "Si hay manejo base: `catchError`, fallback/rethrow y feedback por toast. En produccion agregaria trazabilidad centralizada (interceptor + logger + monitoreo)."

### Trampa 4: "Tu validacion con regex no es perfecta"
- Respuesta recomendada:
  - "Totalmente. La validacion cliente debe ser pragmatica para UX; la validacion definitiva siempre debe vivir en backend."

### Trampa 5: "Por que no usaste Reactive Forms?"
- Respuesta recomendada:
  - "Para este alcance, Template-driven (`ngModel`) fue suficiente y mas rapido. Si creciera complejidad (validadores async, formularios dinamicos), migraria a Reactive Forms."

### Trampa 6: "Usar `setTimeout` para focus es hack"
- Respuesta recomendada:
  - "Es una solucion practica cuando el dialog renderiza de forma asincrona. Alternativas: hooks de ciclo de vida + eventos del dialog + `ChangeDetectorRef`."

### Trampa 7: "Tu `ContactListComponent` hace demasiado"
- Respuesta recomendada:
  - "Actua como componente contenedor (smart component). Aun asi, ya delega filtro, UI meta y datos a servicios; si creciera mas, separaria facade/store."

### Trampa 8: "No hay estado global formal (NgRx, signals store)"
- Respuesta recomendada:
  - "Para esta escala, `BehaviorSubject` en servicio es suficiente y mas simple. Si el dominio crece, una capa de estado formal seria el siguiente paso."

### Trampa 9: "No veo pruebas de contactos"
- Respuesta recomendada:
  - "Cierto, hoy hay pruebas base de shell/login. El siguiente incremento es testear `ContactService`, validaciones y flujos de `ContactListComponent`."

### Trampa 10: "Tu busqueda puede ser costosa"
- Respuesta recomendada:
  - "Con el volumen actual funciona bien. Para volumen alto agregaria debounce, paginacion server-side e indices/busqueda backend."

### Trampa 11: "Por que no hay i18n si esta en ingles/espanol mezclado?"
- Respuesta recomendada:
  - "Es una demo funcional. En productivo se moverian textos a un sistema de internacionalizacion para evitar hardcode."

### Trampa 12: "Eso de `::ng-deep` esta deprecado"
- Respuesta recomendada:
  - "Si, por eso lo uso minimo y solo cuando la libreria no da API suficiente. Preferencia siempre por clases publicas/temas del componente."

### Trampa 13: "El usuario puede ir directo a `/contacts` aunque no login"
- Respuesta recomendada:
  - "Correcto, porque el alcance funcional priorizo catalogo publico y permisos de admin para acciones criticas. Si se pide proteccion total, se agrega guard."

### Trampa 14: "Tus toasts no son accesibles para todos"
- Respuesta recomendada:
  - "Buen punto. Como mejora: roles ARIA mas estrictos, foco gestionado y mensajes complementarios visibles para lectores de pantalla."

### Trampa 15: "Eso no escala"
- Respuesta recomendada:
  - "Escala hasta cierto punto. La arquitectura modular ya prepara crecimiento; para gran escala agregaria estado formal, API real, feature flags y observabilidad."

## 17) Frases puente para ganar tiempo al responder

Usa estas frases cuando necesites ordenar ideas sin quedarte en blanco:

- "Buena pregunta; lo separo en decision actual y evolucion a produccion."
- "Para este alcance fue una decision de simplicidad controlada."
- "Tecnicamente se puede mejorar asi: ..."
- "El trade-off principal aqui fue velocidad de entrega vs robustez enterprise."
- "Si te parece, te explico primero el flujo actual y luego la version escalable."

## 18) Cierre de defensa (30 segundos)

Texto sugerido para cerrar fuerte:

"La app cumple su objetivo funcional con una arquitectura clara: modulos por feature, servicios para logica reutilizable, flujo de datos reactivo y UI desacoplada por Input/Output. Lo importante es que las decisiones son conscientes: para demo se priorizo velocidad y claridad, y para produccion ya estan identificados los siguientes pasos tecnicos."
