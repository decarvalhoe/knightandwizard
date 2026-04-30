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
    }
  ]
};
