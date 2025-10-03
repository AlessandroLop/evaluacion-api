// src/config/swagger.js - Configuración estática para Vercel

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Evaluación de Catedráticos',
    version: '1.0.0',
    description: 'API REST para gestionar evaluaciones anónimas de catedráticos usando Prisma y Supabase',
    contact: {
      name: 'Soporte API',
      email: 'soporte@evaluacion-api.com'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://evaluacion-3t37ji24x-jimmy-alessandro-lopez-lopezs-projects.vercel.app'
        : `http://localhost:${process.env.PORT || 3001}`,
      description: process.env.NODE_ENV === 'production' ? 'Servidor de producción (Vercel)' : 'Servidor de desarrollo'
    }
  ],
  tags: [
    {
      name: 'Formulario',
      description: 'Endpoints para el formulario de evaluación'
    },
    {
      name: 'Estadísticas', 
      description: 'Endpoints para estadísticas y reportes'
    },
    {
      name: 'Sistema',
      description: 'Endpoints del sistema'
    }
  ],
  paths: {
    '/': {
      get: {
        tags: ['Sistema'],
        summary: 'Información general de la API',
        description: 'Retorna información básica sobre la API',
        responses: {
          '200': {
            description: 'Información de la API',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health Check de la API',
        description: 'Verifica el estado de salud de la API y conexión a base de datos',
        responses: {
          '200': {
            description: 'API funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    timestamp: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones/catedraticos': {
      get: {
        tags: ['Formulario'],
        summary: 'Obtener lista de catedráticos',
        description: 'Retorna todos los catedráticos disponibles para evaluación',
        responses: {
          '200': {
            description: 'Lista de catedráticos obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          catedraticoId: { type: 'integer' },
                          nombreCompleto: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones/catedraticos/{id}/cursos': {
      get: {
        tags: ['Formulario'],
        summary: 'Obtener cursos de un catedrático',
        description: 'Retorna los cursos impartidos por un catedrático específico',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del catedrático',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Cursos obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          cursoId: { type: 'integer' },
                          nombreCurso: { type: 'string' },
                          seminario: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones/preguntas': {
      get: {
        tags: ['Formulario'],
        summary: 'Obtener preguntas de evaluación',
        description: 'Retorna las preguntas disponibles para el formulario de evaluación',
        responses: {
          '200': {
            description: 'Preguntas obtenidas exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          preguntaId: { type: 'integer' },
                          textoPregunta: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones': {
      post: {
        tags: ['Formulario'],
        summary: 'Crear nueva evaluación',
        description: 'Crea una nueva evaluación anónima para un catedrático y curso',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['catedraticoId', 'cursoId', 'respuestas'],
                properties: {
                  catedraticoId: { type: 'integer', description: 'ID del catedrático a evaluar' },
                  cursoId: { type: 'integer', description: 'ID del curso' },
                  comentarios: { type: 'string', description: 'Comentarios adicionales (opcional)' },
                  respuestas: {
                    type: 'array',
                    description: 'Array de respuestas a las preguntas',
                    items: {
                      type: 'object',
                      required: ['preguntaId', 'calificacion'],
                      properties: {
                        preguntaId: { type: 'integer', description: 'ID de la pregunta' },
                        calificacion: { type: 'integer', minimum: 1, maximum: 5, description: 'Calificación del 1 al 5' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Evaluación creada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        evaluacionId: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Error de validación',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    error: { type: 'string' },
                    details: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/evaluaciones/estadisticas': {
      get: {
        tags: ['Estadísticas'],
        summary: 'Obtener estadísticas generales',
        description: 'Retorna estadísticas generales de las evaluaciones',
        responses: {
          '200': {
            description: 'Estadísticas obtenidas exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalEvaluaciones: { type: 'integer' },
                        totalCatedraticos: { type: 'integer' },
                        totalCursos: { type: 'integer' },
                        promedioGeneral: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;