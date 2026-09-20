import { randomUUID } from "node:crypto";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./current-user.js";

export function requestIdMiddleware(request: AuthRequest, response: Response, next: NextFunction) {
  const incoming = request.header("x-request-id");
  request.requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
}
