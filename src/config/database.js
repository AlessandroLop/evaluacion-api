// src/config/database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Manejo de desconexión elegante
process.on('beforeExit', async () => {
  console.log('🔌 Desconectando de la base de datos...');
  await prisma.$disconnect();
});

module.exports = prisma;