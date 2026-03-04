"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    clientes: {
        getAll: () => electron_1.ipcRenderer.invoke('clientes:getAll'),
        create: (data) => electron_1.ipcRenderer.invoke('clientes:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('clientes:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('clientes:delete', id),
    },
    empresas: {
        getAll: () => electron_1.ipcRenderer.invoke('empresas:getAll'),
        create: (data) => electron_1.ipcRenderer.invoke('empresas:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('empresas:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('empresas:delete', id),
    },
    categorias: {
        getAll: () => electron_1.ipcRenderer.invoke('categorias:getAll'),
        create: (data) => electron_1.ipcRenderer.invoke('categorias:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('categorias:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('categorias:delete', id),
    },
    menu: {
        getAll: () => electron_1.ipcRenderer.invoke('menu:getAll'),
        getByCategoria: (categoriaId) => electron_1.ipcRenderer.invoke('menu:getByCategoria', categoriaId),
        create: (data) => electron_1.ipcRenderer.invoke('menu:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('menu:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('menu:delete', id),
    },
    facturas: {
        getAll: () => electron_1.ipcRenderer.invoke('facturas:getAll'),
        getById: (id) => electron_1.ipcRenderer.invoke('facturas:getById', id),
        create: (data) => electron_1.ipcRenderer.invoke('facturas:create', data),
    },
});
