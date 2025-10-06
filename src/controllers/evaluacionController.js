// src/controllers/evaluacionController.js
const EvaluacionModel = require('../models/evaluacionModel');

class EvaluacionController {

  // === CONTROLADORES PARA EL FORMULARIO ===

  /**
   * Obtener todos los catedráticos con sus cursos
   */
  static async getCatedraticos(req, res, next) {
    try {
      const catedraticos = await EvaluacionModel.getCatedraticos();
      res.status(200).json({
        success: true,
        data: catedraticos,
        message: 'Catedráticos con cursos obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener las 5 preguntas fijas
   */
  static async getPreguntas(req, res, next) {
    try {
      const preguntas = await EvaluacionModel.getPreguntas();
      res.status(200).json({
        success: true,
        data: preguntas,
        message: 'Preguntas obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registrar una nueva evaluación
   */
  static async crearEvaluacion(req, res, next) {
    try {
      const { cursoId, comentarios, respuestas } = req.body;

      // Verificar que el curso existe
      const cursoExiste = await EvaluacionModel.verificarCurso(cursoId);
      if (!cursoExiste) {
        return res.status(404).json({
          success: false,
          message: 'El curso especificado no existe'
        });
      }

      // Crear la evaluación
      const evaluacion = await EvaluacionModel.crearEvaluacion({
        cursoId,
        comentarios: comentarios.trim(),
        respuestas
      });

      res.status(201).json({
        success: true,
        data: {
          evaluacionId: evaluacion.evaluacionId,
          mensaje: 'Evaluación registrada exitosamente'
        },
        message: 'Evaluación creada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener comentarios de evaluaciones por curso
   */
  static async getComentariosPorCurso(req, res, next) {
    try {
      const { cursoId } = req.params;
      
      // Validar que el cursoId sea un número válido
      if (!cursoId || isNaN(parseInt(cursoId))) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'El ID del curso debe ser un número válido'
        });
      }

      const comentarios = await EvaluacionModel.getComentariosPorCurso(cursoId);
      
      // Verificar si el curso existe pero no tiene evaluaciones
      if (comentarios.length === 0) {
        // Verificar si el curso existe
        const cursoExiste = await EvaluacionModel.verificarCursoExiste(cursoId);
        if (!cursoExiste) {
          return res.status(404).json({
            success: false,
            error: 'NotFoundError',
            message: 'El curso especificado no existe'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron comentarios para este curso',
          meta: {
            totalComentarios: 0,
            curso: null
          }
        });
      }

      // Obtener información del curso desde el primer comentario
      const cursoInfo = comentarios[0].curso;
      
      res.status(200).json({
        success: true,
        data: comentarios.map(evaluacion => ({
          evaluacionId: evaluacion.evaluacionId,
          comentarios: evaluacion.comentarios,
          fechaEvaluacion: evaluacion.fechaEvaluacion
        })),
        message: 'Comentarios obtenidos exitosamente',
        meta: {
          totalComentarios: comentarios.length,
          curso: {
            cursoId: cursoInfo.cursoId,
            nombreCurso: cursoInfo.nombreCurso,
            seminario: cursoInfo.seminario,
            catedratico: {
              catedraticoId: cursoInfo.catedratico.catedraticoId,
              nombreCompleto: cursoInfo.catedratico.nombreCompleto
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // === CONTROLADORES PARA ESTADÍSTICAS ===

  /**
   * Obtener estadísticas completas
   */
  static async getEstadisticas(req, res, next) {
    try {
      const estadisticas = await EvaluacionModel.getEstadisticas();
      
      res.status(200).json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas por seminario
   */
  static async getEstadisticasPorSeminario(req, res, next) {
    try {
      const promediosPorSeminario = await EvaluacionModel.getPromediosPorSeminario();
      
      res.status(200).json({
        success: true,
        data: promediosPorSeminario,
        message: 'Estadísticas por seminario obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // === CONTROLADORES ADICIONALES ===

  /**
   * Obtener información de salud de la API
   */
  static async healthCheck(req, res) {
    try {
      // Verificar conexión a la base de datos
      const cantidadCatedraticos = await EvaluacionModel.getCatedraticos();
      
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
          catedraticos: cantidadCatedraticos.length
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'API con problemas de conectividad',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: error.message
        }
      });
    }
  }
}

module.exports = EvaluacionController;