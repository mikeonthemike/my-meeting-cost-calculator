// content.js

// Pure calculation functions outside of injectCostCalculator
const calculateCost = (attendeeCount, duration, hourlyRate) => {
    const cost = hourlyRate * duration * attendeeCount;
    return cost;
};

const updateDuration = (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) {
        return 0;
    }
    // Calculate duration in hours
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    return parseFloat(durationHours.toFixed(2));
};

const updateAttendeeCount = (guestElements) => {
    try {
        // If no guest elements, return 1 for just the organizer
        // Otherwise, return the guest count (which includes organizer)
        return guestElements?.length || 1;
    } catch (error) {
        console.error('Error calculating attendee count:', error);
        return 1; // Default to 1 (organizer only) in case of error
    }
};

// Function to inject the cost calculator into the Google Calendar modal
const injectCostCalculator = () => {
    // Try multiple selectors to find the event editor modal
    const modal = document.querySelector([
        'div[role="dialog"][data-testid="event-editor"]',
        'div[role="dialog"] div[data-dragsource-type="event-create"]',
        'div[role="dialog"] input[aria-label*="Add title"]',
    ].join(', '))?.closest('div[role="dialog"]');

    if (!modal) {
        console.debug('Event editor modal not found');
        return;
    }

    if (document.querySelector("#cost-calculator")) {
        console.debug('Calculator already exists');
        return;
    }

    console.log("Found event editor modal, injecting Cost Calculator");
  
    // Create a container for the calculator
    const calculator = document.createElement("div");
    calculator.id = "cost-calculator";
    calculator.style.marginTop = "10px";
    calculator.style.padding = "10px";
    calculator.style.border = "1px solid #ccc";
    calculator.style.borderRadius = "5px";
    calculator.style.backgroundColor = "#f9f9f9";
    calculator.style.position = "relative";
    calculator.style.zIndex = "9999";
    calculator.style.pointerEvents = "auto";
  
    // Prevent ALL interactions from bubbling up and closing the modal
    calculator.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
    calculator.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
    calculator.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
    calculator.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });

    // Also prevent form inputs from triggering modal close
    calculator.addEventListener('input', (e) => {
        e.stopPropagation();
    });

    // Prevent calculator from being removed by Google Calendar's cleanup
    calculator.setAttribute('data-standalone-modal', 'true');
  
    // Calculator UI with default rate
    calculator.innerHTML = `
      <h3 style="margin-bottom: 10px;">Meeting Cost Calculator</h3>
      <label>
        Hourly Rate (per attendee): 
        <input type="number" id="hourly-rate" value="150" placeholder="Enter rate" style="margin-left: 5px;" />
      </label>
      <br />
      <label style="margin-top: 10px; display: block;">
        Duration (hours): 
        <input type="number" id="meeting-duration" step="0.25" placeholder="Enter duration" style="margin-left: 5px;" />
      </label>
      <p id="attendee-count" style="margin-top: 10px;">Number of Attendees: 1</p>
      <button id="calculate-cost" style="margin-top: 10px;">Calculate Cost</button>
      <p id="cost-output" style="margin-top: 10px; font-weight: bold;">Total Cost: $0</p>
    `;
  
    // Append the calculator to the modal
    modal.appendChild(calculator);
  
    // Load saved rate and set initial duration
    chrome.storage.sync.get(['hourlyRate'], function(result) {
        const rateInput = document.querySelector("#hourly-rate");
        rateInput.value = result.hourlyRate || 150;
        
        // Get meeting duration from the calendar UI
        const durationInput = document.querySelector("#meeting-duration");
        const startTimeInput = modal.querySelector('input[aria-label*="Start time"]');
        const endTimeInput = modal.querySelector('input[aria-label*="End time"]');
        
        if (startTimeInput && endTimeInput) {
            const startTime = new Date(`1970/01/01 ${startTimeInput.value}`);
            const endTime = new Date(`1970/01/01 ${endTimeInput.value}`);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);
            durationInput.value = durationHours.toFixed(2);
        }
    });
  
    // Save rate when it changes
    document.querySelector("#hourly-rate").addEventListener("change", (e) => {
        chrome.storage.sync.set({ hourlyRate: e.target.value });
    });
  
    // Function to handle DOM updates for attendee count
    const updateAttendeeDisplay = () => {
        try {
            // Find the guest list container using multiple possible aria-labels
            const guestContainer = modal.querySelector([
                'div[aria-label="Guests invited to this event"]',
                'div[aria-label="Add guests"]',
                'div[aria-label*="guest"]',
                'div[aria-label*="Guest"]'
            ].join(', '));
            
            // Find all elements with data-email attribute
            const guestElements = guestContainer ? 
                Array.from(guestContainer.querySelectorAll('div[data-email]')) : 
                [];
            
            // Get total attendees (will be 1 if no guests, otherwise uses guest list which includes organizer)
            const attendeeCount = updateAttendeeCount(guestElements);
            
            const attendeeDisplay = document.querySelector("#attendee-count");
            if (attendeeDisplay) {
                attendeeDisplay.textContent = `Number of Attendees: ${attendeeCount}`;
            }
            
            // Recalculate cost with new attendee count
            const hourlyRate = parseFloat(document.querySelector("#hourly-rate").value) || 0;
            const duration = parseFloat(document.querySelector("#meeting-duration").value) || 0;
            const totalCost = calculateCost(attendeeCount, duration, hourlyRate);
            document.querySelector("#cost-output").textContent = 
                `Total Cost: $${totalCost.toFixed(2)} (${attendeeCount} attendees)`;

        } catch (error) {
            console.error('Error updating attendee count:', error);
            if (error.message.includes('Extension context invalidated')) {
                window.location.reload();
            }
        }
    };

    // Function to handle DOM updates for duration
    const updateDurationDisplay = () => {
        try {
            const startTimeInput = modal.querySelector('input[aria-label*="Start time"]');
            const endTimeInput = modal.querySelector('input[aria-label*="End time"]');
            const startDateInput = modal.querySelector('input[aria-label*="Start date"]');
            const endDateInput = modal.querySelector('input[aria-label*="End date"]');
            const durationInput = document.querySelector("#meeting-duration");
            
            // Only proceed if we have all required inputs and they have values
            if (!startTimeInput?.value || !endTimeInput?.value || 
                !startDateInput?.value || !endDateInput?.value || !durationInput) {
                return;
            }

            // Get dates and times
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const startTime = startTimeInput.value;
            const endTime = endTimeInput.value;
            
            try {
                // Format date strings properly
                const startDateTime = new Date(`${startDate} ${startTime}`);
                const endDateTime = new Date(`${endDate} ${endTime}`);
                
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                    return;
                }

                // Use the pure function for calculation
                const durationHours = updateDuration(startDateTime, endDateTime);
                durationInput.value = durationHours;
                
                // Get current attendee count and recalculate cost
                const attendeeCountElement = document.querySelector("#attendee-count");
                const attendeeMatch = attendeeCountElement?.textContent.match(/\d+/);
                const attendeeCount = attendeeMatch ? parseInt(attendeeMatch[0]) : 1;
                
                // Get hourly rate
                const hourlyRate = parseFloat(document.querySelector("#hourly-rate")?.value) || 0;
                
                // Calculate and update total cost
                const totalCost = calculateCost(attendeeCount, durationHours, hourlyRate);
                const costOutput = document.querySelector("#cost-output");
                if (costOutput) {
                    costOutput.textContent = `Total Cost: $${totalCost.toFixed(2)} (${attendeeCount} attendees)`;
                }
            } catch (error) {
                // Silently fail for date parsing errors
                return;
            }
        } catch (error) {
            // Only log critical errors
            console.error('Critical error in updateDurationDisplay:', error);
        }
    };

    // Watch for changes to the time and date inputs
    const timeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Only update if we're dealing with an input element
            if (mutation.target.tagName === 'INPUT' && 
                (mutation.target.getAttribute('aria-label')?.includes('time') ||
                 mutation.target.getAttribute('aria-label')?.includes('date'))) {
                updateDurationDisplay();
            }
        });
    });

    // Find all time and date inputs
    const timeInputs = modal.querySelectorAll([
        'input[aria-label*="Start time"]',
        'input[aria-label*="End time"]',
        'input[aria-label*="Start date"]',
        'input[aria-label*="End date"]'
    ].join(', '));

    // Observe each input
    timeInputs.forEach(input => {
        timeObserver.observe(input, { 
            attributes: true,
            characterData: true
        });
    });

    // Add direct event listeners for input changes
    modal.addEventListener('input', (event) => {
        if (event.target.tagName === 'INPUT' && 
            (event.target.getAttribute('aria-label')?.includes('time') ||
             event.target.getAttribute('aria-label')?.includes('date'))) {
            updateDurationDisplay();
        }
    });

    // Initial duration calculation
    updateDurationDisplay();

    // Update calculate button click handler
    document.querySelector("#calculate-cost").addEventListener("click", () => {
        const guestList = modal.querySelectorAll('div[role="listitem"], div[data-guest-id]');
        const attendeeCount = guestList.length + 1;
        calculateCost(attendeeCount, 0, 0);
    });

    try {
        // Watch for changes in the guest list
        const guestListObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    console.debug('Guest list changed, updating display');
                    updateAttendeeDisplay();
                }
            });
        });

        // Find the guest container and observe it
        const guestContainer = modal.querySelector('div[aria-label="Guests invited to this event"]');
        if (guestContainer) {
            guestListObserver.observe(guestContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });

            // Also observe the parent container for structural changes
            const parentContainer = guestContainer.parentElement;
            if (parentContainer) {
                guestListObserver.observe(parentContainer, {
                    childList: true,
                    subtree: true
                });
            }
        }

        // Also observe the modal for cases where the guest container might be replaced
        guestListObserver.observe(modal, {
            childList: true,
            subtree: true
        });

        // Initial count
        updateAttendeeDisplay();

        // Re-run attendee count when the modal is clicked
        modal.addEventListener('click', () => {
            setTimeout(updateAttendeeDisplay, 200);
        });

        // Add a periodic check as a fallback
        const periodicCheck = setInterval(() => {
            if (!modal.isConnected) {
                clearInterval(periodicCheck);
                guestListObserver.disconnect();
                return;
            }
            updateAttendeeDisplay();
        }, 1000);

    } catch (error) {
        console.error('Error setting up observers:', error);
    }
};
  
// Initialize a MutationObserver to detect changes in the DOM
const initMutationObserver = () => {
    try {
        console.log("Starting MutationObserver...");
    
        // Create the observer
        const observer = new MutationObserver(() => {
            // Inject calculator when the modal appears
            injectCostCalculator();
        });
    
        // Target node to observe
        const targetNode = document.body;
    
        // Ensure the target node exists
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
            console.log("MutationObserver is observing the DOM.");
        } else {
            console.error("Target node is null. MutationObserver cannot start.");
        }
    } catch (error) {
        console.error("Error initializing MutationObserver:", error);
    }
};
  
// Ensure the script runs only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Initializing...");
    initMutationObserver();
});
  
// Export the functions
module.exports = {
    calculateCost,
    updateDuration,
    updateAttendeeCount,
    initMutationObserver
};
  