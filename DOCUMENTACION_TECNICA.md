# Documentación Técnica: Proyecto Glucolog
**Sistema Inteligente para la Gestión Integral de la Diabetes**

## 1. Descripción General del Sistema

*   **Nombre del Proyecto:** Glucolog
*   **Propósito Principal:** Proporcionar una plataforma centralizada y amigable para el autocontrol de la diabetes, permitiendo a los usuarios registrar niveles de glucosa, gestionar su nutrición mediante una base de datos especializada y mantener hábitos saludables a través de recordatorios personalizados.
*   **Problema que resuelve:** La dificultad de los pacientes diabéticos para mantener un registro histórico preciso, correlacionar su alimentación con los picos de glucosa y acceder a información nutricional veraz (específicamente adaptada al contexto regional, como la tabla boliviana de composición de alimentos).
*   **Tipo de Aplicación:** Aplicación Web Progresiva (PWA) optimizada para dispositivos móviles y escritorio.

## 2. Arquitectura del Sistema

*   **Descripción de la Arquitectura:** El sistema sigue un modelo **Serverless** y **Client-Side Heavy**. Utiliza **Next.js** como framework de aplicación, delegando la lógica de negocio al cliente y utilizando servicios en la nube para la persistencia y autenticación.
*   **Diagrama Lógico:** 
    1.  **Capa de Presentación:** Desarrollada en React/Next.js con un enfoque en diseño atómico y componentes reactivos.
    2.  **Capa de Servicios:** Módulos de servicios en TypeScript que actúan como puente entre la UI y los backends (Firebase).
    3.  **Capa de Datos:** Dividida en tres servicios: **Firebase Auth** (Identidad), **Firestore** (Datos relacionales de usuario y registros) y **Realtime Database** (Catálogo de alimentos de alta concurrencia).
*   **Flujo de Datos:** Los datos se capturan en formularios reactivos, se validan localmente y se sincronizan bi-direccionalmente con Firebase. Los cálculos complejos (carga glucémica, densidad nutricional) se realizan en el cliente para garantizar una respuesta inmediata sin latencia de red.

## 3. Tecnologías Utilizadas

*   **Frontend:** 
    *   **Framework:** Next.js 14.2/16 (App Router).
    *   **Lenguaje:** TypeScript (para tipado fuerte y reducción de errores en tiempo de ejecución).
    *   **Estilos:** Tailwind CSS y Framer Motion (animaciones de interfaz).
    *   **Visualización:** Chart.js para el análisis gráfico de tendencias.
*   **Backend:** 
    *   Arquitectura sin servidor administrada por Firebase.
    *   Node.js para procesos de construcción y despliegue (Vercel).
*   **Base de Datos:**
    *   **Cloud Firestore:** Persistencia de perfiles de usuario, registros de glucosa y eventos del calendario.
    *   **Firebase Realtime Database:** Almacenamiento y consulta de la base de datos de alimentos.
*   **Servicios Externos:**
    *   **Firebase Storage:** Almacenamiento de imágenes de perfil.
    *   **NextAuth.js:** Integración de sesiones.
    *   **TensorFlow.js (Fase de Integración):** Librería instalada para el desarrollo de módulos de predicción predictiva.

## 4. Funcionalidades Principales

*   **Módulo de Dashboard Analítico:** Visualización de niveles de glucosa mediante tres ejes: línea de tiempo histórica, impacto por tipo de comida y patrones de variabilidad diaria.
*   **Módulo de Registro de Glucosa:** Formulario dinámico que permite capturar el nivel de glucosa asociado a contextos nutricionales (qué comió y en qué momento del día).
*   **Banco de Alimentos Académico:** Buscador avanzado basado en la tabla boliviana de composición de alimentos, con filtros por Índice Glucémico (IG) y cálculo automático de Carga Glucémica (CG) según la porción.
*   **Asistente de Nutrición:** Generación de recomendaciones automáticas (p. ej., "combinar con fibra" si el IG es alto) y cálculo de densidad nutricional.
*   **Gestión de Calendario y Salud:** Sistema de recordatorios para medicación y actividad física con seguimiento de cumplimiento y estadísticas mensuales.
*   **Gestión de Perfil Clínico:** Registro de datos personales, tipo de diabetes y medidas antropométricas (peso, altura).

