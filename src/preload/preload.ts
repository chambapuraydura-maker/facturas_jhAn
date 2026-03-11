import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    clientes: {
        getAll: () => ipcRenderer.invoke('clientes:getAll'),
        create: (data: any) => ipcRenderer.invoke('clientes:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('clientes:update', id, data),
        delete: (id: string) => ipcRenderer.invoke('clientes:delete', id),
    },
    empresas: {
        getAll: () => ipcRenderer.invoke('empresas:getAll'),
        create: (data: any) => ipcRenderer.invoke('empresas:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('empresas:update', id, data),
        delete: (id: string) => ipcRenderer.invoke('empresas:delete', id),
    },
    categorias: {
        getAll: () => ipcRenderer.invoke('categorias:getAll'),
        create: (data: any) => ipcRenderer.invoke('categorias:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('categorias:update', id, data),
        delete: (id: string) => ipcRenderer.invoke('categorias:delete', id),
    },
    menu: {
        getAll: () => ipcRenderer.invoke('menu:getAll'),
        getByCategoria: (categoriaId: string) => ipcRenderer.invoke('menu:getByCategoria', categoriaId),
        create: (data: any) => ipcRenderer.invoke('menu:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('menu:update', id, data),
        delete: (id: string) => ipcRenderer.invoke('menu:delete', id),
    },
    facturas: {
        getAll: () => ipcRenderer.invoke('facturas:getAll'),
        getById: (id: string) => ipcRenderer.invoke('facturas:getById', id),
        create: (data: any) => ipcRenderer.invoke('facturas:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('facturas:update', id, data),
        delete: (id: string) => ipcRenderer.invoke('facturas:delete', id),
    },

    exportExcel: (filename: string, buffer: number[]) => ipcRenderer.invoke('export:excel', filename, buffer),
});