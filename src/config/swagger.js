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
        url: process.env.NODE_ENV === 'production' 
          ? 'https://https://evaluacion-api.vercel.app/'
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
    ]
  },
  apis: [
    process.env.NODE_ENV === 'production' 
      ? './src/routes/*.js'
      : './src/routes/*.js'
  ], // Paths a archivos que contienen definiciones OpenAPI
};

const specs = swaggerJsdoc(options);

module.exports = specs;