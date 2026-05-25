import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@knightandwizard/server/trpc';
import { getApiBaseUrl } from './api';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getApiBaseUrl()}/trpc`
    })
  ]
});
