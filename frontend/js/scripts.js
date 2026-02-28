// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for hash navigation links only; external links navigate normally
    const navLinks = document.querySelectorAll('.header nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // otherwise allow normal navigation to other pages
        });
    });

    // Settings functionality
    const saveSettingsBtn = document.querySelector('.save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // Get settings values
            const resolution = document.getElementById('resolution').value;
            const framerate = document.getElementById('framerate').value;
            const sensitivity = document.getElementById('sensitivity').value;
            const emailAlerts = document.getElementById('email-alerts').checked;
            const pushNotifications = document.getElementById('push-notifications').checked;

            // Here you would typically send these settings to the backend
            // For now, we'll just show an alert
            alert(`Settings saved!\nResolution: ${resolution}\nFrame Rate: ${framerate} fps\nSensitivity: ${sensitivity}\nEmail Alerts: ${emailAlerts}\nPush Notifications: ${pushNotifications}`);

            // You could also store in localStorage for persistence
            const settings = {
                resolution,
                framerate,
                sensitivity,
                emailAlerts,
                pushNotifications
            };
            localStorage.setItem('cameraSettings', JSON.stringify(settings));
        });
    }

    // Load saved settings on pages that have settings controls
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const resolutionEl = document.getElementById('resolution');
        const framerateEl = document.getElementById('framerate');
        const sensitivityEl = document.getElementById('sensitivity');
        const emailAlertsEl = document.getElementById('email-alerts');
        const pushNotificationsEl = document.getElementById('push-notifications');

        if (resolutionEl) resolutionEl.value = settings.resolution;
        if (framerateEl) framerateEl.value = settings.framerate;
        if (sensitivityEl) sensitivityEl.value = settings.sensitivity;
        if (emailAlertsEl) emailAlertsEl.checked = settings.emailAlerts;
        if (pushNotificationsEl) pushNotificationsEl.checked = settings.pushNotifications;
    }

    // Populate camera info on home page from saved settings
    const ciResolution = document.getElementById('ci-resolution');
    const ciFramerate = document.getElementById('ci-framerate');
    const ciSensitivity = document.getElementById('ci-sensitivity');

    if (ciResolution || ciFramerate || ciSensitivity) {
        let settingsObj = { resolution: '1080p', framerate: 30, sensitivity: 5 };
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                settingsObj = Object.assign(settingsObj, parsed);
            } catch (e) {
                // ignore parse errors and use defaults
            }
        }

        if (ciResolution) ciResolution.textContent = settingsObj.resolution;
        if (ciFramerate) ciFramerate.textContent = settingsObj.framerate;
        if (ciSensitivity) ciSensitivity.textContent = settingsObj.sensitivity;
    }

    // Configure zones button (placeholder functionality)
    const configureZonesBtn = document.getElementById('configure-zones');
    if (configureZonesBtn) {
        configureZonesBtn.addEventListener('click', function() {
            alert('Zone configuration feature coming soon!');
        });
    }

    // Detection statistics: simplified static zeros for table view
    const statTotalEl = document.getElementById('val-total');
    const statKnownEl = document.getElementById('val-known');
    const statUnknownEl = document.getElementById('val-unknown');

    if (statTotalEl) statTotalEl.textContent = '0';
    if (statKnownEl) statKnownEl.textContent = '0';
    if (statUnknownEl) statUnknownEl.textContent = '0';

    ['trend-total', 'trend-known', 'trend-unknown'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '+0%';
    });

    ['bar-total', 'bar-known', 'bar-unknown'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = '0%';
    });
});