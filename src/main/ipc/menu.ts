import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('menu:getAll', async () => {
    return await prisma.menuItem.findMany({
        include: { categoria: true },
        orderBy: { createdAt: 'desc' },
    });
});

ipcMain.handle('menu:getByCategoria', async (_, categoriaId) => {
    return await prisma.menuItem.findMany({
        where: { categoriaId },
        include: { categoria: true },
    });
});

ipcMain.handle('menu:create', async (_, data) => {
    return await prisma.menuItem.create({
        data,
        include: { categoria: true },
    });
});

ipcMain.handle('menu:update', async (_, id, data) => {
    return await prisma.menuItem.update({
        where: { id },
        data,
        include: { categoria: true },
    });
});

ipcMain.handle('menu:delete', async (_, id) => {
    return await prisma.menuItem.delete({ where: { id } });
});