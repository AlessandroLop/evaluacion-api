// src/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();
const EvaluacionController = require('../controllers/evaluacionController');
const { validateEvaluacion, validateId } = require('../middlewares/validation');
const sentimentRateLimiter = require('../middlewares/rateLimiter');

/**
 * @swagger
 * components:
 *   schemas:
 *     CatedraticoConCursos:
 *       type: object
 *       description: Catedrático con la lista de cursos que imparte
 *       properties:
 *         catedraticoId:
 *           type: integer
 *           description: ID único del catedrático
 *           example: 5
 *         nombreCompleto:
 *           type: string
 *           description: Nombre completo del catedrático
 *           example: "DANY OTONIEL OLIVA BELTETON"
 *         cursos:
 *           type: array
 *           description: Lista de cursos que imparte este catedrático
 *           items:
 *             $ref: '#/components/schemas/CursoBasico'
 *     
 *     CursoBasico:
 *       type: object
 *       description: Información básica de un curso
 *       properties:
 *         cursoId:
 *           type: integer
 *           description: ID único del curso
 *           example: 1
 *         nombreCurso:
 *           type: string
 *           description: Nombre del curso
 *           example: "Programación Básica"
 *         seminario:
 *           type: string
 *           description: Seminario al que pertenece el curso
 *           example: "Seminario de Programación"
 *     
 *     CursoCompleto:
 *       type: object
 *       description: Información completa de un curso incluyendo datos del catedrático
 *       allOf:
 *         - $ref: '#/components/schemas/CursoBasico'
 *         - type: object
 *           properties:
 *             catedratico:
 *               type: object
 *               properties:
 *                 catedraticoId:
 *                   type: integer
 *                   example: 5
 *                 nombreCompleto:
 *                   type: string
 *                   example: "DANY OTONIEL OLIVA BELTETON"
 *     
 *     Pregunta:
 *       type: object
 *       description: Pregunta de evaluación estándar
 *       properties:
 *         preguntaId:
 *           type: integer
 *           description: ID único de la pregunta
 *           example: 1
 *         textoPregunta:
 *           type: string
 *           description: Texto de la pregunta de evaluación
 *           example: "Dominio y manejo del tema del curso."
 *     
 *     EvaluacionRequest:
 *       type: object
 *       description: Datos requeridos para crear una nueva evaluación
 *       required:
 *         - cursoId
 *         - comentarios
 *         - respuestas
 *       properties:
 *         cursoId:
 *           type: integer
 *           description: ID del curso a evaluar
 *           example: 1
 *         comentarios:
 *           type: string
 *           description: Comentarios del estudiante (mínimo 10 caracteres)
 *           minLength: 10
 *           example: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a resolver dudas. Sus clases son dinámicas y fáciles de entender."
 *         respuestas:
 *           type: array
 *           description: Puntuaciones del 1 al 5 para cada una de las 5 preguntas
 *           items:
 *             type: integer
 *             minimum: 1
 *             maximum: 5
 *           minItems: 5
 *           maxItems: 5
 *           example: [5, 4, 5, 4, 5]
 *     
 *     EvaluacionResponse:
 *       type: object
 *       description: Respuesta exitosa al crear una evaluación
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             evaluacionId:
 *               type: integer
 *               description: ID de la evaluación creada
 *               example: 123
 *             mensaje:
 *               type: string
 *               example: "Evaluación registrada exitosamente"
 *         message:
 *           type: string
 *           example: "Evaluación creada exitosamente"
 *     
 *     EstadisticaCatedratico:
 *       type: object
 *       description: Estadísticas detalladas de un catedrático
 *       properties:
 *         nombre_catedratico:
 *           type: string
 *           description: Nombre completo del catedrático
 *           example: "DANY OTONIEL OLIVA BELTETON"
 *         seminario:
 *           type: string
 *           description: Seminario donde imparte clases
 *           example: "Seminario de Programación"
 *         cantidad_respuestas:
 *           type: integer
 *           description: Número total de evaluaciones recibidas
 *           example: 25
 *         calificacion_promedio_catedratico:
 *           type: number
 *           format: float
 *           description: Promedio de todas las calificaciones del catedrático
 *           example: 4.52
 *     
 *     EstadisticasSeminario:
 *       type: object
 *       description: Estadística de un seminario específico
 *       properties:
 *         seminario:
 *           type: string
 *           description: Nombre del seminario
 *           example: "Seminario de Programación"
 *         promedio_general:
 *           type: number
 *           format: float
 *           description: Promedio general del seminario
 *           example: 4.42
 *     
 *     EstadisticasCompletas:
 *       type: object
 *       description: Estadísticas completas del sistema
 *       properties:
 *         catedraticos:
 *           type: array
 *           description: Estadísticas detalladas por catedrático
 *           items:
 *             $ref: '#/components/schemas/EstadisticaCatedratico'
 *         calificacion_general_seminario:
 *           type: number
 *           format: float
 *           description: Promedio general de todos los seminarios
 *           example: 4.35
 *         promedios_por_seminario:
 *           type: array
 *           description: Promedios agrupados por seminario
 *           items:
 *             $ref: '#/components/schemas/EstadisticasSeminario'
 *     
 *     HealthResponse:
 *       type: object
 *       description: Respuesta del health check
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "API funcionando correctamente"
 *         data:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "healthy"
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: "2025-10-04T14:30:00.000Z"
 *             database:
 *               type: string
 *               example: "connected"
 *             catedraticos:
 *               type: integer
 *               description: Número total de catedráticos en la base de datos
 *               example: 5
 *     
 *     ComentarioEvaluacion:
 *       type: object
 *       description: Comentario de evaluación con información del curso y catedrático
 *       properties:
 *         evaluacionId:
 *           type: integer
 *           description: ID único de la evaluación
 *           example: 15
 *         comentarios:
 *           type: string
 *           description: Comentarios escritos por el estudiante
 *           example: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a ayudar."
 *         fechaEvaluacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora cuando se realizó la evaluación
 *           example: "2024-12-10T14:30:00.000Z"
 *         curso:
 *           type: object
 *           description: Información del curso evaluado
 *           properties:
 *             cursoId:
 *               type: integer
 *               example: 1
 *             nombreCurso:
 *               type: string
 *               example: "Desarrollo Web Frontend"
 *             codigoCurso:
 *               type: string
 *               example: "WEB101"
 *         catedratico:
 *           type: object
 *           description: Información del catedrático evaluado
 *           properties:
 *             catedraticoId:
 *               type: integer
 *               example: 3
 *             nombreCompleto:
 *               type: string
 *               example: "Dr. Carlos Mendoza"
 *     
 *     ComentariosMetadata:
 *       type: object
 *       description: Metadatos sobre los comentarios obtenidos
 *       properties:
 *         totalComentarios:
 *           type: integer
 *           description: Número total de comentarios encontrados
 *           example: 2
 *         cursoInfo:
 *           type: object
 *           description: Información del curso consultado
 *           properties:
 *             cursoId:
 *               type: integer
 *               example: 1
 *             nombreCurso:
 *               type: string
 *               example: "Desarrollo Web Frontend"
 *             codigoCurso:
 *               type: string
 *               example: "WEB101"
 *         catedraticoInfo:
 *           type: object
 *           description: Información del catedrático del curso
 *           properties:
 *             catedraticoId:
 *               type: integer
 *               example: 3
 *             nombreCompleto:
 *               type: string
 *               example: "Dr. Carlos Mendoza"
 *     
 *     AnalisisSentimientos:
 *       type: object
 *       description: Resultado del análisis de sentimientos
 *       properties:
 *         totalTextos:
 *           type: integer
 *           description: Número total de textos analizados
 *           example: 3
 *         resultados:
 *           type: array
 *           description: Resultados del análisis para cada texto
 *           items:
 *             $ref: '#/components/schemas/ResultadoSentimiento'
 *         respuestaCompleta:
 *           type: object
 *           description: Respuesta completa de Azure Cognitive Services
 *     
 *     ResultadoSentimiento:
 *       type: object
 *       description: Resultado del análisis de sentimiento para un texto específico
 *       properties:
 *         id:
 *           type: string
 *           description: ID del texto analizado
 *           example: "1"
 *         texto:
 *           type: string
 *           description: Texto que fue analizado
 *           example: "El profesor explica muy bien las clases"
 *         sentimiento:
 *           type: string
 *           enum: [positive, negative, neutral]
 *           description: Sentimiento detectado
 *           example: "positive"
 *         confianza:
 *           type: object
 *           description: Niveles de confianza formateados como porcentajes
 *           properties:
 *             positivo:
 *               type: string
 *               example: "89.45%"
 *             neutral:
 *               type: string
 *               example: "8.32%"
 *             negativo:
 *               type: string
 *               example: "2.23%"
 *         puntuaciones:
 *           type: object
 *           description: Puntuaciones originales de confianza (0-1)
 *           properties:
 *             positive:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 1
 *               example: 0.8945
 *             neutral:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 1
 *               example: 0.0832
 *             negative:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 1
 *               example: 0.0223
 *     
 *     ApiResponse:
 *       type: object
 *       description: Respuesta estándar de la API
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         message:
 *           type: string
 *           description: Mensaje descriptivo de la operación
 *         data:
 *           type: object
 *           description: Datos de respuesta (varía según el endpoint)
 *     
 *     Error:
 *       type: object
 *       description: Respuesta de error estándar
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Tipo de error
 *           example: "ValidationError"
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del error
 *           example: "Los datos enviados no son válidos"
 */

