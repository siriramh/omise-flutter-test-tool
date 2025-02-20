const wdio = require("webdriverio");
const fs = require("fs");

// Add logging utility
const logger = {
  logFile: `./logs/test-${new Date().toISOString().replace(/[:.]/g, "-")}.log`,

  init() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }
  },

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    // Log to console
    console.log(message);

    // Log to file
    fs.appendFileSync(this.logFile, logMessage);
  },
};

// Initialize logger
logger.init();

(async () => {
  logger.log("Starting test execution");
  const driver = await wdio.remote({
    protocol: "http",
    hostname: "localhost",
    port: 4723,
    path: "/",
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "emulator-5554",
      "appium:app": "/Users/siriram.h/Downloads/app-kotlin-staging-release.apk",
    },
  });

  try {
    logger.log("Driver initialized successfully");
    // Wait and verify title text
    logger.log("Waiting for title text to be displayed");
    const titleText = await driver.$(
      "id=co.omise.android.example:id/title_text"
    );
    await titleText.waitForDisplayed({ timeout: 10000 });
    logger.log("Title text verified successfully");

    // Verify Total Amount text
    logger.log("Waiting for Total Amount text");
    const totalAmount = await driver.$('//*[@text="Total Amount"]');
    await totalAmount.waitForDisplayed({ timeout: 10000 });
    logger.log("Total Amount text verified");

    // Check amount edit field
    const amountEdit = await driver.$(
      "id=co.omise.android.example:id/amount_edit"
    );
    await amountEdit.waitForDisplayed({ timeout: 10000 });

    // Tap on currency edit
    const currencyEdit = await driver.$(
      "id=co.omise.android.example:id/currency_edit"
    );
    await currencyEdit.click({ timeout: 10000 });

    // Choose payment method button
    const paymentMethodButton = await driver.$(
      "id=co.omise.android.example:id/choose_payment_method_button"
    );
    await paymentMethodButton.waitForDisplayed({ timeout: 10000 });
    await driver.$('//*[@text="Choose Payment Method"]').click();

    await driver.pause(4000);
    // Add this before trying to find the Credit/Debit Card option
    const source = await driver.getPageSource();
    console.log("Current page source:", source);

    // Select Credit/Debit Card
    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 400, y: 275 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();

    // Fill card details
    logger.log("Entering card details");
    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 504, y: 409 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();
    logger.log("Entering card number");
    await driver.keys("4141414141414");

    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 400, y: 700 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();
    logger.log("Entering cardholder name");
    await driver.keys("Siriram Hazam");

    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 217, y: 980 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();
    logger.log("Entering expiry date");
    await driver.keys("0628");

    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 690, y: 993 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();
    logger.log("Entering CVV");
    await driver.keys("011");

    // Click Pay button
    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: 545, y: 1441 },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 5000 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();

    // Wait for snackbar with timeout
    logger.log("Waiting for token in snackbar");
    const snackbar = await driver.$('//*[contains(@text, "tokn_")]');
    await snackbar.waitForDisplayed({ timeout: 60000 });

    // Optional: Get and log the token text
    logger.log("Token generated successfully");
    const snackbarText = await snackbar.getText();
    console.log("Token:", snackbarText);
    logger.log(`Token generated: ${snackbarText}`);

    await driver.deleteSession();
  } catch (error) {
    logger.log(`Test failed: ${error.message}`);
    console.error("Test failed:", error);
    // Take screenshot on failure
    const screenshotPath = `./error-screenshot-${new Date().getTime()}.png`;
    await driver.saveScreenshot(screenshotPath);
    logger.log(`Error screenshot saved to: ${screenshotPath}`);
  } finally {
    await driver.deleteSession();
    logger.log("Driver session terminated");
  }
})().catch((error) => {
  logger.log(`Unhandled error: ${error.message}`);
});
