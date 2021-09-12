import { generateUUID, createEventGenerator } from './index';

describe('generateUUID tests', () => {
    // https://stackoverflow.com/a/13653180
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it('can generate a valid uuid', () => {
        const result = generateUUID();

        expect(uuidRegex.test(result)).toBeTruthy();
    });
});

describe('createEventGenerator tests', () => {
    const fakeAppName = 'fake-app-name';
    const fakeAnalyticsApiUrl = 'http://fake-analytics';
    const fakeStorageKey = 'fake-storage-key';

    let fakeStorage: Pick<Storage, 'getItem' | 'setItem'>;
    let getItemSpy: jest.Mock;
    let setItemSpy: jest.Mock;

    beforeEach(() => {
        getItemSpy = jest.fn();
        setItemSpy = jest.fn();
        fakeStorage = {
            getItem: getItemSpy,
            setItem: setItemSpy,
        };
    });

    it('should check storage at storage key', () => {
        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
        });

        expect(fakeStorage.getItem).toHaveBeenCalledWith(fakeStorageKey);
    });

    it('should set storage at storage key, if not already set', () => {
        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
        });

        expect(fakeStorage.setItem).toHaveBeenCalledWith(fakeStorageKey, expect.any(String));
    });

    it('should not set storage at storage key, if already set', () => {
        getItemSpy.mockReturnValue('fake-stored-analytics-id');

        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
        });

        expect(fakeStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return event generator', () => {
        const result = createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
        });

        expect(result).toBeDefined();
        expect(result.track).toBeDefined();
    });
});

// describe('EventGenerator instance tests', () => {
//     let navigatorSendBeaconSpy: jest.SpyInstance;
//     let windowFetchSpy: jest.SpyInstance;

//     beforeEach(() => {
//         navigatorSendBeaconSpy = jest.spyOn(window.navigator, 'sendBeacon');
//         windowFetchSpy = jest.spyOn(window, 'fetch');
//     });
// });