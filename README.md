# 🎓 API de Evaluación de Catedráticos

API REST completa para gestionar evaluaciones anónimas de catedráticos universitarios con **análisis de sentimientos integrado**, desarrollada con Node.js, Express, Prisma ORM, Supabase y Azure Cognitive Services.

## 🌐 **API EN PRODUCCIÓN**

**🔗 URL Base:** 'localhost'

**📚 Documentación Interactiva:** [sin documentación operativa](solo local)

**🏥 Health Check:** [healt local](healt local)

## 📋 Características

- ✅ **Evaluaciones anónimas** de catedráticos
- ✅ **5 preguntas fijas** con puntuación 1-5
- ✅ **Comentarios obligatorios** con validación
- ✅ **Análisis de sentimientos** con Azure Cognitive Services
- ✅ **Comentarios por curso** para análisis específico
- ✅ **Estadísticas completas** por catedrático y seminario
- ✅ **Documentación interactiva** con Swagger UI
- ✅ **CORS completamente abierto** para acceso público
- ✅ **Validaciones robustas** en todos los endpoints
- ✅ **Manejo de errores** centralizado
- ✅ **Base de datos** en Supabase con Prisma ORM
- ✅ **Arquitectura MVC** bien estructurada
- ✅ **Deployment automático** en Vercel

## 🚀 Tecnologías

- **Backend**: Node.js + Express.js 5.1.0
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.15.0
- **IA**: Azure Cognitive Services (Text Analytics)
- **Documentación**: Swagger UI + swagger-jsdoc 6.2.8
- **Deployment**: Vercel (Serverless Functions)
- **Validación**: Middlewares personalizados
- **Logging**: Morgan
- **CORS**: Abierto para acceso público

## 📁 Estructura del Proyecto

```
evaluacion-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Prisma
│   │   └── swagger.js           # Configuración de OpenAPI
│   ├── controllers/
│   │   └── evaluacionController.js  # Lógica de negocio + IA
│   ├── middlewares/
│   │   ├── errorHandler.js      # Manejo de errores centralizado
│   │   ├── rateLimiter.js       # Rate limiting para IA
│   │   └── validation.js        # Validaciones de entrada
│   ├── models/
│   │   └── evaluacionModel.js   # Acceso a datos + Azure IA
│   ├── routes/
│   │   └── evaluacionRoutes.js  # Definición de rutas + docs
│   └── app.js                   # Aplicación principal + CORS
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.js                 # Datos iniciales
├── test-requests.http          # Ejemplos de solicitudes
├── .env.example                # Template de variables
├── package.json                # Dependencias + scripts
├── .env                        # Variables de entorno
└── README.md                   # Documentación completa
```

## ⚙️ Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run db:generate
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

#### 🔧 **Configuración básica (.env):**

```env
# Configuración del servidor
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# Base de datos Supabase
DATABASE_URL="TU_URL_DATABASE"
DIRECT_URL="TU_URL_DATABASE"
```

#### 🌍 **Configuración de dominios permitidos (CORS):**

Para mayor seguridad, puedes especificar exactamente qué dominios pueden hacer peticiones al API:

```env
# Dominios permitidos (separados por comas)
ALLOWED_DOMAINS=https://mi-frontend.vercel.app,https://evaluacion-dashboard.com,https://admin.midominio.com
```

#### 🚀 **Configuración para producción:**

```env
NODE_ENV=production
API_BASE_URL=https://tu-api.vercel.app
ALLOWED_DOMAINS=https://tu-frontend.vercel.app,https://tu-dashboard.com,https://www.tudominio.com
```

#### 📋 **Ejemplos de dominios comunes:**

- **Frontend React/Next.js**: `https://tu-app.vercel.app`
- **Dashboard Admin**: `https://admin.tudominio.com`
- **Aplicación móvil web**: `https://mobile.tudominio.com`
- **Landing page**: `https://www.tudominio.com`

### 3. Sincronizar base de datos y ejecutar seed

