export type ApiConnectionState = 'offline' | 'online';

type ApiHealthResponse = {
  service?: string;
  status?: string;
  uptimeSeconds?: number;
};

export type ApiHealthStatus = {
  baseUrl: string;
  label: string;
  message: string;
  service?: string;
  state: ApiConnectionState;
  uptimeSeconds?: number;
};

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3002';

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function getApiHealth(): Promise<ApiHealthStatus> {
  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(1600)
    });

    if (!response.ok) {
      return offline(baseUrl, `HTTP ${response.status}`);
    }

    const health = (await response.json()) as ApiHealthResponse;

    if (health.status !== 'ok') {
      return offline(baseUrl, health.status ?? 'statut inconnu');
    }

    return {
      baseUrl,
      label: 'Serveur prêt',
      message: `${health.service ?? 'API K&W'} répond sur /health.`,
      service: health.service,
      state: 'online',
      uptimeSeconds: health.uptimeSeconds
    };
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'connexion impossible';
    return offline(baseUrl, detail);
  }
}

function offline(baseUrl: string, detail: string): ApiHealthStatus {
  return {
    baseUrl,
    label: 'Serveur indisponible',
    message: `Aucune réponse exploitable depuis ${baseUrl}/health (${detail}).`,
    state: 'offline'
  };
}
