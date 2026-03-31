const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStudentProfile = async (userId) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      documents: {
        orderBy: { documentType: 'asc' },
      },
    },
  });

  if (!profile) {
    throw new Error('No application found');
  }

  return profile;
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
  // Validate required fields
  if (!data.name || !data.dateOfBirth || !data.aadharNumber) {
    throw new Error('Missing required fields');
  }

  // Check existing profile
  const existingProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new Error('Application already submitted');
  }

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.studentProfile.create({
      data: {
        userId,
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        contactNumber: data.contactNumber,
        guardianName: data.guardianName,
        guardianNumber: data.guardianNumber,
        guardianEmail: data.guardianEmail,
        aadharNumber: data.aadharNumber,
        religion: data.religion,
        casteCategory: data.casteCategory,
        branchAllotted: data.branchAllotted,
        seatAllotmentSource: data.seatAllotmentSource,
        permanentAddress: data.permanentAddress,
        state: data.state,
        bloodGroup: data.bloodGroup || null,
        remarksFromStudent: data.remarksFromStudent || null,
        applicationStatus: 'PENDING',
      },
    });

    // Documents
    const documentPromises = Object.entries(data.documentUrls).map(
      ([docType, fileUrl]) => {
        return tx.document.create({
          data: {
            studentProfileId: profile.id,
            documentType: docType,
            fileUrl,
            fileName: fileUrl.split('/').pop() || 'unknown',
            status: 'PENDING',
            version: 1,
          },
        });
      }
    );

    await Promise.all(documentPromises);

    return profile;
  });

  return result;
};

module.exports = { getStudentProfile,getStudentRemarks,submitApplication };