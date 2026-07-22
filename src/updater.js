'use strict';

const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let updateState = 'idle';

function setupAutoUpdater() {
    if (!app.isPackaged) {
        console.log('[Orbit] Automatic updates disabled in development.');

        return;
    }

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        updateState = 'checking';

        console.log('[Orbit] Checking for updates.');
    });

    autoUpdater.on('update-available', async (info) => {
        updateState = 'available';

        console.log(
            `[Orbit] Update available: ${info.version}`
        );

        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Orbit Browser Update',
            message: `Orbit Browser ${info.version} is available.`,
            detail: 'Would you like to download the update now?',
            buttons: [
                'Download Update',
                'Later'
            ],
            defaultId: 0,
            cancelId: 1
        });

        if (result.response === 0) {
            updateState = 'downloading';

            try {
                await autoUpdater.downloadUpdate();
            } catch (error) {
                updateState = 'error';

                console.error(
                    '[Orbit] Update download failed:',
                    error
                );
            }
        }
    });

    autoUpdater.on('update-not-available', () => {
        updateState = 'current';

        console.log(
            '[Orbit] Orbit Browser is up to date.'
        );
    });

    autoUpdater.on('download-progress', (progress) => {
        updateState = 'downloading';

        console.log(
            `[Orbit] Downloading update: ${Math.round(progress.percent)}%`
        );
    });

    autoUpdater.on('update-downloaded', async () => {
        updateState = 'ready';

        console.log(
            '[Orbit] Update downloaded and ready to install.'
        );

        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Restart Orbit Browser',
            message: 'The Orbit Browser update is ready.',
            detail: 'Restart Orbit Browser now to finish installing the update.',
            buttons: [
                'Restart Now',
                'Later'
            ],
            defaultId: 0,
            cancelId: 1
        });

        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });

    autoUpdater.on('error', (error) => {
        updateState = 'error';

        console.error(
            '[Orbit] Automatic update error:',
            error
        );
    });

    autoUpdater.checkForUpdates().catch((error) => {
        updateState = 'error';

        console.error(
            '[Orbit] Update check failed:',
            error
        );
    });
}

function getUpdateState() {
    return updateState;
}

module.exports = {
    setupAutoUpdater,
    getUpdateState
};
