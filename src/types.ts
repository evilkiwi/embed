import type { DefaultEvents, Emitter } from 'nanoevents';
import type { Ref } from 'vue';

export type Frame = Ref<InstanceType<typeof HTMLIFrameElement>|undefined>;
export type Type = string;
export type Mode = 'host'|'client';

export type AsyncHandler<P = any> = (payload: P) => Promise<unknown>;

export interface Context<Events extends DefaultEvents> {
    mode: Mode;
    post: (type: Type, message?: any) => void;
    send: (type: Type, message?: any) => Promise<unknown>;
    handle: <P = any>(type: Type, callback: AsyncHandler<P>) => () => void;
    destroy: () => void;
    iframe?: Frame;
    events: Emitter<Events>;
    remote?: string;
}

export interface Promises {
    [id: string]: {
        resolve: (value: unknown) => void;
        reject: (e: Error) => void;
        timeout: number;
    };
}

export interface PostObject {
    id: string;
    type: Type;
    payload: any;
}

export interface Options {
    id: string;
    timeout?: number;
    iframe?: Frame;
    remote?: string;
}
