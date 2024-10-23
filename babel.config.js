module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          allowlist: null, // Change this from blocklist/allowlist if needed
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};