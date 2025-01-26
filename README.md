# Meeting Cost Calculator - Chrome Extension

## Overview
Meeting Cost Calculator is a Chrome extension that helps you understand the true cost of meetings by calculating the total expense based on attendees, duration, and hourly rates. It seamlessly integrates with Google Calendar to provide real-time cost calculations as you schedule meetings.

## Features
- 🔄 Real-time cost calculation as you modify meeting details
- 👥 Automatic attendee counting
- ⏱️ Dynamic duration calculation
- 💰 Customizable hourly rates
- 💾 Persistent settings across sessions
- 🎯 Direct integration with Google Calendar's event editor

## Installation
1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension/src directory

## Usage
1. Open Google Calendar and create or edit an event
2. The Meeting Cost Calculator will automatically appear in the event editor modal
3. Set your desired hourly rate (defaults to $150/hour)
4. The calculator will automatically update as you:
   - Add or remove attendees
   - Adjust meeting duration
   - Modify the hourly rate

## Configuration
- Click the extension icon in your Chrome toolbar
- Enter your default hourly rate
- Click "Save" to persist your settings

## Technical Details
The extension consists of several key components:
- `content.js`: Handles the core calculator logic and Google Calendar integration
- `icon.png`: The extension icon
- `popup.js`: Manages the extension popup interface
- `manifest.json`: Defines extension metadata and permissions
- `popup.html`: Provides the rate configuration interface
- `styles.css`: Styles the extension's UI elements

## Tests
To run the tests, use the following command:
```
npm test
```

## Permissions
This extension requires:
- Access to Google Calendar
- Storage permission (for saving hourly rate)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support
For issues and feature requests, please [open an issue](https://github.com/mikeonthemike/meeting-cost-calculator/issues)