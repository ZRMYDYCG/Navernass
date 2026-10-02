import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import {
  providerConfigSchema,
  catalogModelSchema,
  catalogProviderSchema,
  discoveredModelSchema,
  type ProviderKind,
  type DiscoverModelsPayload,
  providerTestResultSchema,
  type ProviderPayload,
} from "@/lib/http/modules/provider.schema";

const deletedResultSchema = z.object({ deleted: z.boolean() });

export function getProviders() {
  return apiRequest("agent/providers", z.array(providerConfigSchema));
}

export function createProvider(payload: ProviderPayload) {
  return apiRequest("agent/providers", providerConfigSchema, {
    method: "post",
    json: payload,
  });
}

export function updateProvider(id: string, payload: ProviderPayload) {
  return apiRequest(`agent/providers/${id}`, providerConfigSchema, {
    method: "patch",
    json: payload,
  });
}

export function deleteProvider(id: string) {
  return apiRequest(`agent/providers/${id}`, deletedResultSchema, { method: "delete" });
}

export function testProvider(id: string) {
  return apiRequest(`agent/providers/${id}/test`, providerTestResultSchema, { method: "post" });
}

export function getProviderCatalog() {
  return apiRequest("agent/providers/catalog", z.array(catalogProviderSchema));
}
export function getModelCatalog(kind: ProviderKind) {
  return apiRequest(`agent/providers/catalog/${kind}`, z.array(catalogModelSchema));
}
export function discoverModels(payload: DiscoverModelsPayload) {
  return apiRequest("agent/providers/models", z.array(discoveredModelSchema), {
    method: "post",
    json: payload,
  });
}
