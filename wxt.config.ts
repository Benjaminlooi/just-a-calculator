import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  suppressWarnings: {
    firefoxDataCollection: true,
  },
  manifest: {
    name: 'Just a Calculator',
    description:
      'Replaces every instance of the word "AI" with "Calculator" on every page.',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'just-a-calculator@benjaminlooi.com',
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
});
