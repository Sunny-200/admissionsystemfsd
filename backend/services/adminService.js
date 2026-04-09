const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const { withLegacyBranchAllotted } = require('../utils/branchMapping');
const { getLatestDocumentsByType } = require('../utils/documentLatest');

// 1. Get all applications
const getAllApplications = async () => {
  const applications = await prisma.studentProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
      documents: {
        select: {
          id: true,
          documentType: true,
          status: true,
          uploadedAt: true,
          version: true,
        },
      },
      branch: true,
      batch: {
        select: {
          id: true,
          code: true,
          name: true,
          startYear: true,
          endYear: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return applications.map((application) => ({
    ...application,
    documents: getLatestDocumentsByType(application.documents || []),
  }));
};

// 2. Get single application
const getApplicationById = async (id) => {
  const application = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
      branch: true,
      batch: true,
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!application) {
    throw new Error('Application Not Found');
  }

  return {
    ...application,
    documents: getLatestDocumentsByType(application.documents || []),
  };
};

// 3. Get applications with assignment info
const getApplicationsWithAssignments = async () => {
  const applications = await prisma.studentProfile.findMany({
    select: {
      id: true,
      name: true,
      branchAllotted: true,
      branch: {
        select: { code: true },
      },
      applicationStatus: true,
      createdAt: true,
      user: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const applicationIds = applications.map((app) => app.id);

  const latestAssignments = applicationIds.length
    ? await prisma.$queryRaw(Prisma.sql`
        SELECT DISTINCT ON (a."applicationId")
          a."applicationId",
          u."name" AS "verifierName",
          u."email" AS "verifierEmail"
        FROM "Assignment" a
        INNER JOIN "User" u ON u."id" = a."verifierId"
        WHERE a."applicationId" IN (${Prisma.join(applicationIds)})
        ORDER BY a."applicationId", a."assignedAt" DESC
      `)
    : [];

  const map = new Map();

  latestAssignments.forEach((a) => {
    map.set(a.applicationId, {
      name: a.verifierName,
      email: a.verifierEmail,
    });
  });

  return applications.map((app) => {
    const normalized = withLegacyBranchAllotted(app);
    return {
      ...normalized,
      email: app.user?.email || null,
      createdAt: app.createdAt.toISOString(),
      assignedVerifier: map.get(app.id) || null,
    };
  });
};

// 4. Bulk assignment
const bulkAssign = async (applicationIds, verifierId, adminId) => {
  if (!applicationIds?.length) {
    throw new Error('No applications selected');
  }

  if (!verifierId) {
    throw new Error('No verifier selected');
  }

  const verifier = await prisma.user.findUnique({
    where: { id: verifierId },
  });

  if (!verifier || verifier.role !== 'VERIFIER') {
    throw new Error('Invalid verifier');
  }

  return prisma.$transaction(async (tx) => {
    const existingAssignments = await tx.assignment.findMany({
      where: {
        applicationId: { in: applicationIds },
      },
    });

    const existingAppIds = existingAssignments.map((a) => a.applicationId);

    const newAppIds = applicationIds.filter(
      (id) => !existingAppIds.includes(id)
    );

    const reassignAppIds = existingAssignments
      .filter((a) => a.verifierId !== verifierId)
      .map((a) => a.applicationId);

    if (reassignAppIds.length > 0) {
      await tx.assignment.deleteMany({
        where: { applicationId: { in: reassignAppIds } },
      });
    }

    const appsToAssign = [...newAppIds, ...reassignAppIds];

    if (appsToAssign.length > 0) {
      await tx.assignment.createMany({
        data: appsToAssign.map((appId) => ({
          applicationId: appId,
          verifierId,
          assignedBy: adminId,
        })),
      });

      await tx.studentProfile.updateMany({
        where: {
          id: { in: appsToAssign },
          applicationStatus: 'PENDING',
        },
        data: {
          applicationStatus: 'IN_REVIEW',
        },
      });
    }

    return { success: true };
  });
};

// 5. Get verifiers
const getVerifiers = async () => {
  return prisma.user.findMany({
    where: { role: 'VERIFIER' },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });
};

// 6. Branch-wise intake vs admitted stats
const getBranchStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { code: 'asc' },
  });

  const intakeRows = activeBatch
    ? await prisma.branchIntake.findMany({
        where: { batchId: activeBatch.id },
        select: {
          branchId: true,
          intake: true,
        },
      })
    : [];

  const intakeByBranchId = new Map(
    intakeRows.map((row) => [row.branchId, Number(row.intake || 0)])
  );

  const branchCodeById = new Map(branches.map((branch) => [branch.id, branch.code]));

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      branchId: true,
      branchAllotted: true,
    },
  });

  const admittedByBranchCode = new Map();

  admittedProfiles.forEach((profile) => {
    const code =
      (profile.branchId ? branchCodeById.get(profile.branchId) : null) ||
      profile.branchAllotted ||
      null;

    if (!code) return;

    admittedByBranchCode.set(code, (admittedByBranchCode.get(code) || 0) + 1);
  });

  const stats = branches.map((branch) => ({
    branch: branch.code,
    intake: intakeByBranchId.get(branch.id) || 0,
    admitted: admittedByBranchCode.get(branch.code) || 0,
  }));

  admittedByBranchCode.forEach((admitted, code) => {
    const alreadyIncluded = stats.some((item) => item.branch === code);
    if (!alreadyIncluded) {
      stats.push({
        branch: code,
        intake: 0,
        admitted,
      });
    }
  });

  return stats.sort((a, b) => a.branch.localeCompare(b.branch));
};

