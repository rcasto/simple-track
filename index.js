import { generateUUID } from './util';

function createEvent({
    appName,
    analyticsId,
    type,
    data
}) {
    return {
        type,
        analyticsId,
        eventId: generateUUID(),
        appName,
        data,
        version: 1,
    };
}

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