import { prisma } from "../src/server/prisma/client"

async function main() {
    console.log("Prisma conectado:", !!prisma)
}

main()