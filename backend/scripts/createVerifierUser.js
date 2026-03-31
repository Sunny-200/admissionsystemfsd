const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const email = 'verifier1@test.com';
const password = 'verifier1';
const name = 'verifier';

const main = async () => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', existing.id);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: 'VERIFIER',
    },
  });

  console.log('Created verifier:', user.id);
};

main()
  .catch((error) => {
    console.error('Create verifier failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
