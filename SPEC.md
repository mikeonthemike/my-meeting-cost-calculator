# Technical Specification

## System Overview
The system is a Google Chrome extension designed to integrate with Google Calendar. Its primary purpose is to provide users with a cost calculator for proposed meetings, factoring in the number of attendees, the duration of the meeting, and a predefined hourly rate. The extension consists of several components, including frontend scripts (`content.js`, `popup.js`), a manifest file (`manifest.json`), a user interface (`popup.html`), and a stylesheet (`styles.css`).

### Main Components and Their Roles
- **`content.js`**: This script is injected into the Google Calendar event editor modal. It is responsible for dynamically appending the cost calculator UI, setting up event listeners, and updating cost calculations in real-time as the meeting details change.
- **`icon.png`**: The icon for the extension.
- **`popup.js`**: Handles user interactions within the extension's popup, specifically saving the default hourly rate to Chrome's storage.
- **`manifest.json`**: Defines the extension's metadata, permissions, and the files to be injected into Google Calendar.
- **`popup.html`**: Provides the user interface for inputting and saving the default hourly rate.
- **`styles.css`**: Contains styles for the extension's UI elements.

## Core Functionality
### Primary Features and Their Implementation
1. **Cost Calculation in `content.js`**
   - **`injectCostCalculator`**: Central to the extension's functionality, this function injects the cost calculator into the Google Calendar event editor. It dynamically updates the cost based on the number of attendees, meeting duration, and a saved hourly rate.
     - **Critical Logic**: Utilizes `MutationObserver` to monitor changes in the guest list and time inputs, ensuring the cost calculation remains accurate as users modify meeting details.
     - **Data Flow**: Retrieves the hourly rate from `chrome.storage.sync`, calculates the cost, and updates the UI in real-time.
   - **`initMutationObserver`**: Initializes a `MutationObserver` to detect when the event editor modal appears, triggering the injection of the cost calculator.

2. **Saving Default Hourly Rate in `popup.js`**
   - **Event Listener for "save" button**: Allows users to set a default hourly rate, which is then saved to `chrome.storage.sync` for use in cost calculations.
     - **Critical Logic**: Interacts with `chrome.storage.sync` to persist the user's input, ensuring the default rate is available across sessions.

## Architecture
The extension follows a straightforward architecture centered around user interaction with Google Calendar and the dynamic injection of a cost calculator. Data flows from user inputs (number of attendees, meeting duration) and a saved hourly rate into the cost calculation logic within `content.js`. This calculation is dynamically updated and displayed to the user as they modify meeting details. The default hourly rate is set and saved through the extension's popup UI, handled by `popup.js`, and stored using Chrome's storage API for persistent access.

### Data Flow
1. User interacts with Google Calendar to create or edit a meeting.
2. `content.js` is injected into the event editor modal, initializing the cost calculator.
3. As the user modifies meeting details (adds/removes attendees, changes duration), `MutationObserver` instances in `content.js` detect these changes and update the cost calculation in real-time.
4. The default hourly rate is set by the user through the extension's popup (`popup.html`), with `popup.js` saving this rate to `chrome.storage.sync`.
5. The calculated cost is displayed to the user within the Google Calendar event editor, providing immediate feedback on the meeting's cost.