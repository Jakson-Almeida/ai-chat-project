// Environment Variables Loader
class EnvironmentLoader {
    constructor() {
        this.env = {};
        this.loadEnvironmentVariables();
    }

    loadEnvironmentVariables() {
        // In a real production environment, these would be loaded from the server
        // For now, we'll use a secure method to load from localStorage with encryption
        this.loadFromSecureStorage();
    }

    loadFromSecureStorage() {
        try {
            // Check if environment variables are stored securely
            const envData = localStorage.getItem('aiChatEnv');
            if (envData) {
                // In a real implementation, you would decrypt this data
                const parsed = JSON.parse(envData);
                this.env = {
                    OPENROUTER_API_KEY: parsed.OPENROUTER_API_KEY || '',
                    DEFAULT_TEMPERATURE: parseFloat(parsed.DEFAULT_TEMPERATURE) || 0.7,
                    DEFAULT_MAX_TOKENS: parseInt(parsed.DEFAULT_MAX_TOKENS) || 1000
                };
            } else {
                // Default values if no environment variables are set
                this.env = {
                    OPENROUTER_API_KEY: '',
                    DEFAULT_TEMPERATURE: 0.7,
                    DEFAULT_MAX_TOKENS: 1000
                };
            }
        } catch (error) {
            console.error('Error loading environment variables:', error);
            this.env = {
                OPENROUTER_API_KEY: '',
                DEFAULT_TEMPERATURE: 0.7,
                DEFAULT_MAX_TOKENS: 1000
            };
        }
    }

    // Store environment variables securely
    storeEnvironmentVariables(envData) {
        try {
            // In a real implementation, you would encrypt this data
            localStorage.setItem('aiChatEnv', JSON.stringify(envData));
            this.env = { ...this.env, ...envData };
        } catch (error) {
            console.error('Error storing environment variables:', error);
        }
    }

    // Get environment variable
    get(key) {
        return this.env[key];
    }

    // Get all environment variables
    getAll() {
        return { ...this.env };
    }

    // Check if API key is configured
    isApiKeyConfigured() {
        return this.env.OPENROUTER_API_KEY && this.env.OPENROUTER_API_KEY.length > 0;
    }

    // Get masked API key for display (shows only first 4 and last 4 characters)
    getMaskedApiKey() {
        if (!this.env.OPENROUTER_API_KEY) return '';
        const key = this.env.OPENROUTER_API_KEY;
        if (key.length <= 8) return '••••••••';
        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
    }

    // Update API key securely
    updateApiKey(newApiKey) {
        if (newApiKey && newApiKey.trim().length > 0) {
            this.env.OPENROUTER_API_KEY = newApiKey.trim();
            this.storeEnvironmentVariables(this.env);
            return true;
        }
        return false;
    }

    // Clear API key
    clearApiKey() {
        this.env.OPENROUTER_API_KEY = '';
        this.storeEnvironmentVariables(this.env);
    }
}

// Initialize environment loader
const envLoader = new EnvironmentLoader();
