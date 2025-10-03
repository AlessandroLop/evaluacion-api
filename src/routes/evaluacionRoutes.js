// src/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();
const EvaluacionController = require('../controllers/evaluacionController');
const { validateEvaluacion, validateId } = require('../middlewares/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Catedratico:
 *       type: object
 *       properties:
 *         catedraticoId:
 *           type: integer
 *           description: ID único del catedrático
 *           example: 1
 *         nombreCompleto:
 *           type: string
 *           description: Nombre completo del catedrático
 *           example: "MARIO ROBERTO MENDEZ ROMERO"
 *     
 *     Curso:
 *       type: object
 *       properties:
 *         cursoId:
 *           type: integer
 *           description: ID único del curso
 *           example: 1
 *         nombreCurso:
 *           type: string
 *           description: Nombre del curso
 *           example: "programacion Basica"
 *         seminario:
 *           type: string
 *           description: Nombre del seminario
 *           example: "Seminario de Programación"
 *         catedratico:
 *           type: object
 *           properties:
 *             nombreCompleto:
 *               type: string
 *               example: "MARIO ROBERTO MENDEZ ROMERO"
 *     
 *     Pregunta:
 *       type: object
 *       properties:
 *         preguntaId:
 *           type: integer
 *           description: ID único de la pregunta
 *           example: 1
 *         textoPregunta:
 *           type: string
 *           description: Texto de la pregunta
 *           example: "Dominio y manejo del tema del curso."
 *     
 *     EvaluacionRequest:
 *       type: object
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
 *           description: Comentarios libres del estudiante (mínimo 10 caracteres)
 *           example: "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a resolver dudas."
 *         respuestas:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 1
 *             maximum: 5
 *           minItems: 5
 *           maxItems: 5
 *           description: Puntuaciones para las 5 preguntas (1-5)
 *           example: [5, 4, 5, 4, 5]
 *     
 *     EvaluacionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             evaluacionId:
 *               type: integer
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
 *       properties:
 *         nombre_catedratico:
 *           type: string
 *           description: Nombre del catedrático
 *           example: "MARIO ROBERTO MENDEZ ROMERO"
 *         seminario:
 *           type: string
 *           description: Seminario donde imparte
 *           example: "Seminario de Programación"
 *         cantidad_respuestas:
 *           type: integer
 *           description: Número total de evaluaciones recibidas
 *           example: 15
 *         calificacion_promedio_catedratico:
 *           type: number
 *           format: float
 *           description: Promedio de calificaciones del catedrático
 *           example: 4.27
 *     
 *     Estadisticas:
 *       type: object
 *       properties:
 *         catedraticos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EstadisticaCatedratico'
 *         calificacion_general_seminario:
 *           type: number
 *           format: float
 *           description: Promedio general de todos los seminarios
 *           example: 4.35
 *         promedios_por_seminario:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               seminario:
 *                 type: string
 *                 example: "Seminario de Programación"
 *               promedio_general:
 *                 type: number
 *                 format: float
 *                 example: 4.20
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Tipo de error
 *           example: "Error de validación"
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del error
 *           example: "El campo de comentarios es obligatorio"
 */

// === RUTAS PARA EL FORMULARIO ===

/**
 * @swagger
 * /api/evaluaciones/catedraticos:
 *   get:
 *     summary: Obtener lista de catedráticos
 *     description: Retorna todos los catedráticos disponibles para evaluación
 *     tags: [Formulario]
 *     responses:
 *       200:
 *         description: Lista de catedráticos obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Catedratico'
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
 * /api/evaluaciones/catedraticos/{catedraticoId}/cursos:
 *   get:
 *     summary: Obtener cursos por catedrático
 *     description: Retorna todos los cursos impartidos por un catedrático específico
 *     tags: [Formulario]
 *     parameters:
 *       - in: path
 *         name: catedraticoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del catedrático
 *         example: 1
 *     responses:
 *       200:
 *         description: Cursos obtenidos exitosamente
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
 *                         $ref: '#/components/schemas/Curso'
 *       400:
 *         description: ID de catedrático inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontraron cursos para este catedrático
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/catedraticos/:catedraticoId/cursos', validateId, EvaluacionController.getCursosPorCatedratico);

/**
 * @swagger
 * /api/evaluaciones/preguntas:
 *   get:
 *     summary: Obtener preguntas de evaluación
 *     description: Retorna las 5 preguntas fijas del formulario de evaluación
 *     tags: [Formulario]
 *     responses:
 *       200:
 *         description: Preguntas obtenidas exitosamente
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
 *     summary: Registrar nueva evaluación
 *     description: Registra una evaluación anónima para un curso específico con validaciones completas
 *     tags: [Formulario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluacionRequest'
 *     responses:
 *       201:
 *         description: Evaluación registrada exitosamente
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
 *       404:
 *         description: El curso especificado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateEvaluacion, EvaluacionController.crearEvaluacion);

// === RUTAS PARA ESTADÍSTICAS ===

/**
 * @swagger
 * /api/evaluaciones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas completas
 *     description: Retorna estadísticas agregadas de todas las evaluaciones por catedrático y seminario
 *     tags: [Estadísticas]
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
 *                       $ref: '#/components/schemas/Estadisticas'
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
 *     description: Retorna promedios de calificaciones agrupados por seminario
 *     tags: [Estadísticas]
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
 *                         type: object
 *                         properties:
 *                           seminario:
 *                             type: string
 *                           promedio_general:
 *                             type: number
 *                             format: float
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estadisticas/seminarios', EvaluacionController.getEstadisticasPorSeminario);

// === RUTAS DEL SISTEMA ===

/**
 * @swagger
 * /api/evaluaciones/health:
 *   get:
 *     summary: Verificar estado de la API
 *     description: Endpoint para verificar que la API y la base de datos están funcionando correctamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         database:
 *                           type: string
 *                           example: "connected"
 *                         catedraticos:
 *                           type: integer
 *                           example: 4
 *       503:
 *         description: API con problemas de conectividad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/health', EvaluacionController.healthCheck);

module.exports = router;