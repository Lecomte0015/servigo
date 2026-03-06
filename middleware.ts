// Next.js middleware entry point.
// The actual implementation lives in proxy.ts (named proxy.ts for historic reasons).
// Next.js requires this file to be named middleware.ts and export `middleware` + `config`.
export { proxy as middleware, config } from "./proxy";
