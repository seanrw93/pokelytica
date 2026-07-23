import Router from "@koa/router";
import Koa from "koa";

export const createApp = () => {
  const app = new Koa();
  const router = new Router();

  router.get("/health", (ctx) => {
    ctx.body = { status: "ok" };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
