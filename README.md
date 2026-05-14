Tarea — Nueva sección en la distribuidora 

 Añadir una nueva sección modificar cliente dentro de la distribuidora de la aplicación y desarrollar un flujo completo de modificación de clientes bancarios mediante un formulario stepper realizado con Angular + Formly. 

  

La tarea debe incluir: 

Nueva sección en el menú 

Routing 

Componentes 

Mock de servicio 

Stepper 

Formularios dinámicos con Formly 

Validaciones 

Resumen de cambios 

Comparación entre datos originales y modificados 

  

1. Nueva sección en la distribuidora 

 Añadir una nueva categoría dentro del menú principal, concretamente en la sección “También te puede interesar” llamada “Modificar cliente bancario” con su iconito de edición y tal: 

Por ahí en medio, por ejemplo: 
 

2. Componente principal 

 Crear el componente en el que alojaremos esta nueva sección. Añadir un form donde podremos alojar el formulario formly que crearemos. Seguir la estructura del resto de componentes de la distribuidora y ver donde están alojados. 

 

3. Routing 

 Enganchar el componente principal al routing del resto de integrantes de la distribuidora y comprobar que viaje bien. 

  

4. Crear componente en la parametría 

 Ir a la parametría y localizar el resto de componentes de la distribuidora. Una vez entendido, crear nuestra nueva sección y añadir un stepper para alojar nuestro formulario paso a paso. 

  

5. Recuperar la parametría en nuestro componente 

 Una vez creado, debemos recuperar la sección de la parametría que hemos hecho. Comprobar qué servicio es el que nos ofrece la parametría y ver que nos llega bien. Necesitarás crear un servicio que te sirva esos parámetros, junto con las llamada fake que haremos. 

  

6. Stepper 

 Crearemos un sencillo stepper de 3 pasos: 

 

PASO 1 — Selección de cliente 

 En este primer paso haremos una llamada a nuestro mock y detectaremos si existen clientes disponibles y permitir seleccionar uno. 

 Si existen clientes debemos mostrar un listado mediante un radio button, por ejemplo, en el que mostraremos su nombre, documento de identidad y tipo de cuenta. 

 Si NO existen clientes debemos mostrar un mensaje tipo “No existen clientes disponibles para modificar” y bloquear el avance al siguiente paso. 

 Debemos obtener los clientes desde una llamada fake a nuestros mocks, habrá que fijarse como están hechas las llamadas reales e intentar simular una desde nuestros mocks. Ejemplo de body de respuesta: 
[ { 

    id: 1, 

    fullName: 'Jesús Félix', 

    document: '12345678A', 

    email: 'jesus@test.com', 

    phone: '600123123', 

    accountNumber: 'ES6621000418401234567891', 

    accountType: 'Cuenta Nómina', 

    branchOffice: 'Madrid Centro', 

    transferLimit: 3000, 

    notificationsEnabled: true, 

    preferredContactMethod: 'EMAIL' 

  } ] 

PASO 2 — Formulario de modificación 

 Permitir modificar la información del cliente seleccionado. El formulario debe precargarse automáticamente con la información del cliente seleccionado. 

Campos: 

Nombre completo 

Email 

Teléfono 

Número de cuenta 

Tipo de cuenta 

Oficina bancaria 

Límite de transferencia  

Notificaciones 

Método de contacto preferido 

El formulario debe contener: 

Inputs 

Numeric-input-with-controls 

Searchable-modal 

Button-toggle 

Switch 

Selects:  

Tipo de cuenta: [Cuenta Nómina, Cuenta Ahorro, Cuenta Empresa, Cuenta Premium] 

Oficina bancaria: [Madrid Centro, Barcelona Norte, Sevilla Este, Valencia Central] 

Switch: 

Notificaciones: True o false  

Button-toggle: 

Método de contacto preferido: [Email, Teléfono, SMS]  

Validaciones:  

Nombre completo: Required, no se puedan meter numeritos 

Email: Required y formato correcto 

Teléfono: Required, máximo 9 cifras y nada de letras 

Número de cuenta: Required y validación de IBAN 

Tipo de cuenta: Required 

Oficina bancaria: Required 

Límite de transferencia: Required, mínimo 0 y máximo 3000 

Notificaciones: Por defecto false 

Método de contacto preferido: Required, por defecto email 

  

PASO 3 — Resumen de modificaciones 

 Mostrar resumen dinámico de cambios realizados. Mostrar solo los datos que se han modificado de forma ordenada y clara. Comparando lo que había anteriormente con lo nuevo. 

 Mostrar al principio un disclaimer: Esta información es una previsualización de los datos modificados. A continuación, un título: Datos modificados. Seguido del comparador. Ejemplo: 

Email: jesus@test.com 👉 jesus.nuevo@test.com  

Tipo de cuenta: Cuenta Nómina 👉 Cuenta Premium 

Botón final del paso: Mostra una modal de se han modificado los datos y volver a la distribuidora. 

Cuidado: Realizar test y traducciones de cada texto a todos los idiomas. 

 

 

En definitiva: 
 Imagina que esta tarea fuera una real del banco, fíjate en cómo está estilizado todo lo del banco e intenta que más o menos parezca una pantalla real. Tienes muchos ejemplos, aprovéchalos y entiéndelos. No hagas por hacer.  
 Mucha suerte y espero que lo hagas genial. 
