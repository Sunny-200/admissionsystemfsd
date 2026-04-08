const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const { withLegacyBranchAllotted } = require('../utils/branchMapping');

// 1. Get all applications
const getAllApplications = async () => {
  return prisma.studentProfile.findMany({
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
      documents: true,
    },
  });

  if (!application) {
    throw new Error('Application Not Found');
  }

  return application;
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

module.exports = {
  getAllApplications,
  getApplicationById,
  getApplicationsWithAssignments,
  bulkAssign,
  getVerifiers,
};