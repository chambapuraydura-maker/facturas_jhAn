import { PrismaClient } from '@prisma/client';

// conectando
const prisma = new PrismaClient();

// exportando prisma para re-utilizar
export {prisma};
