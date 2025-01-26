const { calculateCost, updateDuration, updateAttendeeCount } = require('../content');

describe('Cost Calculator Core Functions', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = `
      <div id="cost-calculator">
        <input id="hourly-rate" value="150">
        <input id="meeting-duration" value="1">
        <p id="attendee-count">Number of Attendees: 1</p>
        <p id="cost-output">Total Cost: $0</p>
      </div>
    `;
  });

  test('calculateCost correctly computes meeting cost', () => {
    const calculator = document.querySelector('#cost-calculator');
    const hourlyRate = 150;
    const duration = 2;
    const attendees = 3;
    
    // Set input values
    calculator.querySelector('#hourly-rate').value = hourlyRate;
    calculator.querySelector('#meeting-duration').value = duration;
    
    calculateCost(attendees);
    
    const output = calculator.querySelector('#cost-output').textContent;
    expect(output).toBe(`Total Cost: $900.00 (3 attendees)`);
  });

  test('updateDuration calculates correct duration between times', () => {
    const startTime = '09:00 AM';
    const endTime = '10:30 AM';
    
    document.querySelector('input[aria-label="Start time"]').value = startTime;
    document.querySelector('input[aria-label="End time"]').value = endTime;
    
    updateDuration();
    
    const duration = document.querySelector('#meeting-duration').value;
    expect(parseFloat(duration)).toBe(1.5);
  });

  test('updateAttendeeCount correctly counts attendees', () => {
    // Create mock guest elements
    const guestElements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div')
    ];
    
    const count = updateAttendeeCount(guestElements);
    expect(count).toBe(4); // 3 guests + 1 organizer
  });

  test('updateAttendeeCount handles empty guest list', () => {
    expect(updateAttendeeCount([])).toBe(1); // Just organizer
    expect(updateAttendeeCount(null)).toBe(1); // Just organizer
    expect(updateAttendeeCount(undefined)).toBe(1); // Just organizer
  });
});
