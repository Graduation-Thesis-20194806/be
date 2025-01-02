import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'seed.json');
  const rawData = fs.readFileSync(dataPath);
  const reports = JSON.parse(rawData.toString());

  await prisma.report.createMany({
    data: reports,
  });

  console.log(`${reports.length} bug reports have been created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
