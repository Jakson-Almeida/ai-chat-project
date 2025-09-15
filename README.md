# AI Chat Project

A beautiful and simple web-based AI chat application that allows users to interact with different OpenRouter LLMs through an intuitive interface.

## 🚀 Features

- **Multi-Model Support**: Chat with different OpenRouter LLM models
- **Clean UI**: Beautiful and modern HTML/CSS/JavaScript interface
- **Settings Management**: Easy setup and configuration of OpenRouter API key
- **Responsive Design**: Works seamlessly across different devices
- **Real-time Chat**: Smooth conversation flow with AI models

## 🎯 Project Overview

This project aims to create a user-friendly chat interface where users can:

1. **Select AI Models**: Choose from various OpenRouter LLM models
2. **Configure API**: Set up their OpenRouter API key in settings
3. **Chat Interface**: Engage in conversations with selected AI models
4. **Clean Experience**: Enjoy a beautiful, distraction-free chat environment

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API Integration**: OpenRouter API
- **Styling**: Modern CSS with responsive design
- **Architecture**: Client-side application

## 📁 Project Structure

```
ai-chat-project/
├── README.md
├── index.html          # Main chat interface
├── styles/
│   └── main.css        # Styling and responsive design
├── scripts/
│   ├── main.js         # Core application logic
│   ├── api.js          # OpenRouter API integration
│   └── settings.js     # Settings management
└── assets/
    └── icons/          # UI icons and images
```

## 🚀 Getting Started

1. **Clone/Download** this project
2. **Open** `index.html` in your web browser
3. **Configure** your OpenRouter API key in settings
4. **Select** your preferred AI model
5. **Start chatting**!

## ⚙️ Configuration

### Secure API Key Setup

This application uses secure API key storage to protect your credentials:

#### Method 1: Environment Variables (Recommended)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```
3. The `.env` file is automatically ignored by Git for security

#### Method 2: Settings Panel
1. Visit [OpenRouter](https://openrouter.ai/keys) to get your API key
2. Open the settings panel in the application
3. Enter your API key (it will be stored securely)
4. Save and start using the chat interface

### Security Features
- ✅ API keys are never displayed in full in the frontend
- ✅ Masked display shows only first 4 and last 4 characters
- ✅ Secure storage using encrypted localStorage
- ✅ `.env` file is gitignored to prevent accidental commits
- ✅ No sensitive data in version control

## 🎨 Design Philosophy

- **Simplicity**: Clean, minimal interface focused on conversation
- **Accessibility**: Easy to use for users of all technical levels
- **Performance**: Fast and responsive chat experience
- **Modern**: Contemporary design with smooth animations

## 🔮 Future Enhancements

- [ ] Chat history and conversation management
- [ ] Model comparison features
- [ ] Export/import chat conversations
- [ ] Custom model parameters
- [ ] Dark/light theme toggle
- [ ] Mobile app version

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

---

**Happy Chatting! 🤖💬**
