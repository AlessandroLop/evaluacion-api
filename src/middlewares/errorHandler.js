// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Violación de restricción única',
      message: 'Ya existe un registro con estos datos'
    });
  }

  // Error de registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro no encontrado',
      message: 'El recurso solicitado no existe'
    });
  }

  // Error de validación personalizada
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message
    });
  }

  // Error interno del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo salió mal' 
      : err.message
  });
};

module.exports = errorHandler;