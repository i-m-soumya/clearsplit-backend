// simple logger wrapper; replace with winston or pino as needed

export const info = (...args: any[]) => {
  console.log('[INFO]', ...args);
};

export const warn = (...args: any[]) => {
  console.warn('[WARN]', ...args);
};

export const error = (...args: any[]) => {
  console.error('[ERROR]', ...args);
};
