// Settings Management
class SettingsManager {
    constructor() {
        this.settings = {
            apiKey: '',
            temperature: 0.7,
            maxTokens: 1000
        };
        this.loadSettings();
        this.initializeEventListeners();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('aiChatSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.updateUI();
    }

    saveSettings() {
        localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
        this.updateUI();
    }

    updateUI() {
        const apiKeyInput = document.getElementById('apiKey');
        const temperatureInput = document.getElementById('temperature');
        const maxTokensInput = document.getElementById('maxTokens');
        const rangeValue = document.querySelector('.range-value');

        if (apiKeyInput) apiKeyInput.value = this.settings.apiKey;
        if (temperatureInput) {
            temperatureInput.value = this.settings.temperature;
            if (rangeValue) rangeValue.textContent = this.settings.temperature;
        }
        if (maxTokensInput) maxTokensInput.value = this.settings.maxTokens;
    }

    initializeEventListeners() {
        // Settings modal controls
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const cancelSettings = document.getElementById('cancelSettings');
        const saveSettings = document.getElementById('saveSettings');

        // Temperature range slider
        const temperatureInput = document.getElementById('temperature');
        const rangeValue = document.querySelector('.range-value');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.hideSettings();
            });
        }

        if (cancelSettings) {
            cancelSettings.addEventListener('click', () => {
                this.hideSettings();
            });
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettingsFromUI();
            });
        }

        if (temperatureInput && rangeValue) {
            temperatureInput.addEventListener('input', (e) => {
                rangeValue.textContent = e.target.value;
            });
        }

        // Close modal when clicking outside
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.hideSettings();
                }
            });
        }

        // Save settings on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && settingsModal.classList.contains('active')) {
                this.saveSettingsFromUI();
            }
        });
    }

    showSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    saveSettingsFromUI() {
        const apiKeyInput = document.getElementById('apiKey');
        const temperatureInput = document.getElementById('temperature');
        const maxTokensInput = document.getElementById('maxTokens');

        if (apiKeyInput) this.settings.apiKey = apiKeyInput.value.trim();
        if (temperatureInput) this.settings.temperature = parseFloat(temperatureInput.value);
        if (maxTokensInput) this.settings.maxTokens = parseInt(maxTokensInput.value);

        this.saveSettings();
        this.hideSettings();

        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getSettings() {
        return this.settings;
    }

    isApiKeyConfigured() {
        return this.settings.apiKey && this.settings.apiKey.length > 0;
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

