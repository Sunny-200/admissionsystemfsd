require('dotenv').config();
const prisma = require('../lib/prisma');

const BRANCHES = [
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'ECE', name: 'Electronics and Communication Engineering' },
  { code: 'DSAI', name: 'Data Science and Artificial Intelligence' },
];

const main = async () => {
  const batchCode = process.env.DEFAULT_BATCH_CODE || '2024';
  const batchName = process.env.DEFAULT_BATCH_NAME || `Batch ${batchCode}`;
  const defaultIntake = Number(process.env.DEFAULT_BRANCH_INTAKE || 120);

  const batch = await prisma.batch.upsert({
    where: { code: batchCode },
    update: { name: batchName },
    create: {
      code: batchCode,
      name: batchName,
      startYear: Number(batchCode),
      endYear: Number(batchCode) + 4,
    },
  });

  for (const branchData of BRANCHES) {
    const branch = await prisma.branch.upsert({
      where: { code: branchData.code },
      update: { name: branchData.name },
      create: branchData,
    });

    await prisma.branchIntake.upsert({
      where: {
        branchId_batchId: {
          branchId: branch.id,
          batchId: batch.id,
        },
      },
      update: { intake: defaultIntake },
      create: {
        branchId: branch.id,
        batchId: batch.id,
        intake: defaultIntake,
      },
    });
  }

  console.log('Seeded Branch, Batch, and BranchIntake successfully.');
};

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
