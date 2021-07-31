/**
 * Random ID generator for async IPC messages.
 * TODO: Should this be more intelligent? Given the range,
 * I can't imagine short-form async messages would overlap.
 */
export const generateId = () => Math.floor(Math.random() * 1000000) + 1;

// Timestamp generator for debug messages.
export const pad = (value: number) => `${value <= 9 ? '0' : ''}${value}`;
export const timestamp = () => {
    const date = new Date();
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds()}`;
};

// Generic helpers.
export const capitalize = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
