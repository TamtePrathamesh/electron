/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import * as os from "os";
const { execSync, exec } = require('child_process');


require('@electron/remote/main').initialize()

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  ipcMain.handle('getInstalledApps', () => {
    const platform = process.platform;
    let command = '';

    if (platform === 'win32') {
      command = 'wmic product get Name';
    } else if (platform === 'darwin') {
      command = 'ls /Applications';
    } else if (platform === 'linux') {
      command = 'dpkg -l | grep ii | awk \'{ print $2 }\'';
    }

    try {
      const result = execSync(command).toString().trim().split('\n');
      return result;
    } catch (error) {
      console.error('Error retrieving installed applications:', error);
      return [];
    }
  });

  ipcMain.handle('getDiskInfo', async (event, args) => {
    return new Promise((resolve, reject) => {
      const platform = os.platform();

      if (platform === 'win32') {
        // Windows
        exec('wmic logicaldisk get caption,freespace,size', (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }

          const diskInfo = stdout
            .split(os.platform() === 'win32' ? '\r\r\n' : '\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(1) // Remove header line

          resolve(diskInfo);
        });
      } else if (platform === 'darwin' || platform === 'linux') {
        // macOS or Linux
        exec('df -k', (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }

          const diskInfo = stdout
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(1) // Remove header line

          resolve(diskInfo);
        });
      } else {
        reject(new Error('Unsupported platform'));
      }
    });
  });



  // ipcMain.handle('getAntivirusStatus', async (event, args) => {
  //   return new Promise((resolve, reject) => {
  //     if (os.platform() === 'win32') {
  //       // Windows
  //       exec('wmic /namespace:\\\\root\\SecurityCenter2 Path AntiVirusProduct Get displayName', (error, stdout) => {
  //         if (error) {
  //           console.error('Error:', error);
  //           resolve(false);
  //           return;
  //         }
  //
  //         const installedAntivirus = stdout.trim();
  //         resolve(!!installedAntivirus);
  //       });
  //     } else if (os.platform() === 'darwin') {
  //       // macOS
  //       exec('which clamscan', (error, stdout) => {
  //         if (error) {
  //           console.error('Error:', error);
  //           resolve(false);
  //           return;
  //         }
  //
  //         resolve(!!stdout.trim());
  //       });
  //     } else {
  //       // Unsupported platform
  //       console.error('Unsupported platform.');
  //       resolve(false);
  //     }
  //   });
  // });


  ipcMain.handle('getAntivirusStatus', async (event, args) => {
    return new Promise((resolve) => {
      if (os.platform() === 'darwin') {
        // macOS
        // You can check if common antivirus paths exist here, but it's not a foolproof method
        const antivirusPaths = [
          '/Applications/AVGAntivirus.app', // Example path, adjust to your needs
          '/Applications/SomeOtherAntivirus.app', // Example path, adjust to your needs
        ];

        const installedAntivirus = antivirusPaths.some(path => {
          try {
            // Use the fs module to check if the path exists
            const fs = require('fs');
            fs.accessSync(path);
            return true;
          } catch (error) {
            return false;
          }
        });

        resolve(installedAntivirus);
      } else {
        // Unsupported platform
        console.error('Unsupported platform.');
        resolve(false);
      }
    });
  });


  ipcMain.handle('isAntiSpywareInstalled', async (event, args) => {
    return new Promise((resolve) => {
      if (os.platform() === 'win32') {
        exec('wmic /namespace:\\\\root\\SecurityCenter2 Path AntiSpywareProduct Get displayName', (error, stdout) => {
          if (error) {
            console.error('Error:', error);
            resolve(false);
            return;
          }

          const installedAntiSpyware = stdout.trim();
          resolve(!!installedAntiSpyware);
        });
      } else if (os.platform() === 'darwin') {
        exec('which malwarebytes', (error, stdout) => {
          if (error) {
            console.error('Error:', error);
            resolve(false);
            return;
          }

          resolve(!!stdout.trim());
        });
      } else {
        // Unsupported platform
        console.error('Unsupported platform.');
        resolve(false);
      }
    });
  });



  ipcMain.handle('isActiveFirewallInstalled', async (event, args) => {
    return new Promise((resolve) => {
      if (os.platform() === 'win32') {
        exec('netsh advfirewall show allprofiles', (error, stdout) => {
          if (error) {
            console.error('Error:', error);
            resolve(false);
            return;
          }

          const lines = stdout.split('\n');
          const activeFirewallDetected = lines.some(line => line.trim() === 'State                                 ON');
          resolve(activeFirewallDetected);
        });
      } else if (os.platform() === 'darwin' || os.platform() === 'linux') {
        // On macOS and Linux, check if iptables or pf firewall commands exist
        exec('which iptables pf', (error, stdout) => {
          if (error) {
            console.error('Error:', error);
            resolve(false);
            return;
          }

          resolve(stdout.trim() !== ''); // If either command is available, consider firewall installed
        });
      } else {
        // Unsupported platform
        console.error('Unsupported platform.');
        resolve(false);
      }
    });
  });






  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.

      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
