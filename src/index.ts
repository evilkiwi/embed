import type { DefaultEvents, EventsMap } from 'nanoevents';
import { createNanoEvents } from 'nanoevents';
import type { WatchStopHandle } from 'vue';
import { watch } from 'vue';
import { capitalize, generateId, timestamp } from './helpers';
import { encodeErr, decodeErr, isErr } from './errors';
import type { AsyncHandler, Options, PostObject, Mode, Promises, Context, Type } from './types';

const register: Record<string, Context<DefaultEvents>> = {};
const handlers: Record<string, Record<string, AsyncHandler>> = {};
const promises: Promises = {};

const processMessage = async (e: MessageEvent<PostObject>) => {
    if (
        !e.data ||
        !e.data.id ||
        !register[e.data.id] ||

        /**
         * Check the origin, if one was supplied.
         * Sandboxed iFrames without the `allow-same-origin` permission
         * will return `"null"` as an origin, so in that case we cannot
         * enforce it.
         */
        (
            (register[e.data.id].remote ?? '*') !== '*' &&
            e.origin !== 'null' &&
            !e.origin.startsWith(register[e.data.id].remote as string)
        ) ||

        // If this is the Host, ensure the source is the iFrame Element.
        (
            register[e.data.id].mode === 'host' &&
            e.source !== register[e.data.id].iframe?.value?.contentWindow
        )
    ) {
        return;
    }

    const { id, type, payload } = e.data;
    const { events, post, logDebug } = register[id];

    if (type === '_async') {
        // Process incoming async executions.
        let response: Error|unknown;

        try {
            if (!handlers[id] || !handlers[id][payload.type]) {
                throw new Error(`No Handler for Event "${payload.type}"`);
            }

            logDebug('debug', 'Processing async request', payload);

            response = await handlers[id][payload.type](payload.message);
        } catch (e) {
            logDebug('error', 'Sending error response', payload, e);
            response = encodeErr(e);
        }

        post('_asyncResponse', {
            id: payload.id,
            response,
        });
    } else if (type === '_asyncResponse' && promises[id] && promises[id][payload.id]) {
        /**
         * Process the response from async executions.
         * This just means taking the response and resolving/rejecting
         * the stored promise.
         */
        const promise = promises[id][payload.id];

        window.clearTimeout(promise.timeout);

        logDebug('debug', `#${payload.id} Processing incoming async response`, payload);

        if (isErr(payload.response)) {
            promise.reject(decodeErr(payload.response));
        } else {
            promise.resolve(payload.response);
        }

        delete promises[id][payload.id];
    } else {
        // Otherwise it's a regular event, so emit it to any listeners.
        let message = payload;

        if (isErr(message)) {
            message = decodeErr(message);
        }

        logDebug('debug', 'Emitting sync event', type, message);

        events.emit(type, message);
    }
};

export function useEmbed<Events extends EventsMap>(mode: Mode, options: Options) {
    if (register[options.id]) {
        return register[options.id] as Context<Events>;
    }

    const events = createNanoEvents<Events>();
    const isHost = mode === 'host';
    let target: Window|null = window.parent;
    let watcher: WatchStopHandle|undefined;

    const logDebug = (type: 'debug'|'error', ...args: any[]) => {
        if (options.debug !== true) {
            return;
        }

        console[type](`[@casthub/embed/${options.id}]`, ...args, `@ ${timestamp()}`);
    };

    const post = (type: Type, message?: any) => {
        if (!target) {
            throw new Error('Target Window is unloaded');
        }

        let remote = '*';

        try {
            const origin = target.origin;

            if (origin && options.remote) {
                remote = options.remote;
            }
        } catch (e) {
            // Do nothing.
        }

        if (message instanceof Error) {
            message = encodeErr(message);
        }

        logDebug('debug', 'Sending synchronous event', type, message);

        target.postMessage({
            id: options.id,
            type,
            payload: message ?? {},
        }, remote);
    };

    const send = async <R = any>(type: Type, message?: any): Promise<R> => {
        return new Promise((resolve, reject) => {
            const id = generateId();

            if (!promises[options.id]) {
                promises[options.id] = {};
            }

            promises[options.id][id] = {
                resolve: (response: any) => {
                    logDebug('debug', `#${id} Received response`, response);
                    resolve(response);
                },
                reject: (err: Error) => {
                    logDebug('error', `#${id} Received error`, err);
                    reject(err);
                },
                timeout: window.setTimeout(() => {
                    logDebug('error', `#${id} Request timed out`);
                    reject(new Error('Timed out'));
                    delete promises[options.id][id];
                }, options.timeout ?? 15000),
            };

            logDebug('debug', `#${id} Requesting async payload`, type, message);

            post('_async', {
                id,
                type,
                message: message ?? {},
            });
        });
    };

    const handle = <P = any>(type: Type, callback: AsyncHandler<P>) => {
        if (!handlers[options.id]) {
            handlers[options.id] = {};
        }

        handlers[options.id][type] = callback;

        return () => {
            logDebug('debug', `Deregistering Handler for event "${type}"`);
            delete handlers[options.id][type];
        };
    };

    if (isHost) {
        if (!options.iframe) {
            throw new Error('"host" mode requires an iFrame reference');
        }

        watcher = watch(options.iframe, frame => {
            if (frame?.contentWindow) {
                logDebug('debug', 'Host found iFrame Element - using it');
                target = frame.contentWindow;
            }
        }, { immediate: true });
    }

    const destroy = () => {
        logDebug('debug', `Destroying ${capitalize(mode)}`);

        if (watcher) {
            watcher();
        }

        events.events = {};
        delete register[options.id];
        delete promises[options.id];
        delete handlers[options.id];

        if (!Object.keys(register).length) {
            window.removeEventListener('message', processMessage);
        }
    };

    const context: Context<Events> = {
        mode,
        post,
        send,
        handle,
        destroy,
        events,
        iframe: options.iframe,
        remote: options.remote,
        logDebug,
    };

    register[options.id] = context;

    if (Object.keys(register).length === 1) {
        window.addEventListener('message', processMessage);
    }

    logDebug('debug', `${capitalize(mode)} mode IPC registed`);

    return context as Context<Events>;
}

export * from './types';
