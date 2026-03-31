require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const decodeFileName = (value) => {
  if (!value) return value;
  if (!String(value).includes('%')) return value;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const main = async () => {
  const documents = await prisma.document.findMany({
    select: { id: true, fileName: true },
  });

  const updates = documents
    .map((doc) => {
      const decoded = decodeFileName(doc.fileName);
      if (!decoded || decoded === doc.fileName) {
        return null;
      }

      return { id: doc.id, fileName: decoded };
    })
    .filter(Boolean);

  if (updates.length === 0) {
    console.log('No document file names need normalization.');
    return;
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.document.update({
        where: { id: update.id },
        data: { fileName: update.fileName },
      })
    )
  );

  console.log(`Normalized ${updates.length} document file name(s).`);
};

main()
  .catch((error) => {
    console.error('Normalization failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
