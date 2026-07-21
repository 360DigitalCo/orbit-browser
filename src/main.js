'use strict';

const {
    app,
    BrowserWindow,
    Menu,
    shell
} = require('electron');
const path = require('node:path');

let mainWindow = null;

const isDevelopment = !app.isPackaged;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        title: 'Orbit Browser',
        backgroundColor: '#0f1115',
        show: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, 'ui', 'index.html')
    );

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
        }

        return {
            action: 'deny'
        };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (isDevelopment) {
        mainWindow.webContents.openDevTools({
            mode: 'detach'
        });
    }
}

function createApplicationMenu() {
    const template = [
        {
            label: 'Orbit',
            submenu: [
                {
                    label: 'About Orbit Browser',
                    click: () => {
                        mainWindow?.webContents.send('orbit:about');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow?.webContents.send('orbit:open-settings');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        createMainWindow();
                    }
                },
                {
                    label: 'New Private Window',
                    accelerator: 'Ctrl+Shift+N',
                    enabled: false
                },
                {
                    type: 'separator'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                },
                {
                    role: 'forceReload'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                },
                {
                    role: 'toggleDevTools'
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'zoom'
                },
                {
                    role: 'close'
                }
            ]
        }
    ];

    Menu.setApplicationMenu(
        Menu.buildFromTemplate(template)
    );
}

app.whenReady().then(() => {
    createMainWindow();
    createApplicationMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
