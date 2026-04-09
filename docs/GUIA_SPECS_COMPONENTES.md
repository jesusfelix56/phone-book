# Guia de tests (`*.spec.ts`) de componentes

Esta guia te ayuda a explicar, de forma clara y detallada, **como funcionan tus specs de componentes**, que validan hoy y que te falta para tener una suite mas robusta.

---

## 1) Que estas usando para testear

Tu proyecto usa el stack clasico de Angular:
- `TestBed`: crea un modulo de pruebas aislado.
- `ComponentFixture<T>`: te da acceso al componente y al DOM de prueba.
- Jasmine (`describe`, `it`, `expect`, spies).
- `NO_ERRORS_SCHEMA`: ignora componentes/directivas desconocidas en templates.

Idea clave para explicar:
- "No estoy probando PrimeNG internamente; estoy probando **mi logica y mis contratos** de componente."

---

## 2) Patron base que repites en casi todos los specs

1. `describe(...)`: agrupa pruebas por componente.
2. `beforeEach(async ...)`:
   - configura `TestBed`,
   - declara el componente,
   - inyecta mocks/spies de dependencias.
3. `fixture = TestBed.createComponent(...)`.
4. `component = fixture.componentInstance`.
5. `fixture.detectChanges()` para disparar ciclo de vida (`ngOnInit`) y render inicial.
6. `it(...)` valida comportamiento puntual.

---

## 3) Explicacion por archivo (uno por uno)

## `src/app/app.component.spec.ts`

Que hace:
- Crea `AppComponent` y valida `toBeTruthy()`.

Por que sirve:
- Es un smoke test del shell principal: confirma que el componente raiz no rompe al construir.

Detalle tecnico:
- Usa `NO_ERRORS_SCHEMA`, asi no falla por etiquetas externas en template.

Limitacion actual:
- No valida contenido (por ejemplo, presencia de `router-outlet` o `p-toast`).

---

## `src/app/features/auth/components/login/login.component.spec.ts`

Este es de los mas completos.

### Setup
- Mock de `AuthService` con spy de `login`.
- Mock de `AppToastService` con spy de `success`.
- `RouterTestingModule` para poder espiar navegacion.
- `FormsModule` porque el componente usa `ngModel`.

### Casos que cubre

1. **`should create`**
   - Verifica creacion del componente.

2. **`should start with empty fields`**
   - Valida estado inicial:
     - `username = ''`
     - `password = ''`
     - `errorMessage = ''`
   - Muy util para explicar "estado inicial predecible".

3. **`should show error when credentials are invalid`**
   - Simula login invalido (`of(false)`).
   - Ejecuta `component.login()`.
   - Verifica:
     - se llamo `authService.login(...)` con credenciales usadas,
     - se seteo `errorMessage`,
     - no se llama toast de exito.

4. **`should navigate when credentials are valid`**
   - Simula login valido (`of(true)`).
   - Espia `router.navigate`.
   - Verifica:
     - error limpio,
     - toast de exito llamado,
     - navegacion a `['/admin/contacts']`.

Que explica bien en exposicion:
- Pruebas de "happy path" y "error path".
- Aislamiento real del componente por mocks.

---

## `src/app/features/contacts/components/app-layout/app-layout.component.spec.ts`

Que hace hoy:
- Solo valida que el componente se crea.

Setup relevante:
- Stub de `AuthService` con:
  - `isAuthenticated$` (`BehaviorSubject(false)`),
  - `isAdmin$` (`BehaviorSubject(false)`),
  - `logout` espiado.
- `RouterTestingModule` para entorno de rutas.

Que podrias decir:
- "La base del test ya esta preparada para probar cambios de estado en navbar; hoy solo hay smoke test."

---

## `src/app/features/contacts/components/contact-list/contact-list.component.spec.ts`

Este es el mas rico de contactos.

### Setup
- Spy de `ContactService`:
  - `getContacts`, `addContact`, `updateContact`, `deleteContact`.
- `getContacts` devuelve `of([])` para inicializar limpio.
- Stub de `AuthService` con `isAdmin$: of(false)`.
- Spy de `ContactsViewModelService.filterAndSortContacts` devolviendo `[]`.
- Spy de toast con `success` y `error`.

### Casos que cubre

1. **`should create`**
   - Smoke test.

2. **`should load contacts on init`**
   - Verifica que `getContacts()` se llama en inicializacion.
   - Verifica `loading = false` tras recibir datos.

3. **`should render child components in parent template`**
   - Busca en DOM:
     - `app-contact-list-filters`
     - `app-contact-profile-dialog`
     - `app-contact-form-dialog`
     - `app-confirm-delete-dialog`
   - Comprueba que el componente padre compone bien su plantilla.

4. **`should open create dialog`**
   - Llama `openCreate()`.
   - Verifica:
     - `dialogOpen = true`,
     - `editingId = null`.

