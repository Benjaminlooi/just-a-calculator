import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Just a Calculator',
    description:
      'Replaces every instance of the word "AI" with "Calculator" on every page.',
    permissions: ['storage'],
  },
});
