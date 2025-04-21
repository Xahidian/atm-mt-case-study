module.exports = {
    mutate: ['src/routes/transfer.js'],
    testRunner: 'command',
    commandRunner: {
      command: 'npx playwright test test/playwright/mr_test.spec.js'
    },
    reporters: ['clear-text', 'progress'],
    timeoutMS: 10000
  };
  