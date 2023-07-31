import { get } from 'svelte/store'
import { config } from '$routes/app.store'
import chroma from "chroma-js"


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


export function leftPad(str, len) {
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
export function addOrUpdateJSON(obj, propertyPath, defaultValue) {
    const json = structuredClone(obj);
    const pathArr = propertyPath.split('.');
    let currentObject = json;

    for (const property of pathArr) {
        if (!currentObject[property]) { //if does not exist
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

export function updateCSSVariable(variableName, newValue) {
    document.documentElement.style.setProperty(variableName, newValue);
}

export function getCSSVariableValue(variableName) {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(variableName).trim();
}

/**
 * Sets the value of a nested property in a JSON object.
 *
 * @param {Object} obj - The JSON object to set the nested property in.
 * @param {string} keysInString - A dot-separated string representing the path of keys for the nested structure.
 * @param {*} value - The value to assign to the final property in the nested structure.
 *
 * @example
 * const json = {};
 * setNestedProperty(json, 'parent.children', 2);
 * // The JSON object will be modified to: { "parent": { "children": 2 } }
 */
export function setNestedProperty(obj, keysInString, value) {
    const keys = keysInString.split('.')
    const lastKeyIndex = keys.length - 1;
    for (let i = 0; i < lastKeyIndex; i++) {
        const key = keys[i];
        obj = obj[key] = obj[key] || {};
    }
    obj[keys[lastKeyIndex]] = value;
}

export function generateShades(hexColor, name) {
    const baseBlendRatio = 0; //0.2
    const shades = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const mainShade = 500;

    function darkenValue(shade) {
        return (shade - mainShade) / 100 / 2;
    }

    function calculateShadeColor(baseColor, primaryColor, blendRatio, shade) {
        const color = chroma.mix(baseColor, primaryColor, blendRatio, 'lab');
        return chroma(color).darken(darkenValue(shade)).hex();
    }

    function generateColorResult(primaryColor) {
        return {
            shades: shades.reduce((acc, shade) => {
                acc[`--${name}-${shade}`] = calculateShadeColor(primaryColor, primaryColor, baseBlendRatio, shade);
                return acc;
            }, {}),
        };
    }

    function getCSS(obj) {
        const css = []
        for (const [name, value] of Object.entries(obj.shades)) {
            css.push(`${name}: ${value.replace(/"/g, "")};`)
        }


        return css.join('\n')
    }

    const result_shades = generateColorResult(hexColor)
    const result = {
        ...result_shades,
        css: getCSS(result_shades)
    }

    return result;
}

export function rgbToHex(r, g, b) {
    // Make sure the input values are within the valid range (0 to 255)
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Convert each component to its hexadecimal representation and combine them
    const hexColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    return hexColor;
}

export function hexToRgb(hex) {
    // Remove the "#" symbol if it exists
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    // Extract the red, green, and blue components
    const rHex = hex.substring(0, 2);
    const gHex = hex.substring(2, 4);
    const bHex = hex.substring(4, 6);

    // Convert the hexadecimal components to decimal values
    const r = parseInt(rHex, 16);
    const g = parseInt(gHex, 16);
    const b = parseInt(bHex, 16);

    // Return an object with the RGB components
    return { r, g, b };
}

export function setCSSVariableShades(hex) {
    updateCSSVariable("--accent", hex);
    const result = generateShades(hex, "accent");
    for (const [key, value] of Object.entries(result.shades)) {
        updateCSSVariable(key, value);
    }
}

export function generateID(length) {
    if (!length) {
        length = 8;
    }
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters.charAt(randomIndex);
    }

    return id;
}
