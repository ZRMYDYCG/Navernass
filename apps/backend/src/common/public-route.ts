import { SetMetadata } from "@nestjs/common";

export const PUBLIC_ROUTE = "public-route";
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE, true);
