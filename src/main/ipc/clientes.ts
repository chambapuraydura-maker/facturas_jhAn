import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';


ipcMain.handle('clientes:getAll', async () => {
    return await prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } });
});

ipcMain.handle('clientes:create', async (_, data) => {
    const existe = await prisma.cliente.findFirst({ where: { nif: data.nif.trim().toUpperCase() } });
    if (existe) {
        throw new Error('Ya existe un cliente con ese NIF/CIF/NIE');
    }
    return await prisma.cliente.create({ data: { ...data, nif: data.nif.trim().toUpperCase() } });
});

ipcMain.handle('clientes:update', async (_, id, data) => {
    if (data.nif) {
        const existe = await prisma.cliente.findFirst({
            where: { nif: data.nif.trim().toUpperCase(), NOT: { id } }
        });
        if (existe) {
            throw new Error('Ya existe un cliente con ese NIF/CIF/NIE');
        }
        data.nif = data.nif.trim().toUpperCase();
    }
    return await prisma.cliente.update({ where: { id }, data });
});

ipcMain.handle('clientes:delete', async (_, id) => {
    return await prisma.cliente.delete({ where: { id } });
});