/**
 * Random ID generator for async IPC messages.
 * TODO: Should this be more intelligent? Given the range,
 * I can't imagine short-form async messages would overlap.
 */
export function generateId() {
  return Math.floor(Math.random() * 1000000) + 1;
}
