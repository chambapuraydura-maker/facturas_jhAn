import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('categorias:getAll', async () => {
    return await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
});

ipcMain.handle('categorias:create', async (_, data) => {
    return await prisma.categoria.create({ data });
});

ipcMain.handle('categorias:update', async (_, id, data) => {
    return await prisma.categoria.update({ where: { id }, data });
});

ipcMain.handle('categorias:delete', async (_, id) => {
    return await prisma.categoria.delete({ where: { id } });
});