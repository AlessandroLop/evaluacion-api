// src/models/evaluacionModel.js
const prisma = require('../config/database');

class EvaluacionModel {
  
  // === MÉTODOS PARA EL FORMULARIO ===
  
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

        // Crear las respuestas
        const respuestasData = respuestas.map((puntuacion, index) => ({
          evaluacionId: evaluacion.evaluacionId,
          preguntaId: index + 1, // Las preguntas tienen IDs del 1 al 5
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
}

module.exports = EvaluacionModel;