// ===== RUTAS DEL FORMULARIO DE EVALUACIÓN =====

/**
 * @swagger
 * /api/evaluaciones/catedraticos:
 *   get:
 *     summary: Obtener catedráticos con sus cursos
 *     description: |
 *       Retorna todos los catedráticos disponibles para evaluación junto con 
 *       los cursos que imparten. Este endpoint optimizado consolida la información 
 *       en una sola petición para mejorar el rendimiento del frontend.
 *       
 *       **Características:**
 *       - Información completa de catedráticos y cursos
 *       - Optimizado para reducir peticiones HTTP
 *       - Datos listos para usar en formularios de evaluación
 *     tags: [📋 Formulario]
 *     responses:
 *       200:
 *         description: Lista de catedráticos con sus cursos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CatedraticoConCursos'
 *             example:
 *               success: true
 *               message: "Catedráticos con cursos obtenidos exitosamente"
 *               data:
 *                 - catedraticoId: 5
 *                   nombreCompleto: "DANY OTONIEL OLIVA BELTETON"
 *                   cursos:
 *                     - cursoId: 1
 *                       nombreCurso: "Programación Básica"
 *                       seminario: "Seminario de Programación"
 *                     - cursoId: 2
 *                       nombreCurso: "Estructuras de Datos"
 *                       seminario: "Seminario de Programación"
 *                 - catedraticoId: 3
 *                   nombreCompleto: "CARLOS AMILCAR TEZO PALENCIA"
 *                   cursos:
 *                     - cursoId: 3
 *                       nombreCurso: "Base de Datos I"
 *                       seminario: "Seminario de Desarrollo"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/catedraticos', EvaluacionController.getCatedraticos);



/**
 * @swagger
 * /api/evaluaciones/preguntas:
 *   get:
 *     summary: Obtener preguntas de evaluación
 *     description: |
 *       Retorna las 5 preguntas fijas que se utilizan en el formulario de evaluación.
 *       Estas preguntas son estándar para todos los catedráticos y cursos.
 *       
 *       **Características:**
 *       - 5 preguntas estándar de evaluación
 *       - Mismas preguntas para todos los catedráticos
 *       - Cada pregunta tiene un ID único y texto descriptivo
 *     tags: [📋 Formulario]
 *     responses:
 *       200:
 *         description: Preguntas de evaluación obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pregunta'
 *             example:
 *               success: true
 *               message: "Preguntas obtenidas exitosamente"
 *               data:
 *                 - preguntaId: 1
 *                   textoPregunta: "Dominio y manejo del tema del curso."
 *                 - preguntaId: 2
 *                   textoPregunta: "Capacidad para resolver dudas y brindar explicaciones claras."
 *                 - preguntaId: 3
 *                   textoPregunta: "Puntualidad y cumplimiento de horarios establecidos."
 *                 - preguntaId: 4
 *                   textoPregunta: "Uso de metodologías de enseñanza efectivas."
 *                 - preguntaId: 5
 *                   textoPregunta: "Fomento de la participación y el aprendizaje colaborativo."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/preguntas', EvaluacionController.getPreguntas);

/**
 * @swagger
 * /api/evaluaciones:
 *   post:
 *     summary: Crear nueva evaluación
 *     description: |
 *       Registra una evaluación anónima para un curso específico. La evaluación 
 *       incluye puntuaciones del 1 al 5 para las 5 preguntas estándar y comentarios 
 *       libres del estudiante.
 *       
 *       **Validaciones:**
 *       - El curso debe existir en la base de datos
 *       - Se requieren exactamente 5 respuestas (una por pregunta)
 *       - Cada respuesta debe estar entre 1 y 5
 *       - Los comentarios deben tener al menos 10 caracteres
 *       
 *       **Proceso:**
 *       1. Validación de datos de entrada
 *       2. Verificación de existencia del curso
 *       3. Registro anónimo de la evaluación
 *       4. Cálculo automático de estadísticas
 *     tags: [📋 Formulario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluacionRequest'
 *           example:
 *             cursoId: 1
 *             comentarios: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a resolver dudas. Sus clases son dinámicas y fáciles de entender."
 *             respuestas: [5, 4, 5, 4, 5]
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvaluacionResponse'
 *       400:
 *         description: Error de validación en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validacion_respuestas:
 *                 summary: Error en respuestas
 *                 value:
 *                   success: false
 *                   error: "ValidationError"
 *                   message: "Se requieren exactamente 5 respuestas con valores entre 1 y 5"
 *               validacion_comentarios:
 *                 summary: Error en comentarios
 *                 value:
 *                   success: false
 *                   error: "ValidationError"
 *                   message: "Los comentarios deben tener al menos 10 caracteres"
 *       404:
 *         description: El curso especificado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "NotFoundError"
 *               message: "El curso especificado no existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateEvaluacion, EvaluacionController.crearEvaluacion);

// ===== RUTAS DE ESTADÍSTICAS Y REPORTES =====

/**
 * @swagger
 * /api/evaluaciones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas completas
 *     description: |
 *       Retorna estadísticas agregadas de todas las evaluaciones, incluyendo:
 *       - Estadísticas detalladas por catedrático
 *       - Promedio general de todos los seminarios
 *       - Promedios agrupados por seminario
 *       
 *       **Información incluida:**
 *       - Nombre del catedrático y seminario
 *       - Cantidad total de evaluaciones recibidas
 *       - Promedio de calificaciones por catedrático
 *       - Análisis comparativo entre seminarios
 *     tags: [📊 Estadísticas]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EstadisticasCompletas'
 *             example:
 *               success: true
 *               message: "Estadísticas obtenidas exitosamente"
 *               data:
 *                 catedraticos:
 *                   - nombre_catedratico: "DANY OTONIEL OLIVA BELTETON"
 *                     seminario: "Seminario de Programación"
 *                     cantidad_respuestas: 25
 *                     calificacion_promedio_catedratico: 4.52
 *                   - nombre_catedratico: "CARLOS AMILCAR TEZO PALENCIA"
 *                     seminario: "Seminario de Desarrollo"
 *                     cantidad_respuestas: 18
 *                     calificacion_promedio_catedratico: 4.31
 *                 calificacion_general_seminario: 4.35
 *                 promedios_por_seminario:
 *                   - seminario: "Seminario de Programación"
 *                     promedio_general: 4.42
 *                   - seminario: "Seminario de Desarrollo"
 *                     promedio_general: 4.28
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estadisticas', EvaluacionController.getEstadisticas);

/**
 * @swagger
 * /api/evaluaciones/estadisticas/seminarios:
 *   get:
 *     summary: Obtener estadísticas por seminario
 *     description: |
 *       Retorna promedios de calificaciones agrupados únicamente por seminario.
 *       Útil para comparar el rendimiento entre diferentes seminarios.
 *       
 *       **Datos incluidos:**
 *       - Nombre del seminario
 *       - Promedio general del seminario
 *       - Comparación entre seminarios
 *     tags: [📊 Estadísticas]
 *     responses:
 *       200:
 *         description: Estadísticas por seminario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EstadisticasSeminario'
 *             example:
 *               success: true
 *               message: "Estadísticas por seminario obtenidas exitosamente"
 *               data:
 *                 - seminario: "Seminario de Programación"
 *                   promedio_general: 4.42
 *                 - seminario: "Seminario de Desarrollo"
 *                   promedio_general: 4.28
 *                 - seminario: "Seminario de Redes"
 *                   promedio_general: 4.15
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estadisticas/seminarios', EvaluacionController.getEstadisticasPorSeminario);

// ===== RUTAS DE COMENTARIOS =====
/**
 * @swagger
 * /api/evaluaciones/catedraticos/{catedraticoId}/comentarios:
 *   get:
 *     summary: Obtener comentarios de evaluaciones por catedrático (todos sus cursos)
 *     description: |
 *       Retorna todos los comentarios de las evaluaciones realizadas para todos los cursos de un catedrático específico.
 *       - Comentarios ordenados por fecha de evaluación (más recientes primero)
 *       - Incluye información del curso evaluado
 *       - Metadatos sobre el total de comentarios y el catedrático
 *     tags: [📊 Comentarios]
 *     parameters:
 *       - in: path
 *         name: catedraticoId
 *         required: true
 *         description: ID único del catedrático para obtener comentarios
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ComentarioEvaluacion'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalComentarios:
 *                           type: integer
 *                           example: 3
 *                         catedraticoId:
 *                           type: integer
 *                           example: 5
 *             example:
 *               success: true
 *               message: "Comentarios obtenidos exitosamente para el catedrático: DANY OTONIEL OLIVA BELTETON"
 *               data:
 *                 - evaluacionId: 15
 *                   comentarios: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a ayudar."
 *                   fechaEvaluacion: "2024-12-10T14:30:00.000Z"
 *                   curso:
 *                     cursoId: 1
 *                     nombreCurso: "Desarrollo Web Frontend"
 *                     seminario: "Seminario de Programación"
 *               meta:
 *                 totalComentarios: 3
 *                 catedraticoId: 5
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "BadRequest"
 *               message: "El catedraticoId debe ser un número entero válido"
 *       404:
 *         description: Catedrático no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "NotFound"
 *               message: "No se encontró el catedrático con ID: 999"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/catedraticos/:catedraticoId/comentarios', EvaluacionController.getComentariosPorCatedratico);

/**
 * @swagger
 * /api/evaluaciones/cursos/{cursoId}/comentarios:
 *   get:
 *     summary: Obtener comentarios de evaluaciones por curso
 *     description: |
 *       Retorna todos los comentarios de las evaluaciones realizadas para un curso específico.
 *       Incluye información completa del curso, catedrático y metadatos de las evaluaciones.
 *       
 *       **Características:**
 *       - Filtrado por curso específico (cursoId)
 *       - Incluye información del catedrático asociado
 *       - Comentarios ordenados por fecha de evaluación (más recientes primero)
 *       - Validación de existencia del curso
 *       - Metadatos sobre el total de comentarios
 *       
 *       **Casos de uso:**
 *       - Análisis de feedback por curso
 *       - Revisión de comentarios para mejora continua
 *       - Reportes de satisfacción estudiantil por materia
 *     tags: [📊 Comentarios]
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         description: ID único del curso para obtener comentarios
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ComentarioEvaluacion'
 *                     metadata:
 *                       $ref: '#/components/schemas/ComentariosMetadata'
 *             example:
 *               success: true
 *               message: "Comentarios obtenidos exitosamente para el curso: Desarrollo Web Frontend"
 *               data:
 *                 - evaluacionId: 15
 *                   comentarios: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a ayudar."
 *                   fechaEvaluacion: "2024-12-10T14:30:00.000Z"
 *                   curso:
 *                     cursoId: 1
 *                     nombreCurso: "Desarrollo Web Frontend"
 *                     codigoCurso: "WEB101"
 *                   catedratico:
 *                     catedraticoId: 3
 *                     nombreCompleto: "Dr. Carlos Mendoza"
 *                 - evaluacionId: 12
 *                   comentarios: "El contenido del curso es muy actualizado y las prácticas son útiles."
 *                   fechaEvaluacion: "2024-12-08T16:45:00.000Z"
 *                   curso:
 *                     cursoId: 1
 *                     nombreCurso: "Desarrollo Web Frontend"
 *                     codigoCurso: "WEB101"
 *                   catedratico:
 *                     catedraticoId: 3
 *                     nombreCompleto: "Dr. Carlos Mendoza"
 *               metadata:
 *                 totalComentarios: 2
 *                 cursoInfo:
 *                   cursoId: 1
 *                   nombreCurso: "Desarrollo Web Frontend"
 *                   codigoCurso: "WEB101"
 *                 catedraticoInfo:
 *                   catedraticoId: 3
 *                   nombreCompleto: "Dr. Carlos Mendoza"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "BadRequest"
 *               message: "El cursoId debe ser un número entero válido"
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "NotFound"
 *               message: "No se encontró el curso con ID: 999"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cursos/:cursoId/comentarios', EvaluacionController.getComentariosPorCurso);

// ===== RUTAS DEL SISTEMA =====

/**
 * @swagger
 * /api/evaluaciones/health:
 *   get:
 *     summary: Verificar estado de la API
 *     description: |
 *       Endpoint para verificar que la API y la base de datos están funcionando 
 *       correctamente. Útil para monitoreo y diagnóstico del sistema.
 *       
 *       **Información que proporciona:**
 *       - Estado general de la API
 *       - Conectividad con la base de datos
 *       - Timestamp de la verificación
 *       - Conteo de catedráticos en la base de datos
 *       
 *       **Uso recomendado:**
 *       - Monitoreo de salud del sistema
 *       - Verificación de conectividad con la base de datos
 *       - Diagnóstico de problemas de conectividad
 *     tags: [🔧 Sistema]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: API con problemas de conectividad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "ServiceUnavailable"
 *               message: "No se puede conectar con la base de datos"
 */
