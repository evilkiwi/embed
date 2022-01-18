const errPrefix = '_chEmbedError:';

export const encodeErr = (e: Error) => `${errPrefix}${e.message}`;
export const decodeErr = (str: string) => new Error(str.replace(errPrefix, ''));
export const isErr = (str: string) => typeof str === 'string' && str.indexOf(errPrefix) === 0;
