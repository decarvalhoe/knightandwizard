export type TrpcContext = Record<string, never>;

export async function createTrpcContext(): Promise<TrpcContext> {
  return {};
}
