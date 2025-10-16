// src/models/evaluacionModel.js
const prisma = require('../config/database');

class EvaluacionModel {
  /**
   * Verificar si un curso pertenece a un catedrático
   */
  static async verificarCursoDeCatedratico(cursoId, catedraticoId) {
    try {
      const curso = await prisma.curso.findFirst({
        where: {
          cursoId: parseInt(cursoId),
          catedraticoId: parseInt(catedraticoId)
        }
      });
      return !!curso;
    } catch (error) {
      console.error('Error al verificar relación curso-catedrático:', error);
      return false;
    }
  }
  
  // === MÉTODOS PARA EL FORMULARIO ===

  /**
   * Obtener comentarios de evaluaciones por catedrático (todos sus cursos)
   */
  static async getComentariosPorCatedratico(catedraticoId) {
    try {
      // Obtener todos los cursos del catedrático
      const cursos = await prisma.curso.findMany({
        where: { catedraticoId: parseInt(catedraticoId) },
        select: { cursoId: true, nombreCurso: true, seminario: true }
      });
      if (cursos.length === 0) return [];

      // Obtener todas las evaluaciones de esos cursos
      const cursoIds = cursos.map(c => c.cursoId);
      const evaluaciones = await prisma.evaluacion.findMany({
        where: { cursoId: { in: cursoIds } },
        select: {
          evaluacionId: true,
          comentarios: true,
          fechaEvaluacion: true,
          curso: {
            select: {
              cursoId: true,
              nombreCurso: true,
              seminario: true
            }
          }
        },
        orderBy: { fechaEvaluacion: 'desc' }
      });
      return evaluaciones;
    } catch (error) {
      console.error('Error al obtener comentarios por catedrático:', error);
      throw new Error('Error al obtener los comentarios del catedrático');
    }
  }
  
  /**
   * Obtener todos los catedráticos con sus cursos
   */
  static async getCatedraticos() {
    return await prisma.catedratico.findMany({
      select: {
        catedraticoId: true,
        nombreCompleto: true,
        cursos: {
          select: {
            cursoId: true,
            nombreCurso: true,
            seminario: true
          },
          orderBy: {
            nombreCurso: 'asc'
          }
        }
      },
      orderBy: {
        nombreCompleto: 'asc'
      }
    });
  }

  /**
   * Obtener las 5 preguntas fijas
   */
  static async getPreguntas() {
    return await prisma.pregunta.findMany({
      select: {
        preguntaId: true,
        textoPregunta: true
      },
      orderBy: {
        preguntaId: 'asc'
      }
    });
  }

