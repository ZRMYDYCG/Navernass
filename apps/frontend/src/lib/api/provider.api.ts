import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import {
  providerConfigSchema,
  providerTestResultSchema,
  type ProviderPayload,
} from "@/schemas/provider.schema";

const deletedResultSchema = z.object({ deleted: z.boolean() });

function cleanProviderPayload(payload: ProviderPayload) {
  return {
    name: payload.name,
    kind: payload.kind,
    ...(payload.baseUrl ? { baseUrl: payload.baseUrl } : {}),
    ...(payload.apiKey ? { apiKey: payload.apiKey } : {}),
    model: payload.model,
    ...(payload.embeddingModel ? { embeddingModel: payload.embeddingModel } : {}),
    supportsTools: payload.supportsTools,
    supportsStructured: payload.supportsStructured,
    isDefault: payload.isDefault,
    ...(payload.isEnabled === undefined ? {} : { isEnabled: payload.isEnabled }),
    settings: {},
  };
}

export function getProviders() {
  return apiRequest("agent/providers", z.array(providerConfigSchema));
}

export function createProvider(payload: ProviderPayload) {
  return apiRequest("agent/providers", providerConfigSchema, {
    method: "post",
    json: cleanProviderPayload(payload),
  });
}

export function updateProvider(id: string, payload: ProviderPayload) {
  return apiRequest(`agent/providers/${id}`, providerConfigSchema, {
    method: "patch",
    json: cleanProviderPayload(payload),
  });
}

export function deleteProvider(id: string) {
  return apiRequest(`agent/providers/${id}`, deletedResultSchema, { method: "delete" });
}

export function testProvider(id: string) {
  return apiRequest(`agent/providers/${id}/test`, providerTestResultSchema, { method: "post" });
}