// 7. Branch-wise gender distribution stats
const getGenderStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
    },
    orderBy: { code: 'asc' },
  });

  const branchCodeById = new Map(branches.map((branch) => [branch.id, branch.code]));
  const defaultStatsByBranch = new Map(
    branches.map((branch) => [branch.code, { male: 0, female: 0, other: 0 }])
  );

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      branchId: true,
      branchAllotted: true,
      gender: true,
    },
  });

  admittedProfiles.forEach((profile) => {
    const code =
      (profile.branchId ? branchCodeById.get(profile.branchId) : null) ||
      profile.branchAllotted ||
      null;

    if (!code) return;

    const current = defaultStatsByBranch.get(code) || { male: 0, female: 0, other: 0 };
    const normalizedGender = String(profile.gender || '').toUpperCase();

    if (normalizedGender === 'MALE') {
      current.male += 1;
    } else if (normalizedGender === 'FEMALE') {
      current.female += 1;
    } else {
      current.other += 1;
    }

    defaultStatsByBranch.set(code, current);
  });

  const stats = Array.from(defaultStatsByBranch.entries()).map(([branch, counts]) => ({
    branch,
    male: counts.male,
    female: counts.female,
    other: counts.other,
  }));

  return stats.sort((a, b) => a.branch.localeCompare(b.branch));
};

// 8. PWD vs Non-PWD distribution stats
const getPwdStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      isPwd: true,
      gender: true,
    },
  });

  const result = {
    pwd: { male: 0, female: 0, total: 0 },
    nonPwd: { male: 0, female: 0, total: 0 },
  };

  admittedProfiles.forEach((profile) => {
    const bucket = profile.isPwd ? result.pwd : result.nonPwd;
    const normalizedGender = String(profile.gender || '').toUpperCase();

    if (normalizedGender === 'MALE') {
      bucket.male += 1;
    } else if (normalizedGender === 'FEMALE') {
      bucket.female += 1;
    }

    bucket.total += 1;
  });

  return result;
};

