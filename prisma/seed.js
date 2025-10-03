// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de catedráticos y cursos...');

  // Crear los catedráticos especificados
  console.log('👨‍🏫 Creando catedráticos...');
  const catedraticos = [
    { nombreCompleto: 'MARIO ROBERTO MENDEZ ROMERO' },
    { nombreCompleto: 'OTTO RIGOBERTO ORTIZ PEREZ' },
    { nombreCompleto: 'CARLOS AMILCAR TEZO PALENCIA' },
    { nombreCompleto: 'OSCAR ALEJANDRO PAZ CAMPOS' },
    { nombreCompleto: 'DANY OTONIEL OLIVA BELTETON' }
  ];

  const catedraticosCreados = {};
  
  for (const catedraticoData of catedraticos) {
    try {
      // Verificar si ya existe
      const existente = await prisma.catedratico.findFirst({
        where: { nombreCompleto: catedraticoData.nombreCompleto }
      });

      let catedratico;
      if (existente) {
        catedratico = existente;
        console.log(`⚠️  Catedrático ya existe: ${catedratico.nombreCompleto} (ID: ${catedratico.catedraticoId})`);
      } else {
        catedratico = await prisma.catedratico.create({
          data: catedraticoData
        });
        console.log(`✅ Catedrático creado: ${catedratico.nombreCompleto} (ID: ${catedratico.catedraticoId})`);
      }
      
      catedraticosCreados[catedraticoData.nombreCompleto] = catedratico.catedraticoId;
    } catch (error) {
      console.error(`❌ Error con catedrático ${catedraticoData.nombreCompleto}:`, error.message);
    }
  }

  // Crear los cursos especificados
  console.log('📚 Creando cursos...');
  const cursos = [
    { 
      nombreCurso: 'programacion Basica', 
      catedraticoId: catedraticosCreados['MARIO ROBERTO MENDEZ ROMERO'],
      seminario: 'Seminario de Programación'
    },
    { 
      nombreCurso: 'programacion avanzada', 
      catedraticoId: catedraticosCreados['DANY OTONIEL OLIVA BELTETON'],
      seminario: 'Seminario de Programación'
    },
    { 
      nombreCurso: 'analisis de sistemas', 
      catedraticoId: catedraticosCreados['OTTO RIGOBERTO ORTIZ PEREZ'],
      seminario: 'Seminario de Sistemas'
    },
    { 
      nombreCurso: 'desarrollo web', 
      catedraticoId: catedraticosCreados['CARLOS AMILCAR TEZO PALENCIA'],
      seminario: 'Seminario de Desarrollo'
    },
    { 
      nombreCurso: 'base de datos', 
      catedraticoId: catedraticosCreados['OSCAR ALEJANDRO PAZ CAMPOS'],
      seminario: 'Seminario de Bases de Datos'
    }
  ];

  for (const cursoData of cursos) {
    try {
      // Verificar si el curso ya existe
      const cursoExistente = await prisma.curso.findFirst({
        where: {
          nombreCurso: cursoData.nombreCurso,
          catedraticoId: cursoData.catedraticoId
        }
      });

      if (cursoExistente) {
        console.log(`⚠️  Curso ya existe: ${cursoData.nombreCurso}`);
      } else if (cursoData.catedraticoId) {
        const curso = await prisma.curso.create({
          data: cursoData,
        });
        console.log(`✅ Curso creado: ${curso.nombreCurso} - Catedrático ID: ${curso.catedraticoId}`);
      } else {
        console.log(`❌ No se pudo crear curso ${cursoData.nombreCurso}: Catedrático no encontrado`);
      }
    } catch (error) {
      console.error(`❌ Error con curso ${cursoData.nombreCurso}:`, error.message);
    }
  }

  // Crear las 5 preguntas fijas si no existen
  console.log('📝 Creando preguntas...');
  const preguntas = [
    'Dominio y manejo del tema del curso.',
    'Claridad en la exposición de los conceptos.',
    'Fomento de la participación y resolución de dudas.',
    'Calidad de los materiales y recursos de apoyo.',
    'Puntualidad y cumplimiento del programa del curso.'
  ];

  try {
    const cantidadExistente = await prisma.pregunta.count();
    
    if (cantidadExistente === 0) {
      for (let i = 0; i < preguntas.length; i++) {
        await prisma.pregunta.create({
          data: {
            textoPregunta: preguntas[i]
          }
        });
        console.log(`✅ Pregunta ${i + 1}: ${preguntas[i]}`);
      }
    } else {
      console.log(`⚠️  Ya existen ${cantidadExistente} preguntas en la base de datos`);
    }

    const cantidadFinal = await prisma.pregunta.count();
    console.log(`✅ Total de preguntas en la base de datos: ${cantidadFinal}`);
  } catch (error) {
    console.log(`❌ Error con las preguntas: ${error.message}`);
  }

  console.log('🎉 Seed de catedráticos y cursos completado exitosamente!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });