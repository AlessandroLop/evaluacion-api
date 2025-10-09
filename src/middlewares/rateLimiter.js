// src/middlewares/rateLimiter.js
// Rate limiter específico para análisis de sentimientos

/**
 * Rate limiter simple en memoria para análisis de sentimientos
 * En producción, se recomienda usar Redis o una solución más robusta
 */
class SentimentRateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanup();
  }

  /**
   * Configuración del rate limiter
   */
  config = {
    windowMs: 60000, // 1 minuto
    maxRequests: 5,  // Máximo 5 requests por minuto por IP
    message: 'Demasiadas solicitudes de análisis de sentimientos. Intenta de nuevo en un minuto.'
  };

  /**
   * Obtener clave única para el cliente
   */
  getClientKey(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           'unknown';
  }

  /**
   * Middleware de rate limiting
   */
  middleware() {
    return (req, res, next) => {
      const clientKey = this.getClientKey(req);
      const now = Date.now();
      
      // Obtener requests del cliente
      let clientRequests = this.requests.get(clientKey) || [];
      
      // Filtrar requests dentro de la ventana de tiempo
      clientRequests = clientRequests.filter(timestamp => 
        now - timestamp < this.config.windowMs
      );
      
      // Verificar límite
      if (clientRequests.length >= this.config.maxRequests) {
        const retryAfter = Math.ceil(this.config.windowMs / 1000);
        
        return res.status(429).json({
          success: false,
          error: 'TooManyRequests',
          message: this.config.message,
          retryAfter: retryAfter,
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs,
          remaining: 0
        });
      }
      
      // Agregar request actual
      clientRequests.push(now);
      this.requests.set(clientKey, clientRequests);
      
      // Agregar headers informativos
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - clientRequests.length),
        'X-RateLimit-Reset': new Date(now + this.config.windowMs).toISOString()
      });
      
      next();
    };
  }

  /**
   * Limpiar requests antiguos cada 5 minutos
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [clientKey, requests] of this.requests.entries()) {
        const validRequests = requests.filter(timestamp => 
          now - timestamp < this.config.windowMs
        );
        
        if (validRequests.length === 0) {
          this.requests.delete(clientKey);
        } else {
          this.requests.set(clientKey, validRequests);
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Obtener estadísticas del rate limiter
   */
  getStats() {
    return {
      totalClients: this.requests.size,
      config: this.config,
      uptime: process.uptime()
    };
  }
}

// Crear instancia singleton
const sentimentRateLimiter = new SentimentRateLimiter();

module.exports = sentimentRateLimiter;