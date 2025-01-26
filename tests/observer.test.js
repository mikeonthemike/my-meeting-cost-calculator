const { initMutationObserver } = require('../content');

describe('MutationObserver Integration', () => {
  let observerCallback;
  
  beforeEach(() => {
    // Mock MutationObserver
    global.MutationObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe = jest.fn();
      disconnect = jest.fn();
    };
  });

  test('Updates attendee count when guests are added', async () => {
    document.body.innerHTML = `
      <div aria-label="Guests invited to this event">
        <div data-email="existing@example.com"></div>
      </div>
      <div id="attendee-count">Number of Attendees: 1</div>
    `;

    initMutationObserver();

    // Simulate mutation
    const guestContainer = document.querySelector('[aria-label="Guests invited to this event"]');
    const mutation = {
      type: 'childList',
      target: guestContainer,
      addedNodes: [
        (() => {
          const div = document.createElement('div');
          div.setAttribute('data-email', 'new@example.com');
          return div;
        })()
      ],
      removedNodes: []
    };

    // Trigger the observer callback
    observerCallback([mutation]);

    // Use jest's timer mocks instead of setTimeout
    jest.useFakeTimers();
    jest.runAllTimers();

    const attendeeCount = document.querySelector('#attendee-count');
    expect(attendeeCount.textContent).toBe('Number of Attendees: 2');
  });
});