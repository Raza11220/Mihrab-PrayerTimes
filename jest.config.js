{
  "preset": "react-native",
  "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
  "testPathIgnorePatterns": ["/node_modules/"],
  "collectCoverageFrom": [
    "src/utils/**/*.js",
    "src/services/**/*.js",
    "src/store/**/*.js",
    "src/components/**/*.js"
  ],
  "coveragePathIgnorePatterns": ["/node_modules/"],
  "transformIgnorePatterns": [
    "node_modules/(?!(@react-native|expo|react-native-svg|react-native-safe-area-context|react-native-screens|react-native-root-siblings)/)"
  ]
}
