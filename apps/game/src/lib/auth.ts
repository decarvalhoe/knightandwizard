export type AuthConfig = {
  loginUrl: string;
  meEndpoint: string;
  provider: 'payload';
  providerLabel: string;
};

const DEFAULT_PAYLOAD_BASE_URL = 'http://localhost:3001';

export async function getAuthConfig(): Promise<AuthConfig> {
  const payloadBaseUrl =
    process.env.PAYLOAD_PUBLIC_SERVER_URL ??
    process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL ??
    DEFAULT_PAYLOAD_BASE_URL;

  return {
    loginUrl: `${payloadBaseUrl}/admin`,
    meEndpoint: `${payloadBaseUrl}/api/users/me`,
    provider: 'payload',
    providerLabel: 'Payload Auth'
  };
}