```bash
# Sincronizar esquema con la base de datos
npx prisma db push

# Ejecutar seed para datos iniciales
npm run db:seed
```

### 4. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## 🌐 Endpoints Disponibles

**Base URL:** `https://evaluacion-api.vercel.app`

### 📊 **Información General**
- `GET /` - Página principal de la API
- `GET /docs` - Documentación interactiva con Swagger UI
- `GET /api-docs.json` - Especificación OpenAPI
- `GET /api/evaluaciones/health` - Estado de la API y base de datos

### 📝 **Formulario de Evaluación**
- `GET /api/evaluaciones/catedraticos` - Lista completa de catedráticos con sus cursos
- `GET /api/evaluaciones/preguntas` - 5 preguntas fijas del formulario
- `POST /api/evaluaciones` - Registrar nueva evaluación

### 📊 **Comentarios y Análisis**
- `GET /api/evaluaciones/cursos/{cursoId}/comentarios` - Comentarios de evaluaciones por curso
- `POST /api/evaluaciones/sentimientos` - Análisis de sentimientos con Azure AI

### 📈 **Estadísticas y Reportes**
- `GET /api/evaluaciones/estadisticas` - Estadísticas completas del sistema
- `GET /api/evaluaciones/estadisticas/seminarios` - Estadísticas agrupadas por seminario

## 📝 Ejemplos de Uso Detallados

### 🎯 **1. Obtener Catedráticos con Cursos**

```bash
GET https://evaluacion-api.vercel.app/api/evaluaciones/catedraticos
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "catedraticoId": 1,
      "nombreCompleto": "DANY OTONIEL OLIVA BELTETON",
      "cursos": [
        {
          "cursoId": 1,
          "nombreCurso": "Programación Básica",
          "seminario": "Seminario de Programación"
        }
      ]
    }
  ],
  "message": "Catedráticos con cursos obtenidos exitosamente"
}
```

### 🎯 **2. Registrar Nueva Evaluación**

```bash
POST https://evaluacion-api.vercel.app/api/evaluaciones
Content-Type: application/json

{
  "cursoId": 1,
  "comentarios": "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a resolver dudas.",
  "respuestas": [5, 4, 5, 4, 5]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "evaluacionId": 123,
    "mensaje": "Evaluación registrada exitosamente"
  },
  "message": "Evaluación creada exitosamente"
}
```

### 🎯 **3. Obtener Comentarios por Curso**

```bash
GET https://evaluacion-api.vercel.app/api/evaluaciones/cursos/1/comentarios
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "evaluacionId": 15,
      "comentarios": "Excelente profesor, muy claro en sus explicaciones.",
      "fechaEvaluacion": "2024-12-10T14:30:00.000Z",
      "curso": {
        "cursoId": 1,
        "nombreCurso": "Desarrollo Web Frontend",
        "codigoCurso": "WEB101"
      },
      "catedratico": {
        "catedraticoId": 3,
        "nombreCompleto": "Dr. Carlos Mendoza"
      }
    }
  ],
  "metadata": {
    "totalComentarios": 1,
    "cursoInfo": {
      "cursoId": 1,
      "nombreCurso": "Desarrollo Web Frontend"
    }
  },
  "message": "Comentarios obtenidos exitosamente para el curso: Desarrollo Web Frontend"
}
```

### 🎯 **4. Análisis de Sentimientos con IA**

```bash
POST https://evaluacion-api.vercel.app/api/evaluaciones/sentimientos
Content-Type: application/json

{
  "textos": [
    "El profesor explica muy bien las clases",
    "No me gustó la metodología utilizada",
    "Excelente dominio del tema y muy puntual"
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalTextos": 3,
    "resultados": [
      {
        "id": "1",
        "texto": "El profesor explica muy bien las clases",
        "sentimiento": "positive",
        "confianza": {
          "positivo": "89.45%",
          "neutral": "8.32%",
          "negativo": "2.23%"
        }
      },
      {
        "id": "2",
        "texto": "No me gustó la metodología utilizada",
        "sentimiento": "negative",
        "confianza": {
          "positivo": "5.12%",
          "neutral": "15.67%",
          "negativo": "79.21%"
        }
      }
    ]
  },
  "message": "Análisis de sentimientos completado para 3 texto(s)"
}
```

