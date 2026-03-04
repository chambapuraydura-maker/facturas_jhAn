import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('empresas:getAll', async () => {
    return await prisma.empresa.findMany({ orderBy: { createdAt: 'desc' } });
});

ipcMain.handle('empresas:create', async (_, data) => {
    return await prisma.empresa.create({ data });
});

ipcMain.handle('empresas:update', async (_, id, data) => {
    return await prisma.empresa.update({ where: { id }, data });
});

ipcMain.handle('empresas:delete', async (_, id) => {
    return await prisma.empresa.delete({ where: { id } });
});