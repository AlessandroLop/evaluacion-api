// src/controllers/evaluacionController.js
const EvaluacionModel = require('../models/evaluacionModel');

class EvaluacionController {
  /**
   * Obtener comentarios de evaluaciones por catedrático (todos sus cursos)
   */
  static async getComentariosPorCatedratico(req, res, next) {
    try {
      const { catedraticoId } = req.params;
      if (!catedraticoId || isNaN(parseInt(catedraticoId))) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'El ID del catedrático debe ser un número válido'
        });
      }
      const comentarios = await EvaluacionModel.getComentariosPorCatedratico(catedraticoId);
      res.status(200).json({
        success: true,
        data: comentarios,
        message: 'Comentarios obtenidos exitosamente',
        meta: {
          totalComentarios: comentarios.length,
          catedraticoId: parseInt(catedraticoId)
        }
      });
    } catch (error) {
      next(error);
    }
  }

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
      const { cursoId, catedraticoId, comentarios, respuestas } = req.body;

      // Validar que los IDs sean números válidos
      if (!cursoId || isNaN(parseInt(cursoId)) || !catedraticoId || isNaN(parseInt(catedraticoId))) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere cursoId y catedraticoId válidos'
        });
      }

      // Verificar que el curso pertenece al catedrático
      const relacionValida = await EvaluacionModel.verificarCursoDeCatedratico(cursoId, catedraticoId);
      if (!relacionValida) {
        return res.status(404).json({
          success: false,
          message: 'El curso no pertenece al catedrático especificado'
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

  // === CONTROLADORES PARA ANÁLISIS DE SENTIMIENTOS ===

  /**
   * Analizar sentimientos de textos usando Azure Cognitive Services
   */
  static async analizarSentimientos(req, res, next) {
    try {
      const { textos } = req.body;

      // Validaciones
      if (!textos || !Array.isArray(textos)) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Se requiere un array de textos para analizar'
        });
      }

      if (textos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'El array de textos no puede estar vacío'
        });
      }

      if (textos.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Máximo 10 textos por solicitud'
        });
      }

      // Validar que todos los textos sean strings válidos
      const textosValidos = textos.filter(texto => 
        typeof texto === 'string' && texto.trim().length > 0
      );

      if (textosValidos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Todos los textos deben ser strings válidos y no vacíos'
        });
      }

      // Log de la solicitud
      console.log(`🧠 Iniciando análisis de sentimientos para ${textosValidos.length} texto(s)`);
      
      // Llamar al servicio de Azure a través del modelo
      const startTime = Date.now();
      const resultado = await EvaluacionModel.analyzeSentiments(textosValidos);
      const endTime = Date.now();
      
      console.log(`✅ Análisis completado en ${endTime - startTime}ms`);

      // Formatear respuesta
      const respuesta = {
        totalTextos: textosValidos.length,
        resultados: resultado.documents?.map(doc => ({
          id: doc.id,
          texto: doc.sentences?.[0]?.text || 'Sin texto',
          sentimiento: doc.sentiment || 'Desconocido',
          confianza: {
            positivo: doc.confidenceScores?.positive ? (doc.confidenceScores.positive * 100).toFixed(2) + '%' : '0.00%',
            neutral: doc.confidenceScores?.neutral ? (doc.confidenceScores.neutral * 100).toFixed(2) + '%' : '0.00%',
            negativo: doc.confidenceScores?.negative ? (doc.confidenceScores.negative * 100).toFixed(2) + '%' : '0.00%'
          },
          puntuaciones: doc.confidenceScores || {}
        })) || [],
        respuestaCompleta: resultado
      };

      res.status(200).json({
        success: true,
        data: respuesta,
        message: `Análisis de sentimientos completado para ${textosValidos.length} texto(s)`
      });

    } catch (error) {
      console.error('🔥 Error en analizarSentimientos:', error.message);
      
      // Manejo específico de errores de Azure y timeouts
      if (error.message.includes('Timeout') || error.message.includes('timeout')) {
        return res.status(408).json({
          success: false,
          error: 'RequestTimeout',
          message: 'El servicio de análisis tardó demasiado en responder. Intenta con menos textos o espera unos momentos.',
          suggestion: 'Reduce la cantidad de textos o intenta de nuevo en unos segundos'
        });
      }

      if (error.message.includes('Rate limit') || error.message.includes('429')) {
        return res.status(429).json({
          success: false,
          error: 'RateLimitExceeded',
          message: 'Límite de solicitudes de Azure alcanzado. Espera unos segundos antes de intentar de nuevo.',
          retryAfter: 5
        });
      }

      if (error.message.includes('Clave de Azure inválida') || error.message.includes('401')) {
        return res.status(500).json({
          success: false,
          error: 'AuthenticationError',
          message: 'Error de autenticación con Azure. Contacta al administrador.'
        });
      }

      if (error.message.includes('Servicio de Azure temporalmente') || error.message.includes('503')) {
        return res.status(503).json({
          success: false,
          error: 'ServiceUnavailable',
          message: 'El servicio de Azure está temporalmente no disponible. Intenta de nuevo en unos minutos.'
        });
      }

      if (error.message.includes('Error de conexión')) {
        return res.status(502).json({
          success: false,
          error: 'ConnectionError',
          message: 'No se pudo conectar con el servicio de análisis de sentimientos. Verifica tu conexión a internet.',
          suggestion: 'Intenta de nuevo en unos momentos'
        });
      }

      if (error.message.includes('Azure API Error')) {
        return res.status(502).json({
          success: false,
          error: 'BadGateway',
          message: 'Error al comunicarse con el servicio de Azure',
          details: error.message
        });
      }

      if (error.message.includes('Configuración de Azure')) {
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Configuración del servicio de análisis de sentimientos no disponible'
        });
      }

      // Error genérico
      next(error);
    }
  }
}

module.exports = EvaluacionController;