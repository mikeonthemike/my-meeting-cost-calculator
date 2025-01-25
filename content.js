// content.js

(function () {
  // Ensure the script runs only on Google Calendar's event creation modal
  const injectCostCalculator = () => {
    const modal = document.querySelector(".c7fp58b");
    if (modal && !document.querySelector("#cost-calculator")) {
      // Create the cost calculator container
      const calculator = document.createElement("div");
      calculator.id = "cost-calculator";
      calculator.style.marginTop = "10px";
      calculator.innerHTML = `
        <h3>Meeting Cost Calculator</h3>
        <label for="hourly-rate">Hourly Rate (per person): $</label>
        <input type="number" id="hourly-rate" value="50" style="width: 80px;" />
        <p id="cost-output" style="margin-top: 5px;">Total Cost: $0</p>
      `;

      // Append to the modal
      modal.appendChild(calculator);

      // Add event listeners
      const hourlyRateInput = document.querySelector("#hourly-rate");
      const costOutput = document.querySelector("#cost-output");

      hourlyRateInput.addEventListener("input", () => {
        const attendees = document.querySelectorAll(".RY3tic");
        const duration = getMeetingDuration(); // Extract duration (helper below)
        const hourlyRate = parseFloat(hourlyRateInput.value) || 0;

        const totalCost = hourlyRate * attendees.length * (duration / 60); // cost formula
        costOutput.textContent = `Total Cost: $${totalCost.toFixed(2)}`;
      });
    }
  };

  // Helper to calculate meeting duration in minutes
  const getMeetingDuration = () => {
    const startTime = document.querySelector(".rxucuf").textContent; // Example selector
    const endTime = document.querySelector(".s5okuf").textContent; // Example selector

    // Convert to minutes (you may need to parse the format based on locale)
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  // Observe for changes in the DOM (to re-inject UI when modal opens)
  const observer = new MutationObserver(() => injectCostCalculator());
  observer.observe(document.body, { childList: true, subtree: true });
})();
