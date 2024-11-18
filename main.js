const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
require('./menu');

let mainWindow;

autoUpdater.autoDownload = false; // Auto download is set to false
autoUpdater.autoInstallOnAppQuit = true; // Install updates on app quit

function createWindow(url) {
  if (mainWindow) {
    mainWindow.loadURL(url).catch((err) => {
      console.error('Failed to load URL:', err);
      dialog.showErrorBox('Error', 'Failed to load URL: ' + err.message);
    });
    return;
  }

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

// Function to initialize auto-updater
function initializeAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', (info) => {
    const result = dialog.showMessageBoxSync({
      type: 'info',
      buttons: ['Download', 'Later'],
      title: 'Update available',
      message: `A new version is available. Do you want to download it now?`
    });
    if (result === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available.');
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'An update has been downloaded. The application will restart to apply the update.',
    }).then(() => {
      autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    dialog.showErrorBox('Error', err?.stack || err.message || 'Unknown error');
  });
}

app.whenReady().then(() => {
  createWindow('https://expintek.com/portal/cgi-bin/app/index.php');
  initializeAutoUpdater();

  // Handle loading other pages
  ipcMain.on('load-page', (event, page) => {
    const url = `https://expintek.com/portal/cgi-bin/app/${page}.php`;
    if (mainWindow) {
      mainWindow.loadURL(url).catch((err) => {
        console.error('Failed to load URL:', err);
        dialog.showErrorBox('Error', 'Failed to load URL: ' + err.message);
      });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow('https://expintek.com/portal/cgi-bin/app/index.php');
});
