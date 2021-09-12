export interface IEventGeneratorInfo {
    appName: string;
    analyticsApiUrl: string;
    storageKey: string;
    storage: Pick<Storage, 'getItem' | 'setItem'>;
    generateIdentifier: () => string;
}

export interface IEventGenerator {
    track: <T>(type: string, data?: T | null) => void;
}

export interface IEventInfo<T> {
    appName: string;
    analyticsId: string;
    type: string;
    data: T;
}

export interface IEvent<T> extends IEventInfo<T> {
    timeString: string;
    eventId: string;
    version: number;
}