  /**
   * Crear una nueva evaluación con sus respuestas (transacción)
   */
  static async crearEvaluacion({ cursoId, comentarios, respuestas }) {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear la evaluación
        const evaluacion = await tx.evaluacion.create({
          data: {
            cursoId: parseInt(cursoId),
            comentarios: comentarios.trim()
          }
        });

        // Obtener los IDs reales de las preguntas (ordenados por preguntaId asc)
        const preguntas = await tx.pregunta.findMany({
          orderBy: { preguntaId: 'asc' }
        });
        if (preguntas.length !== respuestas.length) {
          throw new Error('El número de respuestas no coincide con el número de preguntas');
        }

        // Crear las respuestas usando los IDs reales
        const respuestasData = respuestas.map((puntuacion, index) => ({
          evaluacionId: evaluacion.evaluacionId,
          preguntaId: preguntas[index].preguntaId,
          puntuacion: parseInt(puntuacion)
        }));

        await tx.respuesta.createMany({
          data: respuestasData
        });

        return evaluacion;
      });

      return resultado;
    } catch (error) {
      console.error('Error al crear evaluación:', error);
      throw new Error('Error al crear la evaluación en la base de datos');
    }
  }

  /**
   * Verificar si un curso existe
   */
  static async verificarCursoExiste(cursoId) {
    try {
      const curso = await prisma.curso.findUnique({
        where: {
          cursoId: parseInt(cursoId)
        }
      });
      return !!curso;
    } catch (error) {
      console.error('Error al verificar curso:', error);
      return false;
    }
  }

  /**
   * Obtener comentarios de evaluaciones por curso
   */
  static async getComentariosPorCurso(cursoId) {
    try {
      const comentarios = await prisma.evaluacion.findMany({
        where: {
          cursoId: parseInt(cursoId)
        },
        select: {
          evaluacionId: true,
          comentarios: true,
          fechaEvaluacion: true,
          curso: {
            select: {
              cursoId: true,
              nombreCurso: true,
              seminario: true,
              catedratico: {
                select: {
                  catedraticoId: true,
                  nombreCompleto: true
                }
              }
            }
          }
        },
        orderBy: {
          fechaEvaluacion: 'desc' // Comentarios más recientes primero
        }
      });

      return comentarios;
    } catch (error) {
      console.error('Error al obtener comentarios por curso:', error);
      throw new Error('Error al obtener los comentarios del curso');
    }
  }

  // === MÉTODOS PARA ESTADÍSTICAS ===

  /**
   * Obtener estadísticas completas de evaluaciones
   */
  static async getEstadisticas() {
    try {
      // Estadísticas por catedrático
      const estadisticasCatedraticos = await prisma.catedratico.findMany({
        select: {
          catedraticoId: true,
          nombreCompleto: true,
          cursos: {
            select: {
              seminario: true,
              evaluaciones: {
                select: {
                  evaluacionId: true,
                  respuestas: {
                    select: {
                      puntuacion: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Procesar estadísticas por catedrático
      const catedraticosConEstadisticas = estadisticasCatedraticos.map(catedratico => {
        const todasLasEvaluaciones = catedratico.cursos.flatMap(curso => curso.evaluaciones);
        const todasLasRespuestas = todasLasEvaluaciones.flatMap(evaluacion => evaluacion.respuestas);
        
        const cantidadRespuestas = todasLasEvaluaciones.length;
        const sumaPuntuaciones = todasLasRespuestas.reduce((sum, respuesta) => sum + respuesta.puntuacion, 0);
        const promedioCalificacion = cantidadRespuestas > 0 ? sumaPuntuaciones / todasLasRespuestas.length : 0;
        
        // Obtener seminario (asumiendo que un catedrático puede tener cursos de diferentes seminarios)
        const seminarios = [...new Set(catedratico.cursos.map(curso => curso.seminario).filter(Boolean))];
        
        return {
          nombre_catedratico: catedratico.nombreCompleto,
          seminario: seminarios.join(', ') || 'Sin seminario',
          cantidad_respuestas: cantidadRespuestas,
          calificacion_promedio_catedratico: Math.round(promedioCalificacion * 100) / 100
        };
      }).filter(catedratico => catedratico.cantidad_respuestas > 0); // Solo mostrar catedráticos con evaluaciones

      // Promedio general por seminario
      const promediosPorSeminario = await this.getPromediosPorSeminario();
      
      // Promedio general de todos los seminarios
      const promedioGeneral = promediosPorSeminario.length > 0 
        ? promediosPorSeminario.reduce((sum, sem) => sum + sem.promedio_general, 0) / promediosPorSeminario.length
        : 0;

      return {
        catedraticos: catedraticosConEstadisticas,
        calificacion_general_seminario: Math.round(promedioGeneral * 100) / 100,
        promedios_por_seminario: promediosPorSeminario
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener estadísticas de la base de datos');
    }
  }

  /**
   * Obtener promedios por seminario
   */
  static async getPromediosPorSeminario() {
    try {
      const seminarios = await prisma.curso.findMany({
        where: {
          seminario: {
            not: null
          }
        },
        select: {
          seminario: true,
          evaluaciones: {
            select: {
              respuestas: {
                select: {
                  puntuacion: true
                }
              }
            }
          }
        }
      });

      // Agrupar por seminario
      const seminarioMap = {};
      seminarios.forEach(curso => {
        const seminario = curso.seminario;
        if (!seminarioMap[seminario]) {
          seminarioMap[seminario] = [];
        }
        curso.evaluaciones.forEach(evaluacion => {
          evaluacion.respuestas.forEach(respuesta => {
            seminarioMap[seminario].push(respuesta.puntuacion);
          });
        });
      });

      // Calcular promedios
      const promediosPorSeminario = Object.entries(seminarioMap).map(([seminario, puntuaciones]) => {
        const promedio = puntuaciones.length > 0 
          ? puntuaciones.reduce((sum, punt) => sum + punt, 0) / puntuaciones.length 
          : 0;
        
        return {
          seminario,
          promedio_general: Math.round(promedio * 100) / 100
        };
      });

      return promediosPorSeminario;
    } catch (error) {
      console.error('Error al obtener promedios por seminario:', error);
      throw new Error('Error al obtener promedios por seminario');
    }
  }

  /**
   * Verificar si un curso existe
   */
  static async verificarCurso(cursoId) {
    const curso = await prisma.curso.findUnique({
      where: {
        cursoId: parseInt(cursoId)
      }
    });
    return curso !== null;
  }

  // === MÉTODOS PARA ANÁLISIS DE SENTIMIENTOS ===

  /**
   * Cache simple para resultados de análisis de sentimientos
   */
  static sentimentCache = new Map();
  static cacheMaxSize = 100;
  static cacheTimeout = 1000 * 60 * 15; // 15 minutos

  /**
   * Generar clave de cache para textos
   */
  static generateCacheKey(texts) {
    return JSON.stringify(texts.map(t => t.trim().toLowerCase()).sort());
  }

  /**
   * Limpiar cache antiguo
   */
  static cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.sentimentCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.sentimentCache.delete(key);
      }
    }
  }

  /**
   * Crear timeout personalizado para fetch
   */
  static createFetchWithTimeout(timeoutMs = 15000) {
    return async (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Timeout: Azure Cognitive Services no respondió a tiempo');
        }
        throw error;
      }
    };
  }

  /**
   * Analizar sentimientos usando Azure Cognitive Services con optimizaciones
   * @param {Array} texts - Array de textos para analizar
   * @returns {Promise<Object>} - Resultado del análisis de sentimientos
   */
  static async analyzeSentiments(texts) {
    const endpoint = process.env.AZURE_TEXT_ANALYTICS_ENDPOINT;
    const subscriptionKey = process.env.AZURE_TEXT_ANALYTICS_KEY;
    
    if (!endpoint || !subscriptionKey) {
      throw new Error('Configuración de Azure Text Analytics no encontrada');
    }

    // Generar clave de cache
    const cacheKey = this.generateCacheKey(texts);
    
    // Limpiar cache antiguo
    this.cleanCache();
    
    // Verificar cache
    if (this.sentimentCache.has(cacheKey)) {
      const cached = this.sentimentCache.get(cacheKey);
      console.log('📋 Usando resultado desde cache para análisis de sentimientos');
      return cached.data;
    }

    const url = `${endpoint}text/analytics/v3.1/sentiment?language=es`;
    
    // Preparar documentos para Azure (máximo 10 documentos por request)
    const documents = texts.map((text, index) => ({
      id: (index + 1).toString(),
      text: text.trim()
    }));

    const requestBody = { documents };

    try {
      console.log('🔄 Iniciando análisis de sentimientos con Azure...');
      const startTime = Date.now();
      
      // Crear fetch con timeout personalizado
      const fetchWithTimeout = this.createFetchWithTimeout(15000); // 15 segundos
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const endTime = Date.now();
      console.log(`⏱️ Azure respondió en ${endTime - startTime}ms`);

      if (!response.ok) {
        const errorData = await response.text();
        
        // Manejo específico de rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 2;
          throw new Error(`Rate limit alcanzado. Espera ${retryAfter} segundos antes de hacer otra solicitud.`);
        }
        
        // Manejo de otros errores de Azure
        if (response.status === 401) {
          throw new Error('Clave de Azure inválida o expirada');
        }
        
        if (response.status === 503) {
          throw new Error('Servicio de Azure temporalmente no disponible');
        }
        
        throw new Error(`Azure API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Validar respuesta de Azure
      if (!data || !data.documents) {
        throw new Error('Respuesta inválida de Azure Cognitive Services');
      }

      // Guardar en cache si el cache no está lleno
      if (this.sentimentCache.size < this.cacheMaxSize) {
        this.sentimentCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        console.log('💾 Resultado guardado en cache');
      }

      console.log('✅ Análisis de sentimientos completado exitosamente');
      return data;
      
    } catch (error) {
      console.error('❌ Error en análisis de sentimientos:', error.message);
      
      // Re-lanzar con mensaje más específico
      if (error.message.includes('fetch')) {
        throw new Error('Error de conexión con Azure Cognitive Services');
      }
      
      if (error.message.includes('Timeout')) {
        throw new Error('El servicio de Azure tardó demasiado en responder. Intenta de nuevo.');
      }
      
      throw error;
    }
  }
}

module.exports = EvaluacionModel;