const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { withLegacyBranchAllotted } = require('../utils/branchMapping');

// 1. Get assigned applications
const getAssignments = async (verifierId) => {
  const rows = await prisma.$queryRaw`
    SELECT
      sp."id",
      sp."name",
      u."email",
      sp."branchAllotted" AS "legacyBranchAllotted",
      b."code" AS "branchCode",
      sp."applicationStatus"::text,
      sp."createdAt",
      a."assignedAt"
    FROM "Assignment" a
    JOIN "StudentProfile" sp ON sp."id" = a."applicationId"
    JOIN "User" u ON u."id" = sp."userId"
    LEFT JOIN "Branch" b ON b."id" = sp."branchId"
    WHERE a."verifierId" = ${verifierId}
    ORDER BY a."assignedAt" DESC
  `;

  return rows.map((row) => {
    const { branchCode, legacyBranchAllotted, ...rest } = row;
    return {
      ...rest,
      branchAllotted: branchCode || legacyBranchAllotted || null,
      createdAt: new Date(row.createdAt).toISOString(),
      assignedAt: new Date(row.assignedAt).toISOString(),
    };
  });
};

// 2. Check assignment
const checkAssignment = async (appId, verifierId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      applicationId: appId,
      verifierId,
    },
  });

  if (!assignment) {
    throw new Error('NOT_ASSIGNED');
  }
};

// 3. Get full application
const getApplicationById = async (id, verifierId) => {
  await checkAssignment(id, verifierId);

  const application = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      branch: true,
      batch: true,
      documents: { orderBy: { uploadedAt: 'asc' } },
      assignments: {
        include: {
          verifier: { select: { name: true, email: true } },
          assigner: { select: { name: true, email: true } },
        },
        orderBy: { assignedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!application) throw new Error('NOT_FOUND');

  return withLegacyBranchAllotted(application);
};

// 4. Get remarks
const getRemarks = async (id, verifierId) => {
  await checkAssignment(id, verifierId);

  return prisma.remark.findMany({
    where: { applicationId: id },
    include: {
      author: {
        select: { name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 5. Add remark
const addRemark = async (id, verifierId, text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('EMPTY_TEXT');
  }

  if (text.length > 5000) {
    throw new Error('TEXT_TOO_LONG');
  }

  await checkAssignment(id, verifierId);

  return prisma.remark.create({
    data: {
      applicationId: id,
      authorId: verifierId,
      text: text.trim(),
    },
    include: {
      author: {
        select: { name: true, email: true, role: true },
      },
    },
  });
};

// 6. Update status
const updateStatus = async (id, verifierId, status) => {
  const valid = ['VERIFIED', 'REJECTED'];

  if (!valid.includes(status)) {
    throw new Error('INVALID_STATUS');
  }

  await checkAssignment(id, verifierId);

  const current = await prisma.studentProfile.findUnique({
    where: { id },
    select: { applicationStatus: true },
  });

  if (['VERIFIED', 'REJECTED'].includes(current?.applicationStatus)) {
    throw new Error('FINAL_STATUS');
  }

  return prisma.studentProfile.update({
    where: { id },
    data: { applicationStatus: status },
  });
};

module.exports = {
  getAssignments,
  getApplicationById,
  getRemarks,
  addRemark,
  updateStatus,
};