### 🎯 **5. Obtener Estadísticas Completas**

```bash
GET https://evaluacion-api.vercel.app/api/evaluaciones/estadisticas
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "catedraticos": [
      {
        "nombre_catedratico": "DANY OTONIEL OLIVA BELTETON",
        "seminario": "Seminario de Programación",
        "cantidad_respuestas": 25,
        "calificacion_promedio_catedratico": 4.52
      }
    ],
    "calificacion_general_seminario": 4.35,
    "promedios_por_seminario": [
      {
        "seminario": "Seminario de Programación",
        "promedio_general": 4.42
      }
    ]
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

## ✅ Validaciones Implementadas

### **Evaluaciones**
- ✅ `cursoId`: Obligatorio y debe existir en la base de datos
- ✅ `comentarios`: Obligatorio, mínimo 10 caracteres
- ✅ `respuestas`: Array de exactamente 5 números entre 1-5

### **Análisis de Sentimientos**
- ✅ `textos`: Array obligatorio de strings válidos
- ✅ Máximo 10 textos por solicitud
- ✅ Cada texto debe tener al menos 1 carácter
- ✅ Validación de formato y estructura

### **Parámetros de Ruta**
- ✅ Validación de IDs numéricos en rutas
- ✅ Verificación de existencia de recursos (cursos, catedráticos)
- ✅ Manejo de parámetros inválidos

## 📊 Base de Datos

### **Tablas principales**
- `Catedraticos` - Información de profesores
- `Cursos` - Cursos impartidos
- `Preguntas` - 5 preguntas fijas del formulario
- `Evaluaciones` - Evaluaciones registradas
- `Respuestas` - Respuestas a cada pregunta

### **Datos actuales**
- **4 catedráticos** configurados
- **5 cursos** distribuidos entre los catedráticos
- **5 preguntas fijas** del formulario

## 🎨 Documentación Interactiva

La API incluye documentación completa e interactiva con **Swagger UI**:

🌐 **Producción:** [https://evaluacion-api.vercel.app/docs](https://evaluacion-api.vercel.app/docs)  
🏠 **Local:** `http://localhost:3001/docs`

Características de la documentación:
- ✅ Interfaz moderna con Swagger UI
- ✅ Pruebas interactivas de todos los endpoints
- ✅ Ejemplos detallados de solicitudes y respuestas
- ✅ Esquemas completos de datos
- ✅ Códigos de error documentados
- ✅ Categorización por funcionalidad (📋 Formulario, 📊 Comentarios, 🧠 IA, etc.)

## 🧠 Integración con Azure Cognitive Services

### **Análisis de Sentimientos Optimizado**
- **Servicio:** Azure Text Analytics v3.1
- **Idioma:** Español (configurado por defecto)
- **⚡ Optimizaciones implementadas:**
  - ✅ **Cache inteligente** - Resultados almacenados por 15 minutos
  - ✅ **Timeout personalizado** - 15 segundos máximo por request
  - ✅ **Rate limiting** - Máximo 5 requests por minuto por IP
  - ✅ **Manejo de errores robusto** - Códigos específicos por tipo de error
  - ✅ **Logging detallado** - Tiempos de respuesta y estados de cache

### **Capacidades del Servicio**
- ✅ Detección de sentimiento (positivo, neutral, negativo)
- ✅ Niveles de confianza por cada sentimiento
- ✅ Procesamiento en lote (hasta 10 textos)
- ✅ Manejo seguro de credenciales en backend
- ✅ Prevención de requests duplicadas con cache
- ✅ Recuperación automática de errores temporales

### **Configuración Requerida**
```env
# Azure Cognitive Services - Text Analytics
AZURE_TEXT_ANALYTICS_ENDPOINT=https://tu-servicio.cognitiveservices.azure.com/
AZURE_TEXT_ANALYTICS_KEY=tu_clave_de_azure
```