// 9. State-wise gender and total distribution stats
const getStateStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      state: true,
      gender: true,
    },
  });

  const statsByState = new Map();

  admittedProfiles.forEach((profile) => {
    const state = (profile.state || '').trim();
    if (!state) return;

    const current = statsByState.get(state) || {
      state,
      male: 0,
      female: 0,
      total: 0,
    };

    const normalizedGender = String(profile.gender || '').toUpperCase();
    if (normalizedGender === 'MALE') {
      current.male += 1;
    } else if (normalizedGender === 'FEMALE') {
      current.female += 1;
    }

    current.total += 1;
    statsByState.set(state, current);
  });

  return Array.from(statsByState.values()).sort((a, b) => a.state.localeCompare(b.state));
};

// 10. Category-wise gender and total distribution stats
const getCategoryStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      casteCategory: true,
      gender: true,
    },
  });

  const statsByCategory = new Map();

  admittedProfiles.forEach((profile) => {
    const category = String(profile.casteCategory || '').trim();
    if (!category) return;

    const current = statsByCategory.get(category) || {
      category,
      male: 0,
      female: 0,
      other: 0,
      total: 0,
    };

    const normalizedGender = String(profile.gender || '').toUpperCase();
    if (normalizedGender === 'MALE') {
      current.male += 1;
    } else if (normalizedGender === 'FEMALE') {
      current.female += 1;
    } else {
      current.other += 1;
    }

    current.total += 1;
    statsByCategory.set(category, current);
  });

  return Array.from(statsByCategory.values()).sort((a, b) => b.total - a.total);
};

// 11. Opening vs Closing rank range by branch and category
const getRankRangeStats = async () => {
  const currentYear = new Date().getFullYear();

  const activeBatch =
    (await prisma.batch.findFirst({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    })) ||
    (await prisma.batch.findFirst({
      where: {
        OR: [{ startYear: currentYear }, { code: String(currentYear) }],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }));

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
    },
  });

  const branchCodeById = new Map(branches.map((branch) => [branch.id, branch.code]));

  const admittedProfiles = await prisma.studentProfile.findMany({
    where: {
      applicationStatus: {
        notIn: ['REJECTED', 'DOCUMENTS_REJECTED'],
      },
      ...(activeBatch ? { batchId: activeBatch.id } : {}),
    },
    select: {
      branchId: true,
      branchAllotted: true,
      casteCategory: true,
      isPwd: true,
      jeeMainCategoryRank: true,
      jeeMainRank: true,
      jeeAdvancedCategoryRank: true,
      jeeAdvancedRank: true,
    },
  });

  const rangeByKey = new Map();

  admittedProfiles.forEach((profile) => {
    const branch =
      (profile.branchId ? branchCodeById.get(profile.branchId) : null) ||
      String(profile.branchAllotted || '').trim().toUpperCase();
    const category = profile.isPwd
      ? 'PWD'
      : String(profile.casteCategory || '').trim().toUpperCase();

    if (!branch || !category) return;

    const rankCandidates = [
      profile.jeeMainCategoryRank,
      profile.jeeMainRank,
      profile.jeeAdvancedCategoryRank,
      profile.jeeAdvancedRank,
    ]
      .map((rank) => Number(rank))
      .filter((rank) => Number.isFinite(rank) && rank > 0);

    if (rankCandidates.length === 0) return;

    const studentRank = Math.min(...rankCandidates);
    const key = `${branch}::${category}`;

    const current = rangeByKey.get(key) || {
      branch,
      category,
      openingRank: studentRank,
      closingRank: studentRank,
    };

    current.openingRank = Math.min(current.openingRank, studentRank);
    current.closingRank = Math.max(current.closingRank, studentRank);

    rangeByKey.set(key, current);
  });

  return Array.from(rangeByKey.values()).sort((left, right) => {
    if (left.branch !== right.branch) {
      return left.branch.localeCompare(right.branch);
    }
    return left.openingRank - right.openingRank;
  });
};

module.exports = {
  getAllApplications,
  getApplicationById,
  getApplicationsWithAssignments,
  bulkAssign,
  getVerifiers,
  getBranchStats,
  getGenderStats,
  getPwdStats,
  getStateStats,
  getCategoryStats,
  getRankRangeStats,
};