import { get } from 'svelte/store'
import { config } from '$routes/app.store'

export async function saveConfig() {
    const ipc = window.ipc
    const res = await ipc.promise('saveConfig', get(config))
    return res
}

/**
 * Returns a promise that resolves after a specified duration.
 * 
 * @param {number} ms - The duration in milliseconds before the promise is resolved.
 * @returns {Promise} A promise that resolves after the specified duration.
 */
export function timeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}


function leftPad(str, len) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string.');
    }

    return str.slice(0, len);
}


export function isURL(str) {
    // Regular expression pattern for URL validation
    const urlPattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

    return urlPattern.test(str);
}

export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        const context = this;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}