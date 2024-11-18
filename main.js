const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'build/logo.png')
  });

  mainWindow.loadURL(url).catch((err) => {
    console.error('Failed to load URL:', err);
    dialog.showErrorBox('Error', 'Failed to load URL: ' + err.message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Load admin.php initially
  createWindow('https://expintek.com/portal/cgi-bin/app/index.php');

  // Load other pages as needed
  ipcMain.on('load-page', (event, page) => {
    const url = `https://expintek.com/portal/cgi-bin/app/${page}.php`;
    createWindow(url);
  });

  require('./menu');

  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'workspace',
    owner: 'Expintekuser',
    private: true,
    token: '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'
  });

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: `Update available. Current version: ${app.getVersion()}. Downloading now...`,
    });

    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-not-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'No update available',
      message: `No update available. Current version: ${app.getVersion()}.`,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded; will install in 5 seconds');
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    dialog.showErrorBox('Error: ', err == null ? 'unknown' : (err.stack || err).toString());
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow('https://expintek.com/portal/cgi-bin/app/index.php');
});
