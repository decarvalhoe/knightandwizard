import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email'
  },
  auth: true,
  versions: true,
  fields: [
    {
      name: 'name',
      type: 'text'
    },
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['catalog_reviewer'],
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Catalog Editor', value: 'catalog_editor' },
        { label: 'Catalog Reviewer', value: 'catalog_reviewer' }
      ]
    }
  ]
};