### **Rate Limiting y Performance**
| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| **Requests por IP** | 5/minuto | Límite por dirección IP |
| **Timeout** | 15 segundos | Tiempo máximo por request |
| **Cache** | 15 minutos | Duración del cache de resultados |
| **Textos por request** | 10 máximo | Límite de Azure API |

### **Códigos de Error Específicos**
| Código | Error | Solución |
|--------|-------|----------|
| **408** | Request Timeout | Reducir cantidad de textos |
| **429** | Rate Limit | Esperar antes de nueva request |
| **502** | Azure Connection Error | Verificar conectividad |
| **503** | Azure Service Unavailable | Reintentar en unos minutos |

### **Casos de Uso**
- 📊 Análisis automático de comentarios de evaluaciones
- 📈 Monitoreo de satisfacción estudiantil en tiempo real
- 🎯 Identificación de áreas de mejora docente
- 📋 Reportes de sentimientos por curso/seminario
- 🔄 Análisis masivo con cache optimizado
- ⚡ Respuestas rápidas para interfaces interactivas

## ⚡ Optimizaciones de Performance

### **🚀 Mejoras Implementadas**

#### **1. Sistema de Cache Inteligente**
```javascript
// Primera solicitud: llama a Azure (más lenta)
POST /api/evaluaciones/sentimientos
Response Time: ~2-3 segundos

// Segunda solicitud idéntica: desde cache (ultra rápida)  
POST /api/evaluaciones/sentimientos
Response Time: ~50-100ms ⚡
```

#### **2. Rate Limiting Preventivo**
- **Propósito:** Evitar saturar Azure Cognitive Services
- **Límite:** 5 requests por minuto por IP
- **Beneficio:** Previene errores 429 y costos excesivos
- **Headers:** Información de límites en cada response

#### **3. Timeout Inteligente**
- **Problema resuelto:** "Se queda pensando" indefinidamente
- **Solución:** 15 segundos máximo por request
- **Beneficio:** Respuesta garantizada, error claro si falla

#### **4. Manejo de Errores Específicos**
```json
// Error 408 - Timeout
{
  "error": "RequestTimeout",
  "message": "El servicio tardó demasiado. Reduce la cantidad de textos.",
  "suggestion": "Intenta con menos textos o espera unos segundos"
}

// Error 429 - Rate Limit
{
  "error": "RateLimitExceeded", 
  "message": "Límite de Azure alcanzado. Espera unos segundos.",
  "retryAfter": 5
}
```

### **📊 Métricas de Performance**

| Escenario | Tiempo de Respuesta | Cache | Estado |
|-----------|-------------------|-------|--------|
| **Primera solicitud** | 2-3 segundos | ❌ Miss | Llamada a Azure |
| **Solicitud repetida** | 50-100ms | ✅ Hit | Desde memoria |
| **Timeout detectado** | 15 segundos max | ❌ N/A | Error controlado |
| **Rate limit activado** | Inmediato | ❌ N/A | Protección Azure |

### **🔧 Configuración Avanzada**

```env
# Configuración del cache (opcional - valores por defecto)
SENTIMENT_CACHE_TTL=900000        # 15 minutos
SENTIMENT_CACHE_MAX_SIZE=100      # 100 entradas

# Configuración de timeouts (opcional)
AZURE_REQUEST_TIMEOUT=15000       # 15 segundos

# Rate limiting (opcional)
SENTIMENT_RATE_LIMIT=5            # 5 requests por minuto
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Iniciar en modo desarrollo
npm start            # Iniciar en modo producción
npm run db:generate  # Generar cliente de Prisma
npm run db:seed      # Ejecutar seed de datos
npm run db:studio    # Abrir Prisma Studio
npm run db:migrate   # Ejecutar migraciones
npm run db:reset     # Resetear base de datos
```

## 🔧 Desarrollo

