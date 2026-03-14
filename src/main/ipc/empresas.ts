import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('empresas:getAll', async () => {
    return await prisma.empresa.findMany({ orderBy: { createdAt: 'desc' } });
});

ipcMain.handle('empresas:create', async (_, data) => {
    if (!data.nombre?.trim())    throw new Error('El nombre es obligatorio');
    if (!data.ruc?.trim())       throw new Error('El RUC/NIF es obligatorio');
    if (!data.telefono?.trim())  throw new Error('El teléfono es obligatorio');
    if (!data.direccion?.trim()) throw new Error('La dirección es obligatoria');
    if (!data.cp?.trim())        throw new Error('El CP es obligatorio');
    if (!data.ciudad?.trim())    throw new Error('La ciudad es obligatoria');
    const existe = await prisma.empresa.findFirst({ where: { ruc: data.ruc.trim().toUpperCase() } });
    if (existe) throw new Error('Ya existe una empresa con ese RUC/NIF');
    return await prisma.empresa.create({ data: { ...data, ruc: data.ruc.trim().toUpperCase() } });
});

ipcMain.handle('empresas:update', async (_, id, data) => {
    if (!data.nombre?.trim())    throw new Error('El nombre es obligatorio');
    if (!data.ruc?.trim())       throw new Error('El RUC/NIF es obligatorio');
    if (!data.telefono?.trim())  throw new Error('El teléfono es obligatorio');
    if (!data.direccion?.trim()) throw new Error('La dirección es obligatoria');
    if (!data.cp?.trim())        throw new Error('El CP es obligatorio');
    if (!data.ciudad?.trim())    throw new Error('La ciudad es obligatoria');
    const existe = await prisma.empresa.findFirst({
        where: { ruc: data.ruc.trim().toUpperCase(), NOT: { id } }
    });
    if (existe) throw new Error('Ya existe una empresa con ese RUC/NIF');
    return await prisma.empresa.update({ where: { id }, data: { ...data, ruc: data.ruc.trim().toUpperCase() } });
});

ipcMain.handle('empresas:delete', async (_, id) => {
    return await prisma.empresa.delete({ where: { id } });
});