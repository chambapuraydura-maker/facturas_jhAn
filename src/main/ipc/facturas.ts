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

ipcMain.handle('facturas:update', async (_, id, { items, clienteId, fromName, fromNIF, fromAddr, fromCity, fromPhone, fromEmail, toName, toNIF, toAddr, toCity, toPhone, toEmail, ...data } ) => {
  // Borrar items anteriores y recrear (solo en borradores)
    if (items !== undefined) {
        await prisma.facturaItem.deleteMany({ where: { facturaId: id } });
    }

    if (data.fechaEmision && !data.fechaEmision.includes('T')) {
        data.fechaEmision = new Date(data.fechaEmision).toISOString();
    }
    return await prisma.factura.update({
        where: { id },
        data: {
            ...data,
            ...(clienteId ? { cliente: { connect: { id: clienteId } } } : { cliente: { disconnect: true } }),
            ...(items !== undefined && { items: { create: items } }),
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