### Agregar nuevos endpoints:
1. Definir la función en `evaluacionController.js`
2. Agregar la ruta en `evaluacionRoutes.js`
3. Incluir documentación OpenAPI
4. Agregar validaciones si es necesario

### Modificar base de datos:
1. Actualizar `prisma/schema.prisma`
2. Ejecutar `npx prisma db push`
3. Actualizar modelos y controladores

## 📋 Arquitectura MVC

### **Model** (`src/models/`)
- Acceso a datos con Prisma ORM
- Lógica de consultas complejas
- Transacciones de base de datos

### **View** (Documentación API)
- Documentación interactiva con Scalar
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados

### **Controller** (`src/controllers/`)
- Lógica de negocio
- Orquestación de servicios
- Manejo de respuestas

## 🚨 Manejo de Errores

La API incluye manejo centralizado de errores:
- ✅ Errores de validación (400)
- ✅ Recursos no encontrados (404)
- ✅ Errores de base de datos (500)
- ✅ Mensajes descriptivos
- ✅ Logging para debugging

## 📞 Soporte

Para dudas o problemas:
1. Revisar la documentación en `/docs`
2. Verificar ejemplos en `test-requests.http`
3. Comprobar logs del servidor
4. Usar `npm run db:studio` para inspeccionar datos

## 🔧 Troubleshooting - Análisis de Sentimientos

### **🚨 Problemas Comunes y Soluciones**

#### **1. "Se queda pensando" / No responde**
```bash
# ❌ Problema: Request sin respuesta
# ✅ Solución: Timeout implementado (15s máximo)
# 📋 Acción: Si persiste, verificar conectividad Azure
```

#### **2. Error 429 - Too Many Requests**
```json
{
  "error": "TooManyRequests",
  "message": "Demasiadas solicitudes. Máximo 5 por minuto",
  "retryAfter": 60
}
```
**Solución:** Esperar 1 minuto o implementar delay en frontend.

#### **3. Error 408 - Request Timeout**
```json
{
  "error": "RequestTimeout", 
  "message": "El servicio tardó demasiado en responder",
  "suggestion": "Reduce la cantidad de textos"
}
```
**Solución:** Enviar menos textos por request (máx. 5-7 textos).

#### **4. Error 502 - Bad Gateway**
```json
{
  "error": "ConnectionError",
  "message": "No se pudo conectar con el servicio de IA"
}
```
**Solución:** Verificar configuración Azure o reintentar en unos minutos.

### **⚡ Optimización para Desarrolladores**

#### **Cache Inteligente**
```javascript
// ✅ Aprovechar cache: mismos textos = respuesta instantánea
const textos = ["Excelente profesor", "Muy buena clase"];

// Primera llamada: ~2-3 segundos
await fetch('/api/evaluaciones/sentimientos', {
  method: 'POST',
  body: JSON.stringify({ textos })
});

// Segunda llamada idéntica: ~50ms ⚡
await fetch('/api/evaluaciones/sentimientos', {
  method: 'POST', 
  body: JSON.stringify({ textos }) // Mismos textos = cache hit
});
```

#### **Rate Limiting Inteligente**
```javascript
// ✅ Implementar delay en frontend para evitar 429
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

for (const batch of textBatches) {
  await analyzeTextsBatch(batch);
  await delay(12000); // 12 segundos entre batches
}
```

#### **Manejo de Errores Robusto**
```javascript
async function analyzeWithRetry(textos, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/evaluaciones/sentimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textos })
      });
      
      if (response.status === 429) {
        const data = await response.json();
        await delay(data.retryAfter * 1000);
        continue;
      }
      
      if (response.status === 408) {
        // Reducir cantidad de textos
        textos = textos.slice(0, Math.ceil(textos.length / 2));
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(2000 * (i + 1)); // Backoff exponencial
    }
  }
}
```

## 🎯 Cumplimiento de Requisitos

### ✅ **Formulario de Respuesta (Pantalla 1)**
- ✅ 5 preguntas fijas con puntuación 1-5
- ✅ Campo de comentarios obligatorio
- ✅ Validación completa de datos
- ✅ Registro exitoso de evaluaciones

