import { app, BrowserWindow } from 'electron';
import path from 'path';
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

    win.loadFile(path.join(__dirname, '../index.html'));
    win.webContents.openDevTools();
}
console.log('__dirname:', __dirname);
console.log('preload path:', path.join(app.getAppPath(), 'dist/preload.js'));
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});