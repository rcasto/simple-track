export interface IEventGeneratorInfo {
    analyticsApiUrl: string;
    appName?: string;
    storageKey?: string;
    storage?: Pick<Storage, 'getItem' | 'setItem'>;
    generateIdentifier?: () => string;
    doNotTrack?: boolean;
}

export interface IEventGenerator {
    track: <T>(type: string, data?: T | null) => void;
    setDoNotTrack: (doNotTrack: boolean) => void;
}

export interface IEventInfo<T> {
    appName: string;
    analyticsId: string;
    type: string;
    data: T;
    userAgent?: string;
}

export interface IEvent<T> extends IEventInfo<T> {
    timeString: string;
    eventId: string;
    version: number;
}