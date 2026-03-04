import { PrismaClient } from "@prisma/client";

// crea una instancia de prismaClient
const globalPrisma = global as unknown as {prisma: PrismaClient};

// si ya existe una instancia de prismaClient, reutiliza
// si no existe, crea una instancia nueva
export const prisma = globalPrisma.prisma || new PrismaClient();
