import { ipcMain } from 'electron';
import { prisma } from '../../server/prisma/client';

ipcMain.handle('facturas:getAll', async () => {
    return await prisma.factura.findMany({
        include: {
            cliente: true,
            empresa: true,
            items: { include: { menuItem: { include: { categoria: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    });
});

ipcMain.handle('facturas:getById', async (_, id) => {
    return await prisma.factura.findUnique({
        where: { id },
        include: {
            cliente: true,
            empresa: true,
            items: { include: { menuItem: { include: { categoria: true } } } },
        },
    });
});

ipcMain.handle('facturas:create', async (_, { items, ...data }) => {
    return await prisma.factura.create({
        data: {
            ...data,
            items: { create: (items || []) },
        },
        include: {
            cliente: true,
            empresa: true,
            items: { include: { menuItem: { include: { categoria: true } } } },
        },
    });
});

ipcMain.handle('facturas:update', async (_, id, { items, ...data }) => {
  // Borrar items anteriores y recrear (solo en borradores)
    if (items !== undefined) {
        await prisma.facturaItem.deleteMany({ where: { facturaId: id } });
    }
    return await prisma.factura.update({
    where: { id },
        data: {
            ...data,
            ...(items !== undefined && {
                items: { create: items },
            }),
        },
        include: {
            cliente: true,
            empresa: true,
            items: { include: { menuItem: { include: { categoria: true } } } },
        },
    });
});

ipcMain.handle('facturas:delete', async (_, id) => {
    await prisma.facturaItem.deleteMany({ where: { facturaId: id } });
    return await prisma.factura.delete({ where: { id } });
});