// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
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
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor de desarrollo'
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
    ]
  },
  apis: ['./src/routes/*.js'], // Paths a archivos que contienen definiciones OpenAPI
};

const specs = swaggerJsdoc(options);

module.exports = specs;