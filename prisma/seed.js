const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


// Reinicia la secuencia asociada a table.column a 1 (nextval devolverá 1)
async function restartSequenceToOne(table, column) {
  const sql = `SELECT setval(pg_get_serial_sequence('${table}','${column}'), 1, false);`;
  await prisma.$executeRawUnsafe(sql);
}

async function setSequenceToMax(table, column) {
  // Ajusta la secuencia al MAX(id) actual (is_called = true para que nextval devuelva max+1)
  const sql = `
    SELECT setval(
      pg_get_serial_sequence('${table}','${column}'),
      COALESCE((SELECT MAX("${column}") FROM "${table}"), 0),
      true
    );
  `;
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  console.log('🌱 Iniciando seed: limpieza e inserción de catedráticos, cursos y preguntas...');

  // 0) Reiniciar secuencias a 1 para permitir que los primeros IDs generados sean 1,2,...
  // Ajusta los nombres de columna si tu esquema usa otros nombres.
  try {
    await restartSequenceToOne('catedratico', 'catedraticoId');
    await restartSequenceToOne('curso', 'cursoId');
    await restartSequenceToOne('pregunta', 'preguntaId');
    await restartSequenceToOne('evaluacion', 'evaluacionId');
    await restartSequenceToOne('respuesta', 'respuestaId');
    console.log('🔁 Secuencias reiniciadas a 1 (si existen).');
  } catch (err) {
    console.warn('⚠️ No se pudieron reiniciar secuencias automáticamente. Revisa nombres de tablas/columnas. Error:', err.message);
  }

  // 1) Borrar en orden (hijos antes que padres)
  console.log('🧹 Borrando datos existentes...');
  await prisma.respuesta.deleteMany().catch(() => {});
  await prisma.evaluacion.deleteMany().catch(() => {});
  await prisma.curso.deleteMany().catch(() => {});
  await prisma.pregunta.deleteMany().catch(() => {});
  await prisma.catedratico.deleteMany().catch(() => {});
  console.log('✅ Datos existentes borrados.');

  // 2) Lista de catedráticos (según tu lista) - corregido el nombre de Oscar
  const catedraticosList = [
    'Byron Réne Prado Juí',
    'Flavio Arturo Juárez Aristondo',
    'Edwin Estuado Cordova Milian',
    'Fredy Ademar Ordoñez Alonzo',
    'Evelyn Raquel Cabrera Sánchez',
    'Richard David Ortíz Sasvín',
    'Oscar Alejandro Paz Campos', // CORRECCIÓN
    'Mario Roberto Méndez Romero',
    'Carlos Amilcar Tezó Palencia',
    'Dany Otoniel Oliva Beltetón',
    'Otto Rigoberto Ortíz Pérez',
    'Allan Alberto Morataya Gómez',
    'Oscar Antonio Valiente Arreaga',
    'Mario Alfredo Cerna Yanes'
  ];

  console.log('👨‍🏫 Creando catedráticos...');
  const createdMap = {};
  for (const nombre of catedraticosList) {
    try {
      const c = await prisma.catedratico.create({
        data: { nombreCompleto: nombre }
      });
      createdMap[nombre] = c.catedraticoId;
      console.log(`  ✅ ${nombre} (ID: ${c.catedraticoId})`);
    } catch (err) {
      console.error(`  ❌ Error creando ${nombre}:`, err.message);
    }
  }

  // 3) Cursos (con seminario) - tener en cuenta catedráticos que dictan varios cursos
  const cursos = [
    // Seminario - Ciencias de la Ingeniería
    { nombreCurso: 'Calculo', seminario: 'Ciencias de la Ingeniería', catedratico: 'Byron Réne Prado Juí' },
    { nombreCurso: 'Precalculo', seminario: 'Ciencias de la Ingeniería', catedratico: 'Byron Réne Prado Juí' },
    { nombreCurso: 'Metodología de la Investigación', seminario: 'Ciencias de la Ingeniería', catedratico: 'Flavio Arturo Juárez Aristondo' },
    { nombreCurso: 'Estadistica', seminario: 'Ciencias de la Ingeniería', catedratico: 'Edwin Estuado Cordova Milian' },
    { nombreCurso: 'Fisica', seminario: 'Ciencias de la Ingeniería', catedratico: 'Fredy Ademar Ordoñez Alonzo' },
    { nombreCurso: 'Electronica', seminario: 'Ciencias de la Ingeniería', catedratico: 'Evelyn Raquel Cabrera Sánchez' },

    // Seminario - Análisis Diseño y Desarrollo
    { nombreCurso: 'Ingenieria de Software', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Richard David Ortíz Sasvín' },
    { nombreCurso: 'Bases de Datos', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Oscar Alejandro Paz Campos' },
    { nombreCurso: 'Programación básica', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Mario Roberto Méndez Romero' },
    { nombreCurso: 'Desarrollo Web', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Carlos Amilcar Tezó Palencia' },
    { nombreCurso: 'Programación Avanzada', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Dany Otoniel Oliva Beltetón' },
    { nombreCurso: 'Analisis de Sistemas', seminario: 'Análisis Diseño y Desarrollo', catedratico: 'Otto Rigoberto Ortíz Pérez' },

    // Seminario - Administración de Sistemas
    { nombreCurso: 'Arquitectura de Computadoras', seminario: 'Administración de Sistemas', catedratico: 'Otto Rigoberto Ortíz Pérez' },
    { nombreCurso: 'Comunicaciones', seminario: 'Administración de Sistemas', catedratico: 'Allan Alberto Morataya Gómez' },
    { nombreCurso: 'Redes', seminario: 'Administración de Sistemas', catedratico: 'Oscar Antonio Valiente Arreaga' },
    { nombreCurso: 'Sistemas Operativos', seminario: 'Administración de Sistemas', catedratico: 'Richard David Ortíz Sasvín' },
    { nombreCurso: 'Seguridad de Sistemas', seminario: 'Administración de Sistemas', catedratico: 'Mario Alfredo Cerna Yanes' }
  ];

  console.log('📚 Creando cursos...');
  for (const c of cursos) {
    const catedId = createdMap[c.catedratico];
    if (!catedId) {
      console.warn(`  ⚠️  Catedrático no encontrado para curso "${c.nombreCurso}" (${c.catedratico}). Omitido.`);
      continue;
    }
    try {
      const curso = await prisma.curso.create({
        data: {
          nombreCurso: c.nombreCurso,
          seminario: c.seminario,
          catedraticoId: catedId
        }
      });
      console.log(`  ✅ ${curso.nombreCurso} (ID: ${curso.cursoId || curso.id || 'n/a'}) - Catedrático ID: ${curso.catedraticoId}`);
    } catch (err) {
      console.error(`  ❌ Error creando curso ${c.nombreCurso}:`, err.message);
    }
  }

  // 4) Preguntas fijas
  console.log('📝 Creando preguntas fijas...');
  const preguntas = [
    'Dominio y manejo del tema del curso.',
    'Claridad en la exposición de los conceptos.',
    'Fomento de la participación y resolución de dudas.',
    'Calidad de los materiales y recursos de apoyo.',
    'Puntualidad y cumplimiento del programa del curso.'
  ];

  for (const texto of preguntas) {
    try {
      await prisma.pregunta.create({ data: { textoPregunta: texto } });
      console.log(`  ✅ Pregunta: ${texto}`);
    } catch (err) {
      console.error(`  ❌ Error creando pregunta "${texto}":`, err.message);
    }
  }

  // 5) Ajustar secuencias al máximo actual para evitar conflictos (nextval -> max+1)
  try {
    await setSequenceToMax('catedratico', 'catedraticoId');
    await setSequenceToMax('curso', 'cursoId');
    await setSequenceToMax('pregunta', 'preguntaId');
    await setSequenceToMax('evaluacion', 'evaluacionId');
    await setSequenceToMax('respuesta', 'respuestaId');
    console.log('🔁 Secuencias ajustadas al máximo actual.');
  } catch (err) {
    console.warn('⚠️ No se pudieron ajustar todas las secuencias automáticamente. Revisa manualmente si hace falta. Error:', err.message);
  }

  console.log('🎉 Seed finalizado correctamente.');
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