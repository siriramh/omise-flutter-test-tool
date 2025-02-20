exports.config = {
  runner: "local",
  specs: ["./tests/**/*.js"],
  capabilities: [
    {
      platformName: "Android",
      automationName: "Flutter",
      deviceName: "emulator-5554",
      app: "/Users/siriram.h/Downloads/app-kotlin-staging-release.apk",
    },
  ],
  services: ["appium"],
  appium: {
    command: "appium",
  },
  framework: "mocha",
  reporters: ["spec"],
};
