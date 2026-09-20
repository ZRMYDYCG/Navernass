export default {
  'apps/{frontend,backend}/**/*.{js,jsx,ts,tsx,mjs,cjs}': [
    'oxlint --fix',
    'oxfmt',
  ],
}
