const { app, ipcMain, BrowserWindow, Tray, Menu, screen, Notification, shell, clipboard, globalShortcut } = require("electron");
const contextMenu = require('electron-context-menu');
const path = require('path');
const fs = require('fs')
const serve = require("electron-serve");
const { autoUpdater } = require("electron-updater")
// const ws = require("electron-window-state");
require('dotenv').config();
const serveURL = serve({ directory: "." });

const port = process.env.PORT || 3000;
const isDev = !app.isPackaged || (process.env.NODE_ENV == "development");
console.log('isDev:', process.env.NODE_ENV);

let mainWindow;
let isUpdateHandlerRegistered = false
autoUpdater.autoDownload = true;
autoUpdater.autoRunAppAfterInstall = true;
autoUpdater.autoInstallOnAppQuit = true;

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: false,
});

function loadVite(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
        setTimeout(() => { loadVite(port); }, 200);
    });
}

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay()

    const { width, height } = primaryDisplay.workAreaSize
    console.log(width, height);

    mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: width,
        height: height,
        titleBarStyle: 'hidden',
        // autoHideMenuBar: true,
        backgroundColor: '#CC000000',
        resizable: false,
        transparent: true,
        frame: false,
        skipTaskbar: true,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            devTools: true,
            enableRemoteModule: true,
            contextIsolation: true,
            nodeIntegration: true,
            spellcheck: false,
            preload: path.join(__dirname, 'preload.cjs'),
        }
    });
    // windowState.manage(mainWindow);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });
    mainWindow.on('close', () => {
        // windowState.saveState(mainWindow);
    });
    return mainWindow;
}

contextMenu({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
});

async function createMainWindow() {
    mainWindow = createWindow();
    if (!isDev) {
        mainWindow.setAlwaysOnTop(true)
    }
    mainWindow.once('close', () => {
        mainWindow = null;
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    if (isDev) loadVite(port);
    else serveURL(mainWindow);

    mainWindowEventListener()
    mainProcessEventListener()
}

app.commandLine.appendSwitch('wm-window-animations-disabled');

app.whenReady().then(() => {
    mainWindow.minimize()
    const iconPath = path.join(app.getAppPath(), 'icon.ico');
    const tray = new Tray(iconPath)
    const ctxMenu = Menu.buildFromTemplate([
        { label: 'Open', click() { mainWindow.show() } },
        { type: 'separator' },
        { label: 'Exit', role: 'close', click() { app.quit() } },
    ])
    tray.on('double-click', () => {
        mainWindow.hide()
    })
    tray.setContextMenu(ctxMenu)

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W', // Use 'CmdOrCtrl+W' to support both macOS and other platforms
                    beforeItemExecute: (menuItem, browserWindow, event) => {
                        event.preventDefault();
                    },
                },
                {
                    label: 'Refresh',
                    accelerator: 'CmdOrCtrl+R',
                    click: (menuItem, browserWindow, event) => {
                        browserWindow.reload(); // This line will refresh the current window.
                    },
                },
                {
                    label: 'Dev Tools',
                    accelerator: 'F12',
                    click: (menuItem, browserWindow, event) => {
                        browserWindow.webContents.openDevTools();
                    },
                }
            ],
        },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu)

    globalShortcut.register('Shift+CommandOrControl+D', () => {
        const isVisible = mainWindow.isVisible()
        if (isVisible) {
            mainWindow.webContents.send('minimize')
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })
})

const gotSingleLock = app.requestSingleInstanceLock();
if (!gotSingleLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.once("ready", () => {
        createMainWindow()
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });


    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        } else {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.on('before-quit', () => {
        // mainWindow = null;
    })
}


