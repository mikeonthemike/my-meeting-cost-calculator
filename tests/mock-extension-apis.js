// Create a more complete mock of the Chrome API
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

// Helper to reset all mocks between tests
const resetChromeAPIMocks = () => {
  chrome.storage.sync.get.mockReset();
  chrome.storage.sync.set.mockReset();
  chrome.tabs.query.mockReset();
  chrome.runtime.sendMessage.mockReset();
};

module.exports = {
  resetChromeAPIMocks
}; 