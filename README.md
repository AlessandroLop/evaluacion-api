# 🎓 API de Evaluación de Catedráticos

API REST completa para gestionar evaluaciones anónimas de catedráticos universitarios, desarrollada con Node.js, Express, Prisma ORM y Supabase, siguiendo el patrón arquitectónico MVC.

## 📋 Características

- ✅ **Evaluaciones anónimas** de catedráticos
- ✅ **5 preguntas fijas** con puntuación 1-5
- ✅ **Comentarios obligatorios** con validación
- ✅ **Estadísticas completas** por catedrático y seminario
- ✅ **Documentación interactiva** con Scalar
- ✅ **Validaciones robustas** en todos los endpoints
- ✅ **Manejo de errores** centralizado
- ✅ **Base de datos** en Supabase con Prisma ORM
- ✅ **Arquitectura MVC** bien estructurada

## 🚀 Tecnologías

- **Backend**: Node.js + Express.js
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Documentación**: Scalar + OpenAPI 3.0
- **Validación**: Middlewares personalizados
- **Logging**: Morgan
- **CORS**: Configurado para desarrollo y producción

## 📁 Estructura del Proyecto

```
evaluacion-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Prisma
│   │   └── swagger.js           # Configuración de OpenAPI
│   ├── controllers/
│   │   └── evaluacionController.js  # Lógica de negocio
│   ├── middlewares/
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── validation.js        # Validaciones
│   ├── models/
│   │   └── evaluacionModel.js   # Acceso a datos
│   ├── routes/
│   │   └── evaluacionRoutes.js  # Definición de rutas
│   └── app.js                   # Aplicación principal
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.js                 # Datos iniciales
├── test-requests.http          # Ejemplos de solicitudes
├── package.json
├── .env                        # Variables de entorno
└── README.md
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

El archivo `.env` ya está configurado con tu base de datos Supabase:

```env
DATABASE_URL="postgresql://postgres.cgpddxjqmybjtgqzfgmz:Umg1234$$$@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.cgpddxjqmybjtgqzfgmz:Umg1234$$$@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
PORT=3001
NODE_ENV=development
```

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

### 📊 **Información General**
- `GET /` - Página principal de la API
- `GET /docs` - Documentación interactiva con Scalar
- `GET /api-docs.json` - Especificación OpenAPI
- `GET /api/evaluaciones/health` - Estado de la API

### 📝 **Formulario de Evaluación**
- `GET /api/evaluaciones/catedraticos` - Lista de catedráticos
- `GET /api/evaluaciones/catedraticos/{id}/cursos` - Cursos por catedrático
- `GET /api/evaluaciones/preguntas` - Preguntas del formulario
- `POST /api/evaluaciones` - Registrar nueva evaluación

### 📈 **Estadísticas**
- `GET /api/evaluaciones/estadisticas` - Estadísticas completas
- `GET /api/evaluaciones/estadisticas/seminarios` - Estadísticas por seminario

## 📝 Ejemplo de Uso

### Registrar una evaluación:

```bash
POST /api/evaluaciones
Content-Type: application/json

{
  "cursoId": 1,
  "comentarios": "Excelente profesor, muy claro en sus explicaciones y siempre dispuesto a resolver dudas.",
  "respuestas": [5, 4, 5, 4, 5]
}
```

### Respuesta exitosa:

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

## ✅ Validaciones Implementadas

### **Evaluaciones**
- ✅ `cursoId`: Obligatorio y debe existir en la base de datos
- ✅ `comentarios`: Obligatorio, mínimo 10 caracteres
- ✅ `respuestas`: Array de exactamente 5 números entre 1-5

### **Parámetros**
- ✅ Validación de IDs numéricos en rutas
- ✅ Verificación de existencia de recursos

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

La API incluye documentación completa e interactiva con **Scalar**:

🌐 **http://localhost:3001/docs**

Características de la documentación:
- ✅ Interfaz moderna y responsiva
- ✅ Pruebas interactivas de endpoints
- ✅ Ejemplos de solicitudes y respuestas
- ✅ Esquemas detallados de datos
- ✅ Códigos de error documentados

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

---

🎓 **API de Evaluación de Catedráticos** - Desarrollada con ❤️ usando Node.js, Express, Prisma y Supabase