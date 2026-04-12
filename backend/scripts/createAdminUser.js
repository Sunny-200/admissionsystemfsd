const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const parseCliArgs = () => {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    if (!key) continue;

    if (key === 'help') {
      values.help = true;
      continue;
    }

    const value = args[index + 1];
    if (value && !value.startsWith('--')) {
      values[key] = value;
      index += 1;
    }
  }

  return values;
};

const printUsage = () => {
  console.log('Usage: node ./scripts/createAdminUser.js --name <name> --email <email> --password <password>');
  console.log('You can also use environment variables: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD');
};

const main = async () => {
  const cli = parseCliArgs();

  if (cli.help) {
    printUsage();
    return;
  }

  const name = (cli.name || process.env.ADMIN_NAME || '').trim();
  const email = (cli.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = cli.password || process.env.ADMIN_PASSWORD || '';

  if (!name || !email || !password) {
    printUsage();
    throw new Error('Missing required fields: name, email, and password are required');
  }

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