router.get('/health', EvaluacionController.healthCheck);

// ===== RUTAS DE ANÁLISIS DE SENTIMIENTOS =====

/**
 * @swagger
 * /api/evaluaciones/sentimientos:
 *   post:
 *     summary: Analizar sentimientos de textos
 *     description: |
 *       Analiza los sentimientos de uno o múltiples textos usando Azure Cognitive Services.
 *       Utiliza el servicio Text Analytics de Azure para determinar si el sentimiento es
 *       positivo, neutral o negativo, junto con niveles de confianza.
 *       
 *       **Características:**
 *       - Análisis en español (configurado por defecto)
 *       - Máximo 10 textos por solicitud
 *       - Niveles de confianza para cada sentimiento
 *       - Integración segura con Azure (claves en backend)
 *       - Validación completa de entrada
 *       
 *       **Casos de uso:**
 *       - Análisis de comentarios de evaluaciones
 *       - Evaluación de feedback estudiantil
 *       - Monitoreo de satisfacción
 *       - Investigación de sentimientos académicos
 *     tags: [🧠 Inteligencia Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - textos
 *             properties:
 *               textos:
 *                 type: array
 *                 description: Array de textos para analizar (máximo 10)
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                 minItems: 1
 *                 maxItems: 10
 *                 example:
 *                   - "El profesor explica muy bien las clases"
 *                   - "No me gustó la metodología utilizada"
 *                   - "Excelente dominio del tema y muy puntual"
 *           example:
 *             textos:
 *               - "El profesor explica muy bien las clases y siempre está disponible para resolver dudas"
 *               - "No me gustó la metodología utilizada, muy confusa"
 *               - "Excelente dominio del tema y muy puntual en sus horarios"
 *     responses:
 *       200:
 *         description: Análisis de sentimientos completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AnalisisSentimientos'
 *             example:
 *               success: true
 *               message: "Análisis de sentimientos completado para 3 texto(s)"
 *               data:
 *                 totalTextos: 3
 *                 resultados:
 *                   - id: "1"
 *                     texto: "El profesor explica muy bien las clases y siempre está disponible para resolver dudas"
 *                     sentimiento: "positive"
 *                     confianza:
 *                       positivo: "89.45%"
 *                       neutral: "8.32%"
 *                       negativo: "2.23%"
 *                   - id: "2"
 *                     texto: "No me gustó la metodología utilizada, muy confusa"
 *                     sentimiento: "negative"
 *                     confianza:
 *                       positivo: "5.12%"
 *                       neutral: "15.67%"
 *                       negativo: "79.21%"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               arrayVacio:
 *                 summary: Array vacío
 *                 value:
 *                   success: false
 *                   error: "BadRequest"
 *                   message: "El array de textos no puede estar vacío"
 *               demasiadosTextos:
 *                 summary: Demasiados textos
 *                 value:
 *                   success: false
 *                   error: "BadRequest"
 *                   message: "Máximo 10 textos por solicitud"
 *               formatoInvalido:
 *                 summary: Formato inválido
 *                 value:
 *                   success: false
 *                   error: "BadRequest"
 *                   message: "Se requiere un array de textos para analizar"
 *       502:
 *         description: Error de comunicación con Azure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "BadGateway"
 *               message: "Error al comunicarse con el servicio de Azure"
 *       500:
 *         description: Error de configuración del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "InternalServerError"
 *               message: "Configuración del servicio de análisis de sentimientos no disponible"
 */
router.post('/sentimientos', sentimentRateLimiter.middleware(), EvaluacionController.analizarSentimientos);

module.exports = router;