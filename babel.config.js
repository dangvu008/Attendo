module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "@babel/preset-typescript"],
    plugins: [
      // Add any additional Babel plugins here
    ],
  };
};
