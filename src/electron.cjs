const { app, ipcMain, BrowserWindow, Tray, Menu, screen, Notification, shell, clipboard, globalShortcut } = require("electron");
const contextMenu = require('electron-context-menu');
const path = require('path');
const fs = require('fs')
const serve = require("electron-serve");
const fontList = require('font-list')
const { autoUpdater } = require("electron-updater")
// const ws = require("electron-window-state");
require('dotenv').config();
const serveURL = serve({ directory: "." });

const port = process.env.PORT || 3000;
const isDev = !app.isPackaged || (process.env.NODE_ENV == "development");
let blockGlobalShortcut = false;
let overlayShortcut = 'Shift+CommandOrControl+D'
let skipTaskbar = true

let mainWindow;
let isUpdateHandlerRegistered = false
autoUpdater.autoDownload = true;
autoUpdater.autoRunAppAfterInstall = true;
autoUpdater.autoInstallOnAppQuit = true;
initConfig()

function initConfig() {
    try {
        const cfg = getConfigData()
        if (cfg.settings.app.showOnTaskbar !== undefined) {
            skipTaskbar = !cfg.settings.app.showOnTaskbar
        }
    } catch (e) {
        // 
    }
    console.log('skipTaskBar', skipTaskbar);

}

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
        resizable: false,
        transparent: true,
        frame: false,
        skipTaskbar: skipTaskbar,
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

    mainWindow.setBounds(primaryDisplay.bounds)

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

app.whenReady().then(async () => {
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


    try {
        const cfg = getConfigData()
        const getKbs = cfg.settings.app.kbs_overlay
        if (getKbs) {
            overlayShortcut = getKbs
        }
    } catch (e) {
        console.log("config doesn't exist, use default key ctrl+shift+d");
    }

    registerOverlayShortcut()
    setRunOnStart()

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

    //ensure config folder exist otherwise create the folder
    async function ensureAppPathExists() {
        const appData = app.getPath('userData');
        const appPath = path.join(appData, 'app');
        const configPath = getConfigPath();

        try {
            await fs.promises.access(configPath, fs.constants.F_OK);
        } catch (e) {
            if (e.code === 'ENOENT') {
                await fs.promises.mkdir(appPath, { recursive: true });
                fs.writeFileSync(configPath, JSON.stringify({}))
                console.log('make dir', configPath);
            } else {
                console.log(e);
            }
        }
    }

    ipcMain.handle('init', async () => {
        await ensureAppPathExists();
        checkUpdate()
        return getConfigData();
    });

    ipcMain.handle('saveConfig', async (e, config) => {
        await saveConfig(config);
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

    ipcMain.on('blockGlobalShortcut', (e, bool) => {
        if (bool == undefined) {
            bool = true
        }
        blockGlobalShortcut = bool
        if (bool) {//true
            deregister()
        } else {//false
            registerEverything()
        }
    })

    ipcMain.on('registerOverlayShortcut', (e, keys) => {
        registerOverlayShortcut(keys)
        const cfg = getConfigData()
        addOrUpdateJSON(cfg, 'settings.app.kbs_overlay', keys)
        saveConfig(cfg)
    })

    ipcMain.on('relaunch', () => {
        if (isDev) {
            return console.log('unable to trigger restart in dev');
        }
        app.relaunch();
        app.exit();
    })

    ipcMain.on("toggleRunOnStartup", () => {
        setRunOnStart()
    })

    ipcMain.handle('getFonts', () => {
        return new Promise(resolve => {
            fontList.getFonts()
                .then(fonts => {
                    resolve(fonts)
                })
                .catch(err => {
                    console.log(err)
                })
        })
    })

    ipcMain.on('moveDisplay', () => {
        const displays = screen.getAllDisplays()
        console.log(displays);
        for (const display of displays) {
            const { x, y, width, height } = display.bounds;
            if (x !== 0 && y !== 0) {
                console.log(x, y);
                mainWindow.setBounds(display.bounds)
            }
        }
    })



}

function setRunOnStart() {
    if (!isDev) return

    let runOnStartUp = false
    try {
        const cfg = getConfigData()
        runOnStartUp = cfg.settings?.app?.runOnStartUp ?? false
    } catch (e) {
        console.log('runOnStart Error:', e.message);
    }

    app.setLoginItemSettings({
        openAtLogin: runOnStartUp
    })
}

function getConfigData() {
    try {
        const configPath = getConfigPath();
        const configData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configData) || {};
    } catch (error) {
        // Handle errors, such as file not found or invalid JSON format
        console.error('Error while reading or parsing the config file:', error.message);
        return {};
    }
}

async function saveConfig(cfg) {
    const configPath = getConfigPath()
    try {
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
    } catch (error) {
        console.log('config save error', error);
    }
}

function getConfigPath() {
    const appData = app.getPath('userData');
    const appPath = path.join(appData, 'app');
    return path.join(appPath, isDev ? 'curtain.config.json' : 'config.json');
}

function deregister() {
    // globalShortcut.unregister('')
    globalShortcut.unregisterAll();
}

function registerEverything() {
    registerOverlayShortcut(overlayShortcut)
}

function registerOverlayShortcut(keys) {
    blockGlobalShortcut = false
    if (keys) {
        overlayShortcut = keys
    }
    globalShortcut.register(overlayShortcut, () => {
        if (blockGlobalShortcut) return
        const isVisible = mainWindow.isVisible()
        if (isVisible) {
            mainWindow.webContents.send('minimize')
            mainWindow.hide()
        } else {
            mainWindow.show()
            const primaryDisplay = screen.getPrimaryDisplay();
            mainWindow.setBounds(primaryDisplay.bounds);
        }
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

/**
 * Recursively adds a property to a JSON object if it doesn't already exist.
 * If the property path already exists, the value will be overridden with the provided defaultValue.
 *
 * @param {object} obj - The JSON object to which the property will be added.
 * @param {string} propertyPath - The dot-separated path of the property to add.
 * @param {*} defaultValue - The value to be assigned to the property if it doesn't exist or to override the existing value.
 * @returns {void}
 *
 * @example
 * const cfg = {};
 * addOrUpdateJSON(cfg, 'settings.app.kbs_overlay', 'ctrl+k');
 * console.log(cfg); // Output: { settings: { app: { kbs_overlay: 'ctrl+k' } } }
 */
function addOrUpdateJSON(obj, propertyPath, defaultValue) {
    const json = structuredClone(obj);
    const pathArr = propertyPath.split('.');
    let currentObject = json;

    for (const property of pathArr) {
        if (!currentObject[property]) {
            if (pathArr.indexOf(property) === pathArr.length - 1) {
                currentObject[property] = defaultValue;
            } else {
                currentObject[property] = {};
            }
        }
        currentObject = currentObject[property];
    }
    return json;
}