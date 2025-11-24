module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@app": "./app",
            "@service": "./service",
            "@application": "./application",
            "@assets": "./assets",
            "@view": "./View",
            "react-native-device-info": "./react-native-device-info.js",
          },
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".tsx",
            ".jsx",
            ".js",
            ".json",
          ],
        },
      ],
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === "development",
        },
      ],
      // 🔥 이 플러그인은 반드시 가장 마지막에 있어야 한다!
      "react-native-reanimated/plugin",
    ],
  };
};
