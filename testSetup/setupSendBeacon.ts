/**
 * Doesn't seem jsdom supports the sendBeacon API at the moment.
 */
Object.defineProperty(global, 'navigator', {
    value: {
        sendBeacon: () => true,
    },
});