/**
 * @typedef EventGeneratorInfo
 * @type {object}
 * @property {string} appName - The name of the app the events are associated with.
 * @property {string} analyticsApiUrl - The endpoint url of the analytics service/api, where the events will be sent.
 * @property {string} [sessionStorageKey=analytics-session-id] - The name of the session storage key, which is used to store the analytics id for the session.
 */

/**
* @callback Track
* @param {string} type - The event type or name. Anything you want really.
* @param {object} [data=null] - The data associated with the event. null by default, but otherwise an object with properties of your choosing.
* @returns {void}
*/

/**
* @typedef EventGenerator
* @type {object}
* @property {Track} track - Tracking function, pass an event type and event data and it will create an event and send it to your analytics service.
*/

/**
* @typedef EventInfo
* @type {object}
* @property {string} appName - The name of the app the events are associated with.
* @property {string} analyticsId - The analytics id of the current session.
* @property {string} type - The event type or name. Anything you want really.
* @property {object} data - The data associated with the event. null by default, but otherwise an object with properties of your choosing.
*/

/**
* @typedef Event
* @type {object}
* @property {string} appName - The name of the app the events are associated with.
* @property {string} analyticsId - The analytics id of the current session.
* @property {string} type - The event type or name. Anything you want really.
* @property {object} data - The data associated with the event. null by default, but otherwise an object with properties of your choosing.
* @property {string} eventId - A unique identifier and generated tied to the event itself.
* @property {number} version - The version of the event schema being used.
*/

/**
 * Generates a UUID utilizing crypto.getRandomValues underneath. This method was taken from:
 * https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-253.php
 * @returns {string} A string representing a UUID
 */
export function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

/**
 * Creates and returns an event based off of the passed in parameters
 * @param {EventInfo} EventInfo
 * @returns {Event}
 */
function createEvent({
    appName,
    analyticsId,
    type,
    data
}) {
    return {
        appName,
        analyticsId,
        type,
        data,
        eventId: generateUUID(),
        version: 1,
    };
}

/**
 * Creates and returns an event generator object, that can then be used to track events or actions and send them to your analytics service.
 * @param {EventGeneratorInfo} eventGeneratorInfo
 * @returns {EventGenerator}
 */
export function createEventGenerator({
    appName,
    analyticsApiUrl,
    sessionStorageKey = 'analytics-session-id',
}) {
    let analyticsId = window.sessionStorage.getItem(sessionStorageKey);
    if (!analyticsId) {
        analyticsId = generateUUID();
        window.sessionStorage.setItem(sessionStorageKey, analyticsId);
    }

    return {
        track: function (type, data = null) {
            const event = createEvent({
                appName,
                analyticsId,
                type,
                data,
            });
            const eventBlob = new Blob([JSON.stringify(event)], {
                type: 'application/json'
            });

            if (typeof window.navigator.sendBeacon === 'function') {
                window.navigator.sendBeacon(analyticsApiUrl, eventBlob);
            } else {
                console.warn(`sendBeacon(...) is not supported by this browser`);
            }
        },
    };
}

window.SimpleTrack = {
    createEventGenerator,
    generateUUID,
};