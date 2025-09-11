// OpenRouter API Integration
class OpenRouterAPI {
    constructor() {
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.settings = null;
    }

    updateSettings(settings) {
        this.settings = settings;
    }

    async sendMessage(messages, model) {
        if (!this.settings || !this.settings.apiKey) {
            throw new Error('API key not configured. Please check your settings.');
        }

        if (!model) {
            throw new Error('No model selected. Please select a model from the dropdown.');
        }

        const requestBody = {
            model: model,
            messages: messages,
            temperature: this.settings.temperature || 0.7,
            max_tokens: this.settings.maxTokens || 1000
        };

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI Chat - OpenRouter Interface'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0) {
                throw new Error('No response from the AI model');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async testConnection() {
        if (!this.settings || !this.settings.apiKey) {
            throw new Error('API key not configured');
        }

        try {
            const response = await fetch(`${this.baseURL}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }

    getAvailableModels() {
        return [
            { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable GPT-4 model' },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with more context' },
            { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient model' },
            { id: 'openai/gpt-oss-20b', name: 'GPT-OSS-20B (Free)', description: 'Open source 20B parameter model - FREE' },
            { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and lightweight' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
            { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1 (Free)', description: 'Advanced reasoning model - FREE' },
            { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B', description: 'Open source 70B parameter model' },
            { id: 'meta-llama/llama-2-13b-chat', name: 'Llama 2 13B', description: 'Open source 13B parameter model' },
            { id: 'google/palm-2-chat-bison', name: 'PaLM 2 Chat Bison', description: 'Google\'s PaLM 2 model' },
            { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', description: 'Efficient 7B parameter model' }
        ];
    }
}

// Initialize API instance
const openRouterAPI = new OpenRouterAPI();
