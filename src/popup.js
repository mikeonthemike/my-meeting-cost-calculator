document.addEventListener('DOMContentLoaded', function() {
    // Load saved rate
    chrome.storage.sync.get(['hourlyRate'], function(result) {
        document.getElementById('hourlyRate').value = result.hourlyRate || 150;
    });

    // Save rate when button is clicked
    document.getElementById('saveRate').addEventListener('click', function() {
        const rate = document.getElementById('hourlyRate').value;
        chrome.storage.sync.set({
            hourlyRate: rate
        }, function() {
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.classList.add('show');
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 2000);
        });
    });

    // Handle Enter key
    document.getElementById('hourlyRate').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('saveRate').click();
        }
    });
});

module.exports = {
  // any functions you need to export for testing
};
