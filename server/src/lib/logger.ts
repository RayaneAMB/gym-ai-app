import { isProduction } from "../config.js";

type Meta = unknown;

function format(level: string, message: string, meta?: Meta): string {
  const line = `${new Date().toISOString()} ${level} ${message}`;
  if (meta === undefined) return line;
  if (meta instanceof Error) return `${line} :: ${meta.message}`;
  try {
    return `${line} :: ${JSON.stringify(meta)}`;
  } catch {
    return `${line} :: ${String(meta)}`;
  }
}

export const log = {
  info: (message: string, meta?: Meta) => console.log(format("INFO ", message, meta)),
  warn: (message: string, meta?: Meta) => console.warn(format("WARN ", message, meta)),
  error: (message: string, meta?: Meta) => {
    console.error(format("ERROR", message, meta));
    // Stack traces are noise in production logs but essential while developing.
    if (!isProduction && meta instanceof Error && meta.stack) console.error(meta.stack);
  },
  debug: (message: string, meta?: Meta) => {
    if (!isProduction) console.log(format("DEBUG", message, meta));
  },
};
