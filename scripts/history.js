// Chat History Management
class ChatHistoryManager {
    constructor() {
        this.history = this.loadHistory();
        this.currentChatId = null;
        this.initializeEventListeners();
        this.renderHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('aiChatHistory');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('aiChatHistory', JSON.stringify(this.history));
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    createNewChat() {
        const chatId = this.generateChatId();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            model: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.history.unshift(newChat);
        this.currentChatId = chatId;
        this.saveHistory();
        this.renderHistory();
        
        return newChat;
    }

    updateChat(chatId, updates) {
        const chatIndex = this.history.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
            this.history[chatIndex] = { ...this.history[chatIndex], ...updates };
            this.history[chatIndex].updatedAt = new Date().toISOString();
            this.saveHistory();
            this.renderHistory();
        }
    }

    addMessage(chatId, message) {
        const chat = this.history.find(chat => chat.id === chatId);
        if (chat) {
            chat.messages.push(message);
            chat.updatedAt = new Date().toISOString();
            
            // Update title if it's the first user message
            if (chat.title === 'New Chat' && message.role === 'user') {
                chat.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
            }
            
            this.saveHistory();
            this.renderHistory();
        }
    }

    loadChat(chatId) {
        const chat = this.history.find(chat => chat.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.renderHistory();
            return chat;
        }
        return null;
    }

    deleteChat(chatId) {
        this.history = this.history.filter(chat => chat.id !== chatId);
        if (this.currentChatId === chatId) {
            this.currentChatId = null;
        }
        this.saveHistory();
        this.renderHistory();
    }

    getCurrentChat() {
        return this.history.find(chat => chat.id === this.currentChatId);
    }

    getCurrentMessages() {
        const currentChat = this.getCurrentChat();
        return currentChat ? currentChat.messages : [];
    }

    renderHistory() {
        const historyContainer = document.getElementById('chatHistory');
        if (!historyContainer) return;

        if (this.history.length === 0) {
            historyContainer.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = this.history.map(chat => {
            const isActive = chat.id === this.currentChatId;
            const date = new Date(chat.updatedAt).toLocaleDateString();
            const time = new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="history-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                    <div class="history-item-actions">
                        <button class="history-action-btn" onclick="event.stopPropagation(); historyManager.deleteChat('${chat.id}')" title="Delete chat">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="history-item-title">${this.escapeHtml(chat.title)}</div>
                    <div class="history-item-date">${date} at ${time}</div>
                    ${chat.model ? `<div class="history-item-model">${this.getModelDisplayName(chat.model)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    getModelDisplayName(modelId) {
        const models = {
            'openai/gpt-4': 'GPT-4',
            'openai/gpt-4-turbo': 'GPT-4 Turbo',
            'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'openai/gpt-oss-20b': 'GPT-OSS-20B (Free)',
            'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
            'anthropic/claude-3-haiku': 'Claude 3 Haiku',
            'anthropic/claude-3-opus': 'Claude 3 Opus',
            'deepseek/deepseek-chat-v3.1:free': 'DeepSeek V3.1 (Free)',
            'meta-llama/llama-2-70b-chat': 'Llama 2 70B',
            'meta-llama/llama-2-13b-chat': 'Llama 2 13B',
            'google/palm-2-chat-bison': 'PaLM 2 Chat Bison',
            'mistralai/mistral-7b-instruct': 'Mistral 7B'
        };
        return models[modelId] || modelId;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeEventListeners() {
        // New chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                this.createNewChat();
                // Trigger chat app to load new chat
                if (window.chatApp) {
                    window.chatApp.loadNewChat();
                }
            });
        }

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Chat history item clicks
        document.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const chatId = historyItem.dataset.chatId;
                this.loadChat(chatId);
                // Trigger chat app to load the selected chat
                if (window.chatApp) {
                    window.chatApp.loadChat(chatId);
                }
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                if (sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    clearAllHistory() {
        if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
            this.history = [];
            this.currentChatId = null;
            this.saveHistory();
            this.renderHistory();
            if (window.chatApp) {
                window.chatApp.clearChat();
            }
        }
    }

    exportHistory() {
        const dataStr = JSON.stringify(this.history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-chat-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importHistory(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedHistory = JSON.parse(e.target.result);
                if (Array.isArray(importedHistory)) {
                    this.history = [...this.history, ...importedHistory];
                    this.saveHistory();
                    this.renderHistory();
                    alert('Chat history imported successfully!');
                } else {
                    alert('Invalid file format. Please select a valid chat history file.');
                }
            } catch (error) {
                alert('Error importing chat history. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize history manager
const historyManager = new ChatHistoryManager();

