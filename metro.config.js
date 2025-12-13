// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ViroReact용 .vrx 파일 및 기타 3D asset 확장자 추가
config.resolver.assetExts.push(
  // 3D model formats
  "glb",
  "gltf",
  "obj",
  "mtl",
  "fbx",
  "dae",
  "vrx",
  "arobject",
  // Additional asset formats that ViroReact might use
  "hdr",
  "ktx"
);

module.exports = config;
