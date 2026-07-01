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
      'Replaces AI hype on every page. "AI" becomes "Calculator." "Machine learning" becomes "memorizing." You get the idea.',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'just-a-calculator@benjaminlooi.com',
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
});
