declare module "express-http-proxy" {
  import { RequestHandler } from "express";

  interface ProxyOptions {
    proxyReqPathResolver?: (req: import("express").Request) => string;
    proxyErrorHandler?: (
      err: Error,
      res: import("express").Response,
      next: import("express").NextFunction,
    ) => void;
    [key: string]: any;
  }

  function proxy(host: string, options?: ProxyOptions): RequestHandler;
  export = proxy;
}
