const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  getBranchIdFromCode,
  withLegacyBranchAllotted,
} = require('../utils/branchMapping');
const { getLatestDocumentsByType } = require('../utils/documentLatest');

const toOptionalInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const toOptionalBoolean = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const getStudentProfile = async (userId) => {
  const includeConfig = {
    branch: true,
    batch: true,
    documents: {
      orderBy: { uploadedAt: 'desc' },
    },
  };

  let profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: includeConfig,
  });

  if (!profile) {
    throw new Error('No application found');
  }

  if (!profile.batchId || !profile.batch) {
    const currentYear = new Date().getFullYear();
    const batchCode = String(currentYear);
    const batchName = `Batch ${currentYear}`;

    let batch = await prisma.batch.findFirst({
      where: {
        OR: [{ code: batchCode }, { startYear: currentYear }],
      },
    });

    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          code: batchCode,
          name: batchName,
          startYear: currentYear,
          endYear: currentYear + 4,
        },
      });
    }

    profile = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { batchId: batch.id },
      include: includeConfig,
    });
  }

  return withLegacyBranchAllotted({
    ...profile,
    documents: getLatestDocumentsByType(profile.documents || []),
  });
};

const getStudentRemarks = async (userId) => {
  // Step 1: get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!studentProfile) {
    throw new Error('Student profile not found');
  }

  // Step 2: fetch remarks
  const remarks = await prisma.remark.findMany({
    where: {
      applicationId: studentProfile.id,
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return remarks;
};

const submitApplication = async (userId, data) => {
  const normalizedAadhar = data.aadharNumber?.trim();

  // Validate required fields
  if (!data.name || !data.dateOfBirth || !normalizedAadhar) {
    throw new Error('Missing required fields');
  }

  const existingProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { documents: true },
  });

  const existingProfileAadhar = existingProfile?.aadharNumber?.trim();
  const shouldCheckAadhar =
    !existingProfile || existingProfileAadhar !== normalizedAadhar;


  const canResubmit = ['REJECTED', 'DOCUMENTS_REJECTED'].includes(
    existingProfile?.applicationStatus
  );

  if (existingProfile && !canResubmit) {
    throw new Error('Application already submitted');
  }

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    const mappedBranchId = await getBranchIdFromCode(data.branchAllotted, tx);
    const currentYear = new Date().getFullYear();
    const batchCode = String(currentYear);
    const batchName = `Batch ${currentYear}`;

    let batch = await tx.batch.findFirst({
      where: {
        OR: [{ code: batchCode }, { startYear: currentYear }],
      },
      select: { id: true },
    });

    if (!batch) {
      batch = await tx.batch.create({
        data: {
          code: batchCode,
          name: batchName,
          startYear: currentYear,
          endYear: currentYear + 4,
        },
        select: { id: true },
      });
    }

    const profile = existingProfile
      ? await tx.studentProfile.update({
          where: { id: existingProfile.id },
          data: {
            name: data.name,
            dateOfBirth: new Date(data.dateOfBirth),
            contactNumber: data.contactNumber,
            guardianName: data.guardianName,
            guardianNumber: data.guardianNumber,
            guardianEmail: data.guardianEmail,
            aadharNumber: normalizedAadhar,
            religion: data.religion,
            casteCategory: data.casteCategory,
            branchAllotted: data.branchAllotted,
            branchId: mappedBranchId || null,
            batchId: batch.id,
            gender: data.gender || null,
            isPwd: toOptionalBoolean(data.isPwd),
            pwdDisabilityType: data.pwdDisabilityType || null,
            jeeMainRank: toOptionalInt(data.jeeMainRank),
            jeeMainCategoryRank: toOptionalInt(data.jeeMainCategoryRank),
            jeeAdvancedRank: toOptionalInt(data.jeeAdvancedRank),
            jeeAdvancedCategoryRank: toOptionalInt(data.jeeAdvancedCategoryRank),
            seatAllotmentSource: data.seatAllotmentSource,
            permanentAddress: data.permanentAddress,
            state: data.state,
            bloodGroup: data.bloodGroup || null,
            remarksFromStudent: data.remarksFromStudent || null,
            applicationStatus: 'PENDING',
          },
        })
      : await tx.studentProfile.create({
          data: {
            userId,
            name: data.name,
            dateOfBirth: new Date(data.dateOfBirth),
            contactNumber: data.contactNumber,
            guardianName: data.guardianName,
            guardianNumber: data.guardianNumber,
            guardianEmail: data.guardianEmail,
            aadharNumber: normalizedAadhar,
            religion: data.religion,
            casteCategory: data.casteCategory,
            branchAllotted: data.branchAllotted,
            branchId: mappedBranchId || null,
            batchId: batch.id,
            gender: data.gender || null,
            isPwd: toOptionalBoolean(data.isPwd),
            pwdDisabilityType: data.pwdDisabilityType || null,
            jeeMainRank: toOptionalInt(data.jeeMainRank),
            jeeMainCategoryRank: toOptionalInt(data.jeeMainCategoryRank),
            jeeAdvancedRank: toOptionalInt(data.jeeAdvancedRank),
            jeeAdvancedCategoryRank: toOptionalInt(data.jeeAdvancedCategoryRank),
            seatAllotmentSource: data.seatAllotmentSource,
            permanentAddress: data.permanentAddress,
            state: data.state,
            bloodGroup: data.bloodGroup || null,
            remarksFromStudent: data.remarksFromStudent || null,
            applicationStatus: 'PENDING',
          },
        });

    const documentEntries = Object.entries(data.documentUrls || {});

    const documentPromises = documentEntries.map(async ([docType, fileUrl]) => {
      const rawName = fileUrl.split('/').pop() || 'unknown';
      let decodedName = rawName;
      try {
        decodedName = decodeURIComponent(rawName);
      } catch {
        decodedName = rawName;
      }

      await tx.document.deleteMany({
        where: {
          studentProfileId: profile.id,
          documentType: docType,
        },
      });

      return tx.document.create({
        data: {
          studentProfileId: profile.id,
          documentType: docType,
          fileUrl,
          fileName: decodedName,
          status: 'PENDING',
          version: 1,
        },
      });
    });

    await Promise.all(documentPromises);

    return profile;
  });

  return result;
};

module.exports = { getStudentProfile,getStudentRemarks,submitApplication };