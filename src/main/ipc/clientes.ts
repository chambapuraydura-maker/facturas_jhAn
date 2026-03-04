import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('clientes:getAll', async () => {
    return await prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } });
});

ipcMain.handle('clientes:create', async (_, data) => {
    return await prisma.cliente.create({ data });
});

ipcMain.handle('clientes:update', async (_, id, data) => {
    return await prisma.cliente.update({ where: { id }, data });
});

ipcMain.handle('clientes:delete', async (_, id) => {
    return await prisma.cliente.delete({ where: { id } });
});