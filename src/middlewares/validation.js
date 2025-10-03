// src/middlewares/validation.js

/**
 * Validador para el registro de evaluaciones
 */
const validateEvaluacion = (req, res, next) => {
  const { cursoId, comentarios, respuestas } = req.body;

  // Validar que cursoId esté presente
  if (!cursoId) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'El ID del curso es obligatorio'
    });
  }

  // Validar que cursoId sea un número
  if (isNaN(parseInt(cursoId))) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'El ID del curso debe ser un número válido'
    });
  }

  // Validar comentarios
  if (!comentarios || typeof comentarios !== 'string' || comentarios.trim() === '') {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'El campo de comentarios es obligatorio y no puede estar vacío'
    });
  }

  // Validar longitud de comentarios
  if (comentarios.trim().length < 10) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Los comentarios deben tener al menos 10 caracteres'
    });
  }

  // Validar respuestas
  if (!respuestas || !Array.isArray(respuestas)) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Las respuestas deben ser un array'
    });
  }

  // Validar que sean exactamente 5 respuestas
  if (respuestas.length !== 5) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Se requieren exactamente 5 respuestas'
    });
  }

  // Validar cada respuesta
  for (let i = 0; i < respuestas.length; i++) {
    const puntuacion = parseInt(respuestas[i]);
    
    if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({
        error: 'Error de validación',
        message: `La respuesta ${i + 1} debe ser un número entre 1 y 5`
      });
    }
  }

  // Si todas las validaciones pasan, continuar
  next();
};

/**
 * Validador para parámetros de ID
 */
const validateId = (req, res, next) => {
  const { id, catedraticoId } = req.params;
  const idToValidate = id || catedraticoId;

  if (!idToValidate || isNaN(parseInt(idToValidate))) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'El ID debe ser un número válido'
    });
  }

  next();
};

module.exports = {
  validateEvaluacion,
  validateId
};