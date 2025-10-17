module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',

  plugins: [require.resolve('prettier-plugin-tailwindcss'), '@prettier/plugin-oxc'],
  tailwindAttributes: ['className'],
};
