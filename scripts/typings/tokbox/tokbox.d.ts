declare namespace tok {
    export interface OTError {
        code: number;
        message: string;
    }

    export interface OTStream {
        connection: OTConnection;
        creationTime: number;
        frameRate: number;
        hasAudio: boolean;
        hasVideo: boolean;
        name: string;
        streamId: string;
        videoDimensions: Object;
        videoType: string;
    }

    export interface OTPublisher extends EventDispatcher {
        accessAllowed: boolean;
        element: Element;
        id: string;
        streamId: string;
        stream: OTStream;
        session: OTSession;
        publishAudio: (Value: boolean) => void;
        cycleVideo: () => JQueryPromise<any>;
        publishVideo: (Value: boolean) => void;
        //TODO: Add more from https://tokbox.com/developer/sdks/js/reference/Publisher.html
    }

    export interface OTSubscriber extends EventDispatcher {
        getImgData: () => string;
        setAudioVolume: (level: number) => void;
        getAudioVolume: () => any;
        subscribeToAudio: (pValue: boolean) => void;
        element: Element;
        id: string;
        stream: OTStream;
    }

    export interface Event {
        cancelable: boolean;
        target: Object;
        type: string;
        isDefaultPrevented: () => boolean;
        preventDefault: () => void;
    }

    export interface StreamPropertyChangedEvent {
        changedProperty: string;
        newValue: Object;
        oldValue: Object;
        stream: OTStream;
    }

    export interface EventDispatcher {
        on: (type: string, handler: Function, context?: Object) => EventDispatcher;
        off: (type: string, handler: Function, context?: Object) => EventDispatcher;
        once: (type: string, handler: Function, context?: Object) => Object;
    }

    export interface OTConnection {
        connectionId: any;
        creationTime: number;
        data: string;
        id: string;
    }

    export interface OTSession extends EventDispatcher {
        disconnect: () => void;
        subscribe: (stream: OTStream, type: string, options: any, completionHandler: (error: OTError) => void) =>
        OTSubscriber;
        connect: (subToken: string, completionHandler: (error: OTError) => void) => void;
        publish: (publisher: OTPublisher, completionHandler: (error: OTError) => void) => void;
        connection: OTConnection;
        signal: (message: { type: string, data: string }, completionHandler: (error: OTError) => void) => void;
        capabilities: OTCapabilities;
        sessionId: string;
        forceDisconnect: (connection: OTConnection, completionHandler: (error: OTError) => void) => void;
        forceUnpublish: (stream: OTStream, completionHandler: (error: OTError) => void) => void;
    }
    export interface OTCapabilities
    {
        forceDisconnect: number;
        forceUnpublish: number;
        publish: number;
        subscribe: number;
    }
    export interface OT {
        initSession: (apiKey: string, sessionId: string) => OTSession;
        initPublisher: (targetElement: Object, properties?: Object, completionHandler?: Function) => OTPublisher;
        checkSystemRequirements: () => boolean;
        upgradeSystemRequirements(): () => void;
        getDevices: (callback: Function) => void;

    }
    export interface OTSignalEvent {
        type: string;
        data: string;
        from: OTConnection;
    }
}