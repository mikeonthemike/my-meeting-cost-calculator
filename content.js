// content.js

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
  
    // Function to count attendees with error handling
    const updateAttendeeCount = () => {
        try {
            // Debug: Log all aria-labels in the modal to find the right one
            const allAriaLabels = Array.from(modal.querySelectorAll('[aria-label]'))
                .map(el => el.getAttribute('aria-label'));
            
            // Find the guest list container using multiple possible aria-labels
            const guestContainer = modal.querySelector([
                'div[aria-label="Guests invited to this event"]',
                'div[aria-label="Add guests"]',
                'div[aria-label*="guest"]',
                'div[aria-label*="Guest"]'
            ].join(', '));
            
            if (!guestContainer) {
                console.debug('Guest container not found. Modal contents:', modal.innerHTML);
                return;
            }

            // Find all elements with data-email attribute
            const guestElements = guestContainer.querySelectorAll('div[data-email]');
            // The total count is just the number of guests (organizer is included in data-email)
            const attendeeCount = guestElements.length;
            
            console.debug(`Found ${guestElements.length} guests with data-email attributes`);
            
            const attendeeDisplay = document.querySelector("#attendee-count");
            if (attendeeDisplay) {
                attendeeDisplay.textContent = `Number of Attendees: ${attendeeCount}`;
                console.debug(`Updated attendee count to ${attendeeCount}`);
            }
            
            // Recalculate cost with new attendee count
            calculateCost(attendeeCount);
        } catch (error) {
            console.error('Error updating attendee count:', error);
            // If we get an invalidated context error, reload the page
            if (error.message.includes('Extension context invalidated')) {
                window.location.reload();
            }
        }
    };

    // Function to calculate cost
    const calculateCost = (attendeeCount) => {
        const hourlyRate = parseFloat(document.querySelector("#hourly-rate").value) || 0;
        const duration = parseFloat(document.querySelector("#meeting-duration").value) || 0;
        const totalCost = hourlyRate * duration * attendeeCount;
        
        document.querySelector("#cost-output").textContent = 
            `Total Cost: $${totalCost.toFixed(2)} (${attendeeCount} attendees)`;
    };

    // Update calculate button click handler
    document.querySelector("#calculate-cost").addEventListener("click", () => {
        const guestList = modal.querySelectorAll('div[role="listitem"], div[data-guest-id]');
        const attendeeCount = guestList.length + 1;
        calculateCost(attendeeCount);
    });

    try {
        // Watch for changes in the guest list
        const guestListObserver = new MutationObserver((mutations) => {
            try {
                console.debug('Detected changes in modal:', mutations.length);
                setTimeout(updateAttendeeCount, 100);
            } catch (error) {
                console.error('Error in observer callback:', error);
            }
        });

        // Find the guest container and observe it
        const guestContainer = modal.querySelector('div[aria-label="Guests invited to this event"]');
        if (guestContainer) {
            guestListObserver.observe(guestContainer, {
                childList: true,
                subtree: true,
                attributes: true
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
        updateAttendeeCount();

        // Re-run attendee count when the modal is clicked
        modal.addEventListener('click', () => {
            setTimeout(updateAttendeeCount, 200);
        });

        // Add a periodic check as a fallback
        const periodicCheck = setInterval(() => {
            if (!modal.isConnected) {
                clearInterval(periodicCheck);
                guestListObserver.disconnect();
                return;
            }
            updateAttendeeCount();
        }, 1000);

    } catch (error) {
        console.error('Error setting up observers:', error);
    }

    // Function to update duration based on start and end times
    const updateDuration = () => {
        const startTimeInput = modal.querySelector('input[aria-label="Start time"]');
        const endTimeInput = modal.querySelector('input[aria-label="End time"]');
        const startDateInput = modal.querySelector('input[aria-label="Start date"]');
        const endDateInput = modal.querySelector('input[aria-label="End date"]');
        const durationInput = document.querySelector("#meeting-duration");
        
        if (startTimeInput && endTimeInput && startDateInput && endDateInput) {
            // Get dates from data-date attribute
            const startDate = startDateInput.getAttribute('data-date');
            const endDate = endDateInput.getAttribute('data-date');
            
            // Combine date and time
            const startDateTime = new Date(`${startDate.slice(0,4)}-${startDate.slice(4,6)}-${startDate.slice(6,8)} ${startTimeInput.value}`);
            const endDateTime = new Date(`${endDate.slice(0,4)}-${endDate.slice(4,6)}-${endDate.slice(6,8)} ${endTimeInput.value}`);
            
            // Calculate duration in hours
            const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
            durationInput.value = durationHours.toFixed(2);
            
            console.debug('Duration calculated:', {
                startDate,
                endDate,
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                duration: durationHours
            });
            
            // Recalculate cost with new duration
            const attendeeCount = document.querySelector("#attendee-count")?.textContent.match(/\d+/) || 0;
            calculateCost(parseInt(attendeeCount));
        }
    };

    // Watch for changes to the time and date inputs
    const timeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' || 
                (mutation.target.tagName === 'INPUT' && 
                 (mutation.target.getAttribute('aria-label')?.includes('time') ||
                  mutation.target.getAttribute('aria-label')?.includes('date')))) {
                updateDuration();
            }
        });
    });

    // Find all time and date inputs
    const timeInputs = modal.querySelectorAll([
        'input[aria-label="Start time"]',
        'input[aria-label="End time"]',
        'input[aria-label="Start date"]',
        'input[aria-label="End date"]'
    ].join(', '));

    // Observe each input
    timeInputs.forEach(input => {
        timeObserver.observe(input, { 
            attributes: true,
            characterData: true,
            childList: true
        });
    });

    // Also observe the parent containers for structural changes
    timeInputs.forEach(input => {
        const parent = input.parentElement;
        if (parent) {
            timeObserver.observe(parent, {
                childList: true,
                subtree: true
            });
        }
    });

    // Initial duration calculation
    updateDuration();
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
  