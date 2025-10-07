// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Importar middlewares y rutas
const errorHandler = require('./middlewares/errorHandler');
const evaluacionRoutes = require('./routes/evaluacionRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// === CONFIGURACIÓN SWAGGER DINÁMICA ===
const swaggerOptions = {
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
        url: process.env.API_BASE_URL || (process.env.NODE_ENV === 'production' 
          ? 'https://evaluacion-3t37ji24x-jimmy-alessandro-lopez-lopezs-projects.vercel.app'
          : `http://localhost:${PORT}`),
        description: process.env.NODE_ENV === 'production' ? 'Servidor de producción' : 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: '📋 Formulario',
        description: 'Endpoints para el formulario de evaluación'
      },
      {
        name: '📊 Estadísticas',
        description: 'Endpoints para estadísticas y reportes'
      },
      {
        name: '🔧 Sistema',
        description: 'Endpoints del sistema'
      }
    ]
  },
  apis: [
    './src/routes/evaluacionRoutes.js',
    './src/routes/*.js'
  ] // Archivos que contienen documentación Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// === CONFIGURACIÓN DE DOMINIOS PERMITIDOS ===
const getAllowedOrigins = () => {
  // Dominios base desde variables de entorno
  const allowedDomains = process.env.ALLOWED_DOMAINS 
    ? process.env.ALLOWED_DOMAINS.split(',').map(domain => domain.trim())
    : [];

  // Configuración por entorno
  if (process.env.NODE_ENV === 'production') {
    return [
      // Dominios de producción
      'https://evaluacion-3t37ji24x-jimmy-alessandro-lopez-lopezs-projects.vercel.app',
      'https://evaluacion-api.vercel.app', // Dominio personalizado si lo tienes
      // Agregar dominios de tus aplicaciones frontend
      'https://tu-frontend-app.vercel.app',
      'https://evaluacion-frontend.com', // Dominio personalizado
      ...allowedDomains // Dominios adicionales desde .env
    ];
  } else {
    return [
      // Desarrollo local - Puertos comunes
      'http://localhost:3000', // React/Next.js dev server
      'http://localhost:3001', // API dev server  
      'http://localhost:4200', // Angular dev server
      'http://localhost:8080', // Vue.js dev server
      'http://127.0.0.1:3000', // Alternativa localhost
      'http://127.0.0.1:3001',
      // Angular con puertos dinámicos (común en Angular 17+)
      'http://localhost:51421', // Puerto específico de tu Angular
      /^http:\/\/localhost:\d+$/, // Cualquier puerto localhost (desarrollo)
      /^http:\/\/127\.0\.0\.1:\d+$/, // Cualquier puerto 127.0.0.1 (desarrollo)
      ...allowedDomains // Dominios adicionales desde .env
    ];
  }
};

// === MIDDLEWARES GLOBALES ===
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permitir requests sin origin (como Postman, aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Para navegadores legacy
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

// Documentación de la API con Swagger UI
const swaggerUiOptions = {
  customSiteTitle: "API de Evaluación de Catedráticos - Documentación",
  swaggerOptions: {
    url: '/api-docs.json'
  }
};

app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

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
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/docs`);
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