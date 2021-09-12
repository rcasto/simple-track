// import { getCLS, getFID, getLCP } from 'web-vitals';

import { IEvent, IEventGenerator, IEventGeneratorInfo, IEventInfo } from "./schema";

/**
 * Generates a UUID utilizing crypto.getRandomValues underneath. This method was taken from:
 * - https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-253.php
 * - https://stackoverflow.com/a/2117523
 * 
 * There is a UUID standard proposal here:
 * - https://github.com/WICG/uuid
 * @returns {string} A string representing a UUID
 */
export function generateUUID(): string {
    return ('' + [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
        (c as unknown as number ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c as unknown as number / 4)))).toString(16)
    );
}

/**
 * Creates and returns an event based off of the passed in parameters
 * @param {IEventInfo} EventInfo
 * @returns {IEvent}
 */
function createEvent<T>({
    appName,
    analyticsId,
    type,
    data
}: IEventInfo<T>): IEvent<T> {
    return {
        appName,
        analyticsId,
        type,
        data,
        timeString: (new Date()).toISOString(),
        eventId: generateUUID(),
        version: 1,
    };
}

/**
 * Creates and returns an event generator object, that can then be used to track events or actions and send them to your analytics service.
 * @param {IEventGeneratorInfo} eventGeneratorInfo
 * @returns {IEventGenerator}
 */
export function createEventGenerator({
    appName,
    analyticsApiUrl,
    storageKey = 'analytics-session-id',
    storage = window.sessionStorage,
    // shouldReportWebVitals = true,
}: IEventGeneratorInfo): IEventGenerator {
    let analyticsId: string = storage.getItem(storageKey) || '';
    if (!analyticsId) {
        analyticsId = generateUUID();
        storage.setItem(storageKey, analyticsId);
    }

    /**
     * If web-vitals dependency 
     */
    // if (window.webVitals && shouldReportWebVitals) {

    // }

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
                // https://w3c.github.io/beacon/#introduction, explains setting keep-alive to true for Fetch API fallback
                // https://w3c.github.io/beacon/#sec-processing-model
                fetch(analyticsApiUrl, {
                    method: 'POST',
                    body: analyticsApiUrl,
                    keepalive: true,
                });
            }
        },
    };
}