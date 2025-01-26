import { injectCostCalculator } from '../content';

describe('DOM Integration Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div role="dialog" data-testid="event-editor"></div>
    `;
  });

  test('Calculator is properly injected into modal', () => {
    injectCostCalculator();
    
    const calculator = document.querySelector('#cost-calculator');
    expect(calculator).toBeTruthy();
    expect(calculator.querySelector('#hourly-rate')).toBeTruthy();
    expect(calculator.querySelector('#meeting-duration')).toBeTruthy();
  });

  test('Calculator prevents event propagation', () => {
    injectCostCalculator();
    
    const calculator = document.querySelector('#cost-calculator');
    const mockStopPropagation = jest.fn();
    const mockPreventDefault = jest.fn();
    
    calculator.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      stopPropagation: mockStopPropagation,
      preventDefault: mockPreventDefault
    }));
    
    expect(mockStopPropagation).toHaveBeenCalled();
    expect(mockPreventDefault).toHaveBeenCalled();
  });
});