5. **`should open and close profile dialog`**
   - Simula `openProfile(mockContact)`.
   - Verifica estado visible + contacto seleccionado.
   - Cierra y verifica reseteo.

6. **`should apply filters when search changes`**
   - Llama `onSearchChange('ana')`.
   - Verifica cambio de `searchTerm`.
   - Verifica llamada a `filterAndSortContacts`.

7. **`should open and close delete dialog`**
   - Abre con contacto mock.
   - Verifica visible + `toDelete`.
   - Cierra y verifica limpieza.

8. **`should clear filters`**
   - Estado previo: `searchTerm='test'`, `selectedSort='phone'`.
   - Llama `clearFilters()`.
   - Verifica reset a:
     - `searchTerm=''`,
     - `selectedSort='firstName'`,
     - reaplica filtros.

Que demuestra este spec:
- Estado de UI bien cubierto.
- Interacciones clave del contenedor principal.

---

## `src/app/features/contacts/components/contact-list/components/contact-card/contact-card.component.spec.ts`

Que hace hoy:
- Crea componente con dependencias mockeadas:
  - `ContactUiService.getDisplayData`,
  - `AppToastService.copyWithFeedback`.
- Inyecta un `contact` mock valido.
- Verifica `should create`.

Valor actual:
- Garantiza que el componente instancia correctamente con sus providers.

---

## `src/app/features/contacts/components/contact-list/components/contact-list-filters/contact-list-filters.component.spec.ts`

Que hace hoy:
- Smoke test (`should create`).

Valor:
- Evita regresiones basicas de compilacion del componente.

---

## `src/app/features/contacts/components/contact-list/components/confirm-delete-dialog/confirm-delete-dialog.component.spec.ts`

Que hace hoy:
- Smoke test (`should create`).

Valor:
- Verifica que compila y no rompe con template actual.

---

## `src/app/features/contacts/components/contact-list/components/contact-profile-dialog/contact-profile-dialog.component.spec.ts`

Que hace hoy:
- Mock de `ContactUiService`.
- Mock de `AppToastService`.
- Smoke test (`should create`).

Valor:
- Verifica integracion minima de providers requeridos.

---

## `src/app/features/contacts/components/contact-list/components/contact-form-dialog/contact-form-dialog.component.spec.ts`

Que hace hoy:
- Smoke test (`should create`).

Valor:
- Valida compilacion del componente de formulario.

---

## 4) Que esta bien de tu suite actual

- Tienes cobertura de existencia para todos los componentes principales.
- `LoginComponent` y `ContactListComponent` ya prueban flujos reales.
- Usas mocks/spies correctamente para aislar dependencias.
- Evitas acoplarte a internals de librerias UI externas.

---

## 5) Que falta (y te pueden preguntar)

Aunque tus specs estan bien para base, varios componentes tienen solo smoke tests.  
Para una defensa tecnica, reconoce esto y propone mejora incremental.

Faltantes importantes:
- `AppLayoutComponent`: probar reaccion a `isAuthenticated$`/`isAdmin$` y `logout()`.
- `ContactCardComponent`: probar `profileClick`, `onEdit`, `delete`, `copyPhone`, `copyEmail`.
- `ContactListFiltersComponent`: probar emisiones `searchTermChange`, `selectedSortChange`, `clearSearch`, `createContact`.
- `ConfirmDeleteDialogComponent`: probar bloqueo cuando `deleting=true` y emisiones correctas.
- `ContactProfileDialogComponent`: probar `onClose`, `hasAddress`, `copyPhone/copyEmail/copyAddress`.
- `ContactFormDialogComponent`: probar `submit`, validaciones, `canSaveContact`, reset en `ngOnChanges`.
- `ContactListComponent`: faltan casos de `saveContact`, `confirmDelete`, manejo de error toast, `openEdit`.

---

## 6) Guion oral rapido para explicar tus tests

Puedes decirlo asi:

"Mis tests siguen un patron: configuro TestBed, mockeo dependencias, creo componente y valido resultados observables.  
En `LoginComponent` cubro camino exitoso y fallido; en `ContactListComponent` cubro estado, eventos y composicion de hijos.  
En el resto tengo smoke tests como red minima y el siguiente paso es ampliar pruebas de eventos/emisiones y validaciones por componente."

---

## 7) Comandos utiles para correr tests

- Ejecutar todo:
  - `npm test`
- Ejecutar en modo CI (si lo tienes configurado):
  - `npm test -- --watch=false`

---

## 8) Frases de defensa cuando pregunten por cobertura

- "Priorizamos primero flujos criticos (`login`, `listado`) y dejamos smoke tests para asegurar estabilidad general."
- "La suite actual ya detecta roturas estructurales; la siguiente iteracion agrega cobertura de eventos y validaciones finas."
- "Cada spec usa mocks para aislar el comportamiento del componente y evitar falsos positivos por dependencias externas."

