import vinextHandler from "vinext/server/fetch-handler";
import { handleApi } from "../server/index";
import type { ApiEnvironment } from "../server/d1";

export default {
  async fetch(
    request: Request,
    env: ApiEnvironment,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/api/v1" || path.startsWith("/api/v1/"))
      return handleApi(request, env);
    return vinextHandler.fetch(request, env, ctx);
  },
};
