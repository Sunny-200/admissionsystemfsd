const prisma = require('../lib/prisma');

const normalizeBranchCode = (code) => {
  if (typeof code !== 'string') return null;
  const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
  return normalized || null;
};

const getBranchIdFromCode = async (code, txOrPrisma = prisma) => {
  const normalizedCode = normalizeBranchCode(code);
  if (!normalizedCode) return null;

  const branch = await txOrPrisma.branch.findFirst({
    where: {
      code: {
        equals: normalizedCode,
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });

  return branch?.id || null;
};

const withLegacyBranchAllotted = (profile) => {
  if (!profile) return profile;
  return {
    ...profile,
    branchAllotted: profile?.branch?.code || profile?.branchAllotted || null,
  };
};

module.exports = {
  normalizeBranchCode,
  getBranchIdFromCode,
  withLegacyBranchAllotted,
};
