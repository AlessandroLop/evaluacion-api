// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { apiReference } = require('@scalar/express-api-reference');

// Importar middlewares y rutas
const errorHandler = require('./middlewares/errorHandler');
const evaluacionRoutes = require('./routes/evaluacionRoutes');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// === MIDDLEWARES GLOBALES ===
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Permitir todos los orígenes en producción (Vercel)
    : ['http://localhost:3000', 'http://localhost:3001'], // URLs permitidas en desarrollo
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// === RUTAS PRINCIPALES ===

// Ruta principal de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 API de Evaluación de Catedráticos',
    data: {
      version: '1.0.0',
      description: 'API REST para gestionar evaluaciones anónimas de catedráticos',
      autor: 'Sistema de Evaluación Académica',
      endpoints: {
        documentacion: `/docs`,
        api_spec: `/api-docs.json`,
        evaluaciones: `/api/evaluaciones`,
        health: `/api/evaluaciones/health`
      },
      database: 'Supabase + Prisma ORM',
      pattern: 'MVC (Model-View-Controller)'
    }
  });
});

// Documentación de la API con Scalar
app.use('/docs', apiReference({
  theme: 'purple',
  spec: {
    content: swaggerSpec
  },
  metaData: {
    title: 'API de Evaluación de Catedráticos - Documentación',
    description: 'Documentación interactiva para la API REST de evaluación de catedráticos',
    ogDescription: 'API REST completa para gestionar evaluaciones anónimas de catedráticos universitarios'
  }
}));

// Endpoint para obtener la especificación OpenAPI en JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Rutas de la API
app.use('/api/evaluaciones', evaluacionRoutes);

// === MANEJO DE ERRORES ===

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableEndpoints: {
      home: '/',
      docs: '/docs',
      api_spec: '/api-docs.json',
      evaluaciones: '/api/evaluaciones',
      health: '/api/evaluaciones/health'
    }
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// === INICIO DEL SERVIDOR ===
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🎓 API de Evaluación de Catedráticos`);
  console.log('🚀 ========================================');
  console.log(`📍 Servidor ejecutándose en puerto: ${PORT}`);
  console.log(`🌐 URL base: http://localhost:${PORT}`);
  console.log(`📚 Documentación Scalar: http://localhost:${PORT}/docs`);
  console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/evaluaciones/health`);
  console.log(`🗄️  Base de datos: Supabase + Prisma`);
  console.log(`📐 Patrón: MVC (Model-View-Controller)`);
  console.log('🚀 ========================================');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Modo: DESARROLLO');
    console.log('💡 Usa npm run db:studio para abrir Prisma Studio');
  }
  
  console.log('✅ API lista para recibir solicitudes');
  console.log('🚀 ========================================');
});

// Manejo elegante de cierre del servidor
process.on('SIGTERM', () => {
  console.log('👋 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Cerrando servidor...');
  process.exit(0);
});

module.exports = app;