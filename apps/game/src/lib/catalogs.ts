export interface CatalogDocumentEnvelope<Document> {
  catalog: {
    catalogName: string;
    contentHash: string;
    document: Document;
    importedAt: string;
    sourcePath: string;
    updatedAt: string;
  };
  status: 'found';
}

export interface CatalogApiError {
  error?: {
    catalogName?: string;
    code?: string;
    message?: string;
  };
  status?: string;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3002';

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function getCatalogDocument<Document>(catalogName: string): Promise<Document> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/catalogs/${catalogName}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = (await safeJson(response)) as CatalogApiError | null;
    const message = detail?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Unable to load ${catalogName} from catalog API: ${message}`);
  }

  const body = (await response.json()) as CatalogDocumentEnvelope<Document>;
  return body.catalog.document;
}

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
