'use strict';

const {
    contextBridge,
    ipcRenderer
} = require('electron');

const allowedEvents = new Set([
    'orbit:about',
    'orbit:open-settings'
]);

const eventListeners = new Map();

function subscribe(channel, callback) {
    if (!allowedEvents.has(channel)) {
        throw new Error(`Blocked IPC channel: ${channel}`);
    }

    if (typeof callback !== 'function') {
        throw new TypeError('IPC listener must be a function');
    }

    const listener = (_event, ...args) => {
        callback(...args);
    };

    ipcRenderer.on(channel, listener);

    let listeners = eventListeners.get(channel);

    if (!listeners) {
        listeners = new Map();
        eventListeners.set(channel, listeners);
    }

    listeners.set(callback, listener);

    return () => {
        ipcRenderer.removeListener(channel, listener);
        listeners.delete(callback);
    };
}

contextBridge.exposeInMainWorld('orbit', {
    platform: process.platform,

    version: process.versions.electron,

    on(channel, callback) {
        return subscribe(channel, callback);
    },

    removeListener(channel, callback) {
        const listeners = eventListeners.get(channel);

        if (!listeners) {
            return;
        }

        const listener = listeners.get(callback);

        if (!listener) {
            return;
        }

        ipcRenderer.removeListener(channel, listener);
        listeners.delete(callback);
    }
});
