// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.header nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
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

    // Load saved settings on page load
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('resolution').value = settings.resolution;
        document.getElementById('framerate').value = settings.framerate;
        document.getElementById('sensitivity').value = settings.sensitivity;
        document.getElementById('email-alerts').checked = settings.emailAlerts;
        document.getElementById('push-notifications').checked = settings.pushNotifications;
    }

    // Configure zones button (placeholder functionality)
    const configureZonesBtn = document.getElementById('configure-zones');
    if (configureZonesBtn) {
        configureZonesBtn.addEventListener('click', function() {
            alert('Zone configuration feature coming soon!');
        });
    }
});