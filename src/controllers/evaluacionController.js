// src/controllers/evaluacionController.js
const EvaluacionModel = require('../models/evaluacionModel');

class EvaluacionController {

  // === CONTROLADORES PARA EL FORMULARIO ===

  /**
   * Obtener todos los catedráticos disponibles
   */
  static async getCatedraticos(req, res, next) {
    try {
      const catedraticos = await EvaluacionModel.getCatedraticos();
      res.status(200).json({
        success: true,
        data: catedraticos,
        message: 'Catedráticos obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener cursos por catedrático
   */
  static async getCursosPorCatedratico(req, res, next) {
    try {
      const { catedraticoId } = req.params;
      const cursos = await EvaluacionModel.getCursosPorCatedratico(catedraticoId);
      
      if (cursos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron cursos para este catedrático'
        });
      }

      res.status(200).json({
        success: true,
        data: cursos,
        message: 'Cursos obtenidos exitosamente'
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