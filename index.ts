import {prisma} from "./src/lib/prisma.js";



const crear = async (data: string) => {
    try {
        const cre = prisma.categorias.create({
            categoria: data
        });
        return `Creado ${cre}`
    } catch (error) {
        throw new Error(`Error al crear: ${error}`);
    }
}

crear("bebidas");






