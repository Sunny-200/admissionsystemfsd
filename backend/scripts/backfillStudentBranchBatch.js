require('dotenv').config();
const prisma = require('../lib/prisma');
const { getBranchIdFromCode } = require('../utils/branchMapping');

const main = async () => {
  const defaultBatchCode = process.env.DEFAULT_BATCH_CODE || '2024';

  const batch = await prisma.batch.findUnique({
    where: { code: defaultBatchCode },
    select: { id: true },
  });

  if (!batch) {
    throw new Error(
      `Default batch '${defaultBatchCode}' not found. Run seedBranchBatchData.js first.`
    );
  }

  const profiles = await prisma.studentProfile.findMany({
    select: {
      id: true,
      branchAllotted: true,
      branchId: true,
      batchId: true,
    },
  });

  let updatedCount = 0;
  let unresolvedBranchCount = 0;

  for (const profile of profiles) {
    const resolvedBranchId = profile.branchId || (await getBranchIdFromCode(profile.branchAllotted));
    const resolvedBatchId = profile.batchId || batch.id;

    if (!resolvedBranchId) {
      unresolvedBranchCount += 1;
      continue;
    }

    if (profile.branchId === resolvedBranchId && profile.batchId === resolvedBatchId) {
      continue;
    }

    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        branchId: resolvedBranchId,
        batchId: resolvedBatchId,
      },
    });

    updatedCount += 1;
  }

  console.log(`Backfill complete. Updated ${updatedCount} profile(s).`);
  console.log(`Unresolved branches: ${unresolvedBranchCount}.`);
};

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
