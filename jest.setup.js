// Mock chrome API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    query: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Setup jsdom environment
document.body.innerHTML = `
  <div role="dialog" data-testid="event-editor">
    <input aria-label="Start time" value="10:00 AM">
    <input aria-label="End time" value="11:00 AM">
    <input aria-label="Start date" data-date="20240401">
    <input aria-label="End date" data-date="20240401">
    <div aria-label="Guests invited to this event"></div>
  </div>
`;


module.exports = {
    setupFiles: ['tests/mock-extension-apis.js']
  };