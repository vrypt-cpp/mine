const ts = () => new Date().toISOString().split('T')[1].split('.')[0];
export const log = (tag, msg) => console.log(`[${ts()}][${tag}] ${msg}`);
export const logError = (tag, err) => console.error(`[${ts()}][${tag}][ERR] ${err?.message || err}`);
