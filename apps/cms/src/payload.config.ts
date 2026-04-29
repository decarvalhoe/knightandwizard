import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { CatalogCollections } from './collections/catalogCollections';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURL =
  process.env.CMS_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://knightandwizard:knightandwizard@localhost:55432/knightandwizard';

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, ...CatalogCollections],
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL
    },
    schemaName: 'cms'
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001',
  sharp,
  typescript: {
    declare: false,
    outputFile: path.resolve(dirname, '../../../packages/catalogs/src/payload-types.ts')
  }
});
