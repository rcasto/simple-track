import { generateUUID, createEventGenerator } from './index';
import { IEventGenerator } from './schema';

const fakeAppName = 'fake-app-name';
const fakeAnalyticsApiUrl = 'http://fake-analytics';
const fakeStorageKey = 'fake-storage-key';
const fakeAnalyticsId = 'fake-stored-analytics-id';
const fakeEventType = 'test-event';

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

describe('generateUUID tests', () => {
    // https://stackoverflow.com/a/13653180
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it('can generate a valid uuid', () => {
        const result = generateUUID();

        expect(uuidRegex.test(result)).toBeTruthy();
    });
});

describe('createEventGenerator tests', () => {
    it('should check storage at storage key', () => {
        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
            generateIdentifier: generateUUID,
        });

        expect(fakeStorage.getItem).toHaveBeenCalledWith(fakeStorageKey);
    });

    it('should set storage at storage key, if not already set', () => {
        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
            generateIdentifier: generateUUID,
        });

        expect(fakeStorage.setItem).toHaveBeenCalledWith(fakeStorageKey, expect.any(String));
    });

    it('should not set storage at storage key, if already set', () => {
        getItemSpy.mockReturnValue(fakeAnalyticsId);

        createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
            generateIdentifier: generateUUID,
        });

        expect(fakeStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return event generator', () => {
        const result = createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
            generateIdentifier: generateUUID,
        });

        expect(result).toBeDefined();
        expect(result.track).toBeDefined();
    });
});

describe('EventGenerator instance tests', () => {
    let eventGenerator: IEventGenerator;

    let navigatorSendBeaconSpy: jest.SpyInstance;

    beforeEach(() => {
        getItemSpy.mockReturnValue(fakeAnalyticsId);

        navigatorSendBeaconSpy = jest.spyOn(global.navigator, 'sendBeacon');

        eventGenerator = createEventGenerator({
            appName: fakeAppName,
            analyticsApiUrl: fakeAnalyticsApiUrl,
            storageKey: fakeStorageKey,
            storage: fakeStorage,
            generateIdentifier: generateUUID,
        });
    });

    it('can attempt to use sendBeacon by default, if supported', () => {
        eventGenerator.track(fakeEventType);

        expect(navigatorSendBeaconSpy).toHaveBeenCalledWith(fakeAnalyticsApiUrl, expect.any(Blob));
    });

    it('can fallback to using fetch if sendBeacon is not supported', () => {
        // adjust global
        const oldSendBeacon = global.navigator.sendBeacon;
        global.navigator.sendBeacon = null;

        eventGenerator.track(fakeEventType);

        expect(navigatorSendBeaconSpy).not.toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(fakeAnalyticsApiUrl, {
            method: 'POST',
            body: expect.any(Blob),
            keepalive: true,
        });

        // restore global
        global.navigator.sendBeacon = oldSendBeacon;
    });

    it('can send valid event blob - no data/null', async () => {
        const expectedEventBlob: Blob = new Blob([JSON.stringify({
            appName: fakeAppName,
            analyticsId: fakeAnalyticsId,
            type: fakeEventType,
            data: null,
            timeString: expect.any(String),
            eventId: expect.any(String),
            version: 1,
        })], {
            type: 'application/json',
        });

        eventGenerator.track(fakeEventType);

        const eventBlob: Blob = navigatorSendBeaconSpy.mock.calls[0][1];

        expect(eventBlob.type).toEqual('application/json');
        expect(eventBlob).toEqual(expectedEventBlob);
    });

    it('can send valid event blob - has custom data', async () => {
        const expectedEventBlob: Blob = new Blob([JSON.stringify({
            appName: fakeAppName,
            analyticsId: fakeAnalyticsId,
            type: fakeEventType,
            data: {
                foo: 'bar',
            },
            timeString: expect.any(String),
            eventId: expect.any(String),
            version: 1,
        })], {
            type: 'application/json',
        });

        eventGenerator.track(fakeEventType, {
            foo: 'bar',
        });

        const eventBlob: Blob = navigatorSendBeaconSpy.mock.calls[0][1];

        expect(eventBlob.type).toEqual('application/json');
        expect(eventBlob).toEqual(expectedEventBlob);
    });
});