import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@knightandwizard/server/trpc';
import { getClientApiBaseUrl } from './api';

export function getTrpcEndpoint(): string {
  return `${getClientApiBaseUrl()}/trpc`;
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: getTrpcEndpoint()
    })
  ]
});
