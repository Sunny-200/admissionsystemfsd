const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const email = 'admin1@test.com';
const password = 'admin1';
const name = 'admin1';

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
      role: 'ADMIN',
    },
  });

  console.log('Created admin:', user.id);
};

main()
  .catch((error) => {
    console.error('Create admin failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
