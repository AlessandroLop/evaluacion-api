// src/config/swagger.js - Configuración estática para mejor compatibilidad con Vercel

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
    ]
  };
const specs = swaggerJsdoc(options);

module.exports = specs;