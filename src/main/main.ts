import { dialog, ipcMain, app, BrowserWindow } from 'electron';
import path from 'path';
import ExcelJS from 'exceljs';
import fs from 'fs';
import './ipc/clientes';
import './ipc/empresas';
import './ipc/categorias';
import './ipc/menu';
import './ipc/facturas';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'dist/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
        
    });
    win.removeMenu();

    win.loadFile(path.join(__dirname, '../index.html'));
    //win.webContents.openDevTools();
}
// generar EXCEL de los clientes
ipcMain.handle('export:excel', async (_, filename: string, data: any[]) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('downloads'), filename),
        filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    });
    if (canceled || !filePath) return { success: false };

    const wb   = new ExcelJS.Workbook();
    const ws   = wb.addWorksheet('Clientes');

    // Columnas con cabeceras
    ws.columns = [
        { header: 'Nombre',         key: 'Nombre',         width: 30 },
        { header: 'NIF',            key: 'NIF',            width: 15 },
        { header: 'Teléfono',       key: 'Teléfono',       width: 15 },
        { header: 'Dirección',      key: 'Dirección',      width: 35 },
        { header: 'CP',             key: 'CP',             width: 8  },
        { header: 'Ciudad',         key: 'Ciudad',         width: 20 },
        { header: 'Email',          key: 'Email',          width: 30 },
        { header: 'Notas',          key: 'Notas',          width: 30 },
        { header: 'Fecha Registro', key: 'Fecha Registro', width: 15 },
    ];

    // Estilo cabeceras
    ws.getRow(1).eachCell(cell => {
        cell.font        = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4820A' } };
        cell.alignment   = { horizontal: 'center', vertical: 'middle' };
        cell.border      = {
            bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        };
    });
    ws.getRow(1).height = 22;

    // Añadir filas
    data.forEach(row => ws.addRow(row));

    await wb.xlsx.writeFile(filePath);
    return { success: true, filePath };
});
// generar PDF de la factura
ipcMain.handle('print:pdf', async (event, filename: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('downloads'), filename),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { success: false };

    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false };

    const data = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
    });

    fs.writeFileSync(filePath, data);
    return { success: true, filePath };
});
// imprimir factura directamente sin guardar
ipcMain.handle('print:direct', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.webContents.print({ silent: false, printBackground: true });
});

console.log('__dirname:', __dirname);
console.log('preload path:', path.join(app.getAppPath(), 'dist/preload.js'));
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});