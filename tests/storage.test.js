const { resetChromeAPIMocks } = require('./mock-extension-apis');

describe('Chrome Storage Integration', () => {
  beforeEach(() => {
    resetChromeAPIMocks();
    document.body.innerHTML = `
      <input id="hourlyRate" value="150">
      <button id="saveRate">Save</button>
      <div id="statusMessage"></div>
    `;
  });

  test('Loads saved hourly rate from storage', () => {
    // Change async import to require
    const popup = require('../src/popup.js');
    
    // Setup spy
    const getSpy = jest.spyOn(chrome.storage.sync, 'get')
      .mockImplementation((keys, callback) => {
        callback({ hourlyRate: 200 });
      });

    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    expect(getSpy).toHaveBeenCalledWith(['hourlyRate'], expect.any(Function));
    expect(document.getElementById('hourlyRate').value).toBe('200');
  });

  test('Saves hourly rate to storage when button clicked', async () => {
    // Setup spy
    const setSpy = jest.spyOn(chrome.storage.sync, 'set')
      .mockImplementation((data, callback) => {
        callback();
      });

    // Load popup.js module
    await import('../src/popup.js');
    
    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Set value and click save
    const input = document.getElementById('hourlyRate');
    input.value = '250';
    document.getElementById('saveRate').click();

    expect(setSpy).toHaveBeenCalledWith(
      { hourlyRate: '250' },
      expect.any(Function)
    );
  });
});