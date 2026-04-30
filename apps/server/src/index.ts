import { buildApp } from './app.js';
import { getServerHost, getServerPort } from './config.js';

const app = buildApp({ logger: true });

try {
  await app.listen({ host: getServerHost(), port: getServerPort() });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