function mainProcessEventListener() {
    ipcMain.on('minimize', (e) => {
        mainWindow.minimize()
    })

    ipcMain.on('toggleMaximize', (e, toMaximize) => {
        if (toMaximize) {
            mainWindow.maximize()
        } else {
            mainWindow.restore()
        }
    })

    ipcMain.on('hide', () => {
        mainWindow.webContents.send('minimize')
        mainWindow.hide()
    })

    ipcMain.on('notify', (e, message) => {
        if (!mainWindow.isFocused()) {
            //flash frame and show notification    
            mainWindow.flashFrame(true)

            const iconPath = path.join(app.getAppPath(), 'icon.ico');
            const notification = new Notification({
                title: "New Message",
                body: message,
                icon: iconPath
            })

            notification.on('click', () => {
                mainWindow.flashFrame(false)
                mainWindow.focus()
            })

            notification.show()
        }
    })

    ipcMain.on('flash', (e) => {
        if (!mainWindow.isFocused()) {
            mainWindow.flashFrame(true)
        }
    })

    ipcMain.on('openInBrowser', (e, url) => {
        shell.openExternal(url)
    })


    function getConfigPath() {
        const appData = app.getPath('userData');
        const appPath = path.join(appData, 'app');
        return path.join(appPath, isDev ? 'curtain.config.json' : 'config.json');
    }

    async function ensureAppPathExists() {
        const appData = app.getPath('userData');
        const appPath = path.join(appData, 'app');
        const configPath = getConfigPath();

        try {
            await fs.promises.access(configPath, fs.constants.F_OK);
        } catch (e) {
            if (e.code === 'ENOENT') {
                await fs.promises.mkdir(appPath, { recursive: true });
                console.log('make dir');
            } else {
                console.log(e);
            }
        }
    }

    async function saveConfig(path, config) {
        try {
            fs.writeFileSync(path, JSON.stringify(config, null, 2));
            // console.log('Config saved');
        } catch (error) {
            console.log('config save error', error);
        }
    }

    ipcMain.handle('init', async () => {
        const configPath = getConfigPath();

        await ensureAppPathExists();
        checkUpdate()
        return getConfigFile(configPath);
        async function getConfigFile(path) {
            let cfg;
            try {
                const configData = fs.readFileSync(path, 'utf-8');
                cfg = JSON.parse(configData);
            } catch (e) {
                cfg = {};
                await saveConfig(path, cfg); // Create a new config file if it doesn't exist
            }

            return cfg;
        }
    });

    ipcMain.handle('saveConfig', async (e, config) => {
        const configPath = getConfigPath();

        await ensureAppPathExists();
        await saveConfig(configPath, config);
        return 'OK';
    });



    ipcMain.on('openPath', (e, filePath) => {
        console.log(filePath);
        try {
            shell.openPath(filePath)
        } catch {
            console.log('error opening file');
        }
    })

    ipcMain.on('getClipboard', (e) => {
        const formats = clipboard.availableFormats()
        console.log(formats)
        console.log(clipboard.readHTML())
    })

}

function mainWindowEventListener() {
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('focus', () => {
        if (mainWindow) {
            mainWindow.flashFrame(false)
            mainWindow.webContents.send('onFocus')
        }
    })

    mainWindow.on('blur', () => {
        mainWindow.webContents.send('onBlur')
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' };
    });

}


function checkUpdate() {
    console.log('?');
    mainWindow.webContents.send('info', { version: app.getVersion(), isDev: isDev })


    autoUpdater.checkForUpdates()
    if (!isUpdateHandlerRegistered) {
        autoUpdater.on('update-available', (info) => {
            mainWindow.webContents.send('updateAvailable', info.version)
        });

        // autoUpdater.downloadUpdate();

        ipcMain.on('restartApp', (e) => {
            autoUpdater.quitAndInstall();
        })

        autoUpdater.on('update-downloaded', (info) => {
            mainWindow.webContents.send('updateDownloaded', info)
        });

        autoUpdater.on('error', (error) => {
            mainWindow.webContents.send('updateError', error)
        });

        autoUpdater.on('update-not-available', (info) => {
            info.message = 'no updates'
            mainWindow.webContents.send('info', info)
        });

        isUpdateHandlerRegistered = true
    }
}