### ✅ **Pantalla de Resultados (Pantalla 2)**
- ✅ Nombre del catedrático
- ✅ Cantidad de respuestas recibidas
- ✅ Calificación promedio del catedrático
- ✅ Calificación general promedio del seminario

### ✅ **Arquitectura y Tecnología**
- ✅ API REST con Express.js
- ✅ Base de datos PostgreSQL (Supabase)
- ✅ Patrón MVC implementado
- ✅ Documentación con Scalar
- ✅ Validaciones robustas
- ✅ Prisma ORM

## 🚀 Deployment y Acceso

### **🌐 Producción (Vercel)**
- **URL:** https://evaluacion-api.vercel.app
- **Status:** ✅ Activo y funcionando
- **Deployment:** Automático desde GitHub (branch main)
- **CORS:** Completamente abierto para acceso público

### **🔗 URLs Principales**
| Recurso | URL |
|---------|-----|
| **API Base** | `https://evaluacion-api.vercel.app` |
| **Documentación** | `https://evaluacion-api.vercel.app/docs` |
| **Health Check** | `https://evaluacion-api.vercel.app/api/evaluaciones/health` |
| **OpenAPI Spec** | `https://evaluacion-api.vercel.app/api-docs.json` |

### **📱 Consumo desde Frontend**
```javascript
// Ejemplo para Angular/React/Vue
const API_BASE_URL = 'https://evaluacion-api.vercel.app';

// Obtener catedráticos
fetch(`${API_BASE_URL}/api/evaluaciones/catedraticos`)
  .then(response => response.json())
  .then(data => console.log(data));

// Registrar evaluación
fetch(`${API_BASE_URL}/api/evaluaciones`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cursoId: 1,
    comentarios: "Excelente profesor",
    respuestas: [5, 4, 5, 4, 5]
  })
});

// Análisis de sentimientos
fetch(`${API_BASE_URL}/api/evaluaciones/sentimientos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    textos: ["El profesor explica muy bien"]
  })
});
```

## 📊 Códigos de Respuesta HTTP

### **Códigos de Éxito**
| Código | Significado | Descripción |
|--------|------------|-------------|
| **200** | ✅ OK | Solicitud exitosa |
| **201** | ✅ Created | Recurso creado exitosamente |

### **Códigos de Error del Cliente**
| Código | Significado | Descripción | Contexto |
|--------|------------|-------------|----------|
| **400** | ❌ Bad Request | Datos inválidos o faltantes | Validación de entrada |
| **404** | ❌ Not Found | Recurso no encontrado | Curso/Catedrático inexistente |
| **408** | ⏱️ Request Timeout | Solicitud tardó demasiado | Azure IA > 15 segundos |
| **429** | 🚦 Too Many Requests | Demasiadas solicitudes | Rate limit excedido |

### **Códigos de Error del Servidor**
| Código | Significado | Descripción | Contexto |
|--------|------------|-------------|----------|
| **500** | ❌ Internal Server Error | Error interno del servidor | Error de aplicación |
| **502** | 🔗 Bad Gateway | Error de comunicación externa | Azure API no disponible |
| **503** | 🚫 Service Unavailable | Servicio temporalmente no disponible | Azure en mantenimiento |

### **Headers Informativos**
Todos los endpoints de análisis de sentimientos incluyen headers útiles:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2024-01-01T12:00:00.000Z
```

---

🎓 **API de Evaluación de Catedráticos**  
Desarrollada con ❤️ usando Node.js, Express, Prisma, Supabase y Azure Cognitive Services

**🔗 Repositorio:** [GitHub - evaluacion-api](https://github.com/AlessandroLop/evaluacion-api)  
**🌐 API en Vivo:** [https://evaluacion-api.vercel.app](https://evaluacion-api.vercel.app)  
**📚 Documentación:** [https://evaluacion-api.vercel.app/docs](https://evaluacion-api.vercel.app/docs)
