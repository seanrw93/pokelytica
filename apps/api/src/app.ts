import { bodyParser } from "@koa/bodyparser";
import Router from "@koa/router";
import Koa from "koa";
import { analyzeRouter } from "./routes/analyze";
import { simulateRouter } from "./routes/simulate";

export const createApp = () => {
  const app = new Koa();
  const router = new Router();

  router.get("/health", (ctx) => {
    ctx.body = { status: "ok" };
  });

  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(simulateRouter.routes());
  app.use(simulateRouter.allowedMethods());
  app.use(analyzeRouter.routes());
  app.use(analyzeRouter.allowedMethods());

  return app;
};
