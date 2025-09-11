// Main Application Logic
class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.modelSelector = document.getElementById('modelSelector');
        this.messages = [];
        this.isLoading = false;

        this.initializeEventListeners();
        this.populateModelSelector();
        this.updateSendButton();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key (but allow Shift+Enter for new lines)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButton();
        });

        // Model selection change
        this.modelSelector.addEventListener('change', () => {
            this.updateSendButton();
        });

        // Update API settings when they change
        document.addEventListener('settingsUpdated', () => {
            openRouterAPI.updateSettings(settingsManager.getSettings());
        });
    }

    populateModelSelector() {
        const models = openRouterAPI.getAvailableModels();
        const modelSelector = this.modelSelector;
        
        // Clear existing options except the first one
        modelSelector.innerHTML = '<option value="">Select Model</option>';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            option.title = model.description;
            modelSelector.appendChild(option);
        });
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    updateSendButton() {
        const hasText = this.chatInput.value.trim().length > 0;
        const hasModel = this.modelSelector.value !== '';
        const hasApiKey = settingsManager.isApiKeyConfigured();
        const canSend = hasText && hasModel && hasApiKey && !this.isLoading;

        this.sendBtn.disabled = !canSend;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isLoading) return;

        const selectedModel = this.modelSelector.value;
        if (!selectedModel) {
            this.showNotification('Please select a model first', 'error');
            return;
        }

        if (!settingsManager.isApiKeyConfigured()) {
            this.showNotification('Please configure your API key in settings', 'error');
            return;
        }

        // Add user message to chat
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButton();

        // Show loading indicator
        this.showTypingIndicator();

        try {
            // Update API settings
            openRouterAPI.updateSettings(settingsManager.getSettings());

            // Prepare messages for API
            const apiMessages = this.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Send to API
            const response = await openRouterAPI.sendMessage(apiMessages, selectedModel);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to chat
            this.addMessage('assistant', response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.showNotification(`Error: ${error.message}`, 'error');
            console.error('Chat error:', error);
        }
    }

    addMessage(role, content) {
        const message = {
            role: role,
            content: content,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.chatMessages.appendChild(messageDiv);
    }

    showTypingIndicator() {
        this.isLoading = true;
        this.updateSendButton();

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-message';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content typing-indicator';
        content.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            AI is thinking...
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isLoading = false;
        this.updateSendButton();

        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    clearChat() {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-content">
                    <i class="fas fa-comments"></i>
                    <h2>Welcome to AI Chat</h2>
                    <p>Select a model from the dropdown above and start chatting!</p>
                </div>
            </div>
        `;
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();
    
    // Make chatApp globally available for debugging
    window.chatApp = chatApp;
    
    // Update API settings on initialization
    openRouterAPI.updateSettings(settingsManager.getSettings());
});