## 5. Modelo de Datos (Entidades Principales)

El sistema utiliza una estructura NoSQL optimizada para lectura:

*   **Usuario (Colección `users`):** `uid`, `firstName`, `lastName`, `diabetesType`, `age`, `weight`, `height`, `photoURL`.
*   **Registro de Glucosa (Sub-colección `records`):** `glucoseLevel`, `date`, `time`, `timeStamp`, `ateSomething`, `foodMeal` (contexto).
*   **Calendario de Eventos (Sub-colección `events`):** `type` (medication/exercise), `date`, `completed`, `medicationType`, `activityType`, `plannedDuration`, `actualDuration`.
*   **Catálogo de Alimentos (Realtime DB):** Estructura jerárquica con campos como `Nombre`, `Calorias`, `Carbohidratos`, `IndiceGlucemico`, `GramHCO`, y micronutrientes (Zinc, Magnesio, etc.).

## 6. Seguridad

*   **Mecanismos de Autenticación:** Implementación de Firebase Authentication con soporte para correo/contraseña y validación de sesión persistente.
*   **Manejo de Datos Sensibles:** Los datos de salud están protegidos mediante **Cloud Firestore Rules**, restringiendo el acceso exclusivamente al propietario del `uid`.
*   **Validación de Acceso:** La sección de Banco de Alimentos requiere obligatoriamente la verificación de correo electrónico (`emailVerified`) para prevenir accesos no autorizados a la API de datos.
*   **Riesgos Identificados:** Dependencia de servicios de terceros (Google/Firebase). El sistema utiliza mecanismos de manejo de errores para fallos en la red o latencia de base de datos.

## 7. Flujo de Usuario (Caso de Uso Principal)

1.  **Entrada:** El usuario se autentica o registra. Si es usuario nuevo, completa su perfil metabólico.
2.  **Registro:** El usuario ingresa una medición de glucosa después del almuerzo. El sistema guarda la relación glucosa-alimento.
3.  **Consulta:** El usuario accede al "Banco de Alimentos" para verificar si puede comer una fruta específica. El sistema calcula la Carga Glucémica basada en los gramos ingresados.
4.  **Análisis:** El usuario revisa su Dashboard, donde observa una tendencia al alza en los registros pospandriales (después de comer) y recibe una recomendación de ajuste nutricional.
5.  **Seguimiento:** El sistema notifica al usuario su recordatorio de ejercicio diario, el cual marca como completado al finalizar.

## 8. Estado Actual del Sistema

*   **Funcionalidades Completas:** Registro de glucosa, Dashboard analítico (gráficos), Banco de Alimentos verificado, Gestión de perfil y Calendario de eventos.
*   **Funcionalidades en Desarrollo:** Módulo de predicciones inteligentes basado en IA (infraestructura preparada con TensorFlow.js).
*   **Limitaciones Técnicas:** Requiere conexión a internet para la sincronización inicial de la base de datos de alimentos, aunque utiliza caché de Firestore para consultas locales.

## 9. Observaciones Técnicas (Visión de Arquitecto)

*   **Decisiones Relevantes:** Se optó por **Firebase Realtime Database** para los alimentos debido a su menor costo y mayor velocidad de sincronización para listas extensas de solo lectura, mientras que **Firestore** se reservó para los registros de usuario por su capacidad de filtrado query-based avanzado.
*   **Mejoras Futuras:** Implementación de persistencia Offline total mediante Service Workers y refinamiento del modelo predictivo de IA para sugerir dosis de insulina basadas en el historial.
*   **Riesgos Técnicos:** El proyecto maneja una gran cantidad de dependencias gráficas y de UI; se recomienda un monitoreo constante del tamaño del bundle para mantener la performance en dispositivos móviles de gama media.
