(function () {
    'use strict';

    // Prevent multiple instances
    if (window.aikoWidgetLoaded) return;
    window.aikoWidgetLoaded = true;

    if (!window.marked) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(script);
    }

    if (!window.Prism) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(link);

        const prismScript = document.createElement('script');
        prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        prismScript.setAttribute('data-manual', 'true');
        document.head.appendChild(prismScript);

        const pythonScript = document.createElement('script');
        pythonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js';
        document.head.appendChild(pythonScript);

        const jsScript = document.createElement('script');
        jsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js';
        document.head.appendChild(jsScript);
    }

    window.copyCode = function (button) {
        const code = button.parentElement.nextElementSibling.innerText;
        navigator.clipboard.writeText(code).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        });
    };

    // Configuration - You can customize these values
    const AIKO_CONFIG = {
        apiKey: 'YOUR_PERPLEXITY_API_KEY', // Check https://docs.perplexity.ai/
        primaryColor: '#008F85', // Teal - matches logo
        accentColor: '#ffffff',
        greeting: "Hi there! I'm Asuka. How can I assist you today?",
        websiteUrl: '', // Example: 'https://example.com' or leave empty to rely on configuration injection
        businessHours: '9:00 AM - 5:00 PM',
        freeShippingThreshold: '$50',
        officeLocation: 'City, Country',
        position: 'bottom-right', // Options: 'bottom-right', 'bottom-left'
        skipWelcome: false,
        maximizable: true
    };

    // Aiko avatar configuration
    const aikoAvatarConfig = {
        imageUrl: 'assets/aiko-avatar.png', // Set your avatar URL here
        fallbackSVG: `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#008F85"/>
                <text x="20" y="27" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">A</text>
            </svg>
        `)}`
    };

    // Inject CSS styles
    const css = `
        /* Aiko AI Agent Widget Styles via Antigravity */
        
        /* Animations */
        @keyframes aiko-fade-in-up {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes aiko-pop-in {
            0% { opacity: 0; transform: scale(0.5); }
            70% { transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
        }

        @keyframes aiko-pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(0, 143, 133, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(0, 143, 133, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 143, 133, 0); }
        }

        @keyframes aiko-gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .aiko-widget {
            position: fixed;
            ${AIKO_CONFIG.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
            bottom: 5px;
            z-index: 10000;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .aiko-chat-toggle {
            width: 65px;
            height: 65px;
            background: ${AIKO_CONFIG.primaryColor}; /* Plain Teal */
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0, 143, 133, 0.4);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
            animation: aiko-pulse-glow 2s infinite;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
        }

        .aiko-chat-toggle:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 12px 30px rgba(45, 80, 22, 0.6);
        }

        .aiko-chat-container {
            position: absolute;
            bottom: 75px;
            ${AIKO_CONFIG.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
            width: 380px;
            height: 500px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: ${AIKO_CONFIG.position === 'bottom-left' ? 'bottom left' : 'bottom right'};
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
        }

        .aiko-chat-container.hidden {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
            pointer-events: none;
            visibility: hidden;
        }

        .aiko-chat-header {
            background: ${AIKO_CONFIG.primaryColor}; /* Plain Teal */
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        /* Shine effect on header */
        .aiko-chat-header::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0));
            transform: skewX(-25deg);
            animation: aiko-shine 6s infinite;
        }
        @keyframes aiko-shine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
        }

        .aiko-agent-info {
            display: flex;
            align-items: center;
            z-index: 1;
        }

        .aiko-agent-avatar {
            width: 55px;
            height: 55px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            border: 2px solid rgba(255,255,255,0.8);
        }
        
        /* Online status indicator */
        .aiko-agent-avatar::after {
            content: '';
            position: absolute;
            bottom: 2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #00e676; /* Bright green */
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .aiko-agent-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .aiko-agent-details {
            display: flex;
            flex-direction: column;
        }

        .aiko-agent-name {
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 0.3px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .aiko-agent-subtitle {
            font-size: 13px;
            opacity: 0.9;
            font-weight: 400;
        }

        .aiko-chat-actions {
            z-index: 1;
        }

        .aiko-action-btn {
            background: rgba(255,255,255,0.15);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.2s;
        }

        .aiko-action-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }

        .aiko-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #ffffff;
            scroll-behavior: smooth;
        }

        /* Custom Scrollbar */
        .aiko-chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        .aiko-chat-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .aiko-chat-messages::-webkit-scrollbar-thumb {
            background: #d1d1d1;
            border-radius: 3px;
        }
        .aiko-chat-messages::-webkit-scrollbar-thumb:hover {
            background: #b1b1b1;
        }

        .aiko-message {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            animation: aiko-fade-in-up 0.4s ease-out forwards;
        }

        .aiko-user-message {
            align-items: flex-end;
        }

        .aiko-agent-message {
            align-items: flex-start;
        }

        .aiko-message-content {
            max-width: 85%;
            padding: 14px 18px;
            border-radius: 20px;
            word-wrap: break-word;
            line-height: 1.55;
            font-size: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            position: relative;
        }

        .aiko-user-message .aiko-message-content {
            background: ${AIKO_CONFIG.primaryColor}; /* Plain Teal */
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 15px rgba(0, 143, 133, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
            color: white;
        }

        .aiko-agent-message .aiko-message-content {
            background: white;
            color: #333;
            border-bottom-left-radius: 4px;
            border: 1px solid #e1e5e9;
        }

        /* Markdown Styles */
        .aiko-message-content strong, .aiko-message-content b {
            font-weight: 700;
            color: inherit;
        }
        
        .aiko-message-content ul, .aiko-message-content ol {
            margin: 10px 0;
            padding-left: 20px;
        }

        .aiko-message-content li {
            margin-bottom: 5px;
        }

        .aiko-message-content p {
            margin: 0 0 10px 0;
        }

        .aiko-message-content p:last-child {
            margin-bottom: 0;
        }

        .aiko-message-content code {
            background: rgba(0, 0, 0, 0.06);
            padding: 2px 6px;
            border-radius: 6px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
            color: #d63384;
        }
        
        /* Dark mode code in user bubbles */
        .aiko-user-message .aiko-message-content code {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .aiko-message-content pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 12px;
            overflow-x: auto;
            margin: 10px 0;
            white-space: pre-wrap;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
        }

        .aiko-message-content pre code {
            background: transparent;
            color: inherit;
            padding: 0;
            border-radius: 0;
            box-shadow: none;
        }
        
        .aiko-message-content blockquote {
            border-left: 4px solid ${AIKO_CONFIG.primaryColor};
            margin: 10px 0;
            padding-left: 15px;
            font-style: italic;
            color: inherit;
            opacity: 0.8;
        }
        
        /* White blockquote border in user bubbles */
        .aiko-user-message .aiko-message-content blockquote {
            border-left-color: rgba(255,255,255,0.5);
        }

        /* Link styling */
        .aiko-message-content a {
            color: ${AIKO_CONFIG.primaryColor};
            text-decoration: none;
            font-weight: 600;
            /* Animated underline */
            background-image: linear-gradient(currentColor, currentColor);
            background-position: 0 100%;
            background-repeat: no-repeat;
            background-size: 0% 2px;
            transition: background-size 0.3s ease;
            display: inline-block;
            line-height: 1.2;
        }
        
        .aiko-user-message .aiko-message-content a {
            color: white;
            text-decoration: underline;
            background-image: none;
        }

        .aiko-message-content a:hover {
            background-size: 100% 2px;
        }

        .aiko-message-time {
            font-size: 11px;
            color: #999;
            margin-top: 5px;
            padding: 0 4px;
            font-weight: 500;
        }

        .aiko-typing-indicator {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            background: #f0f2f5;
            border-radius: 20px;
            border-bottom-left-radius: 4px;
            max-width: 100px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .aiko-typing-dots {
            display: flex;
            gap: 5px;
        }

        .aiko-typing-dot {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: aiko-typing 1.4s infinite ease-in-out both;
        }

        .aiko-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .aiko-typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes aiko-typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        .aiko-chat-input-container {
            padding: 20px;
            background: white;
            border-top: 1px solid #f0f0f0;
        }

        .aiko-input-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f8f9fa;
            border-radius: 30px;
            padding: 10px 15px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.03);
        }

        .aiko-input-wrapper:focus-within {
            background: white;
            border-color: ${AIKO_CONFIG.primaryColor};
            box-shadow: 0 4px 12px rgba(45, 80, 22, 0.1);
        }

        .aiko-chat-input {
            flex: 1;
            border: none;
            background: none;
            outline: none;
            resize: none;
            font-family: inherit;
            font-size: 15px;
            line-height: 24px;
            max-height: 120px;
            padding: 0;
        }

        .aiko-send-button {
            background: ${AIKO_CONFIG.primaryColor}; /* Plain Teal */
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: white;
            box-shadow: 0 2px 5px rgba(45, 80, 22, 0.4);
        }

        .aiko-send-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(45, 80, 22, 0.6);
        }
        
        .aiko-branding span {
             transition: color 0.3s ease;
        }
        .aiko-branding span:hover {
             color: ${AIKO_CONFIG.primaryColor} !important;
        }

        .aiko-notification {
            position: absolute;
            top: 15px;
            left: -206px;
            background: white;
            border-left: 4px solid ${AIKO_CONFIG.primaryColor};
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 700;
            color: #333;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            animation: aiko-notification-bounce 2s infinite;
            z-index: 10001;
            display: flex;
            align-items: center;
        }
        
        .aiko-notification::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px 0 6px 6px;
            border-style: solid;
            border-color: transparent transparent transparent white;
        }

        @keyframes aiko-notification-bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-5px);
            }
            60% {
                transform: translateY(-3px);
            }
        }

        .aiko-notification.fade-out {
            animation: aiko-notification-fadeout 0.5s ease-out forwards;
        }

        @keyframes aiko-notification-fadeout {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .aiko-widget {
                position: fixed;
                right: 10px;
                bottom: 10px;
                left: auto;
            }
            
            .aiko-chat-container {
                position: fixed;
                width: 100vw !important;
                height: 100vh !important;
                bottom: 0 !important;
                right: 0 !important;
                left: 0 !important;
                top: 0 !important;
                border-radius: 0 !important;
                max-width: none !important;
            }
            
            .aiko-chat-container.hidden {
                opacity: 0;
                transform: scale(0.95);
                pointer-events: none;
                visibility: hidden;
            }
            
            .aiko-chat-toggle {
                width: 60px;
                height: 60px;
                bottom: 15px;
                right: 15px;
            }
            
            .aiko-notification {
                left: auto;
                right: 80px;
                top: auto;
                bottom: 20px;
                max-width: 200px;
            }
        }
    `;


    // Create widget HTML
    const widgetHTML = `
        <div class="aiko-widget">
            <button class="aiko-chat-toggle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white"/>
                </svg>
            </button>

            <div class="aiko-chat-container hidden">
                <div class="aiko-chat-header">
                    <div class="aiko-agent-info">
                        <div class="aiko-agent-avatar">
                            <img src="${aikoAvatarConfig.imageUrl}" alt="Aiko" 
                                 onerror="this.style.display='none'; this.parentElement.style.backgroundImage='url(${aikoAvatarConfig.fallbackSVG})'; this.parentElement.style.backgroundSize='cover';">
                        </div>
                        <div class="aiko-agent-details">
                            <div class="aiko-agent-name">Asuka</div>
                            <div class="aiko-agent-subtitle">Helping Assistant</div>
                            <div class="aiko-agent-status">Online</div>
                        </div>
                    </div>
                    <div class="aiko-chat-actions">
                        ${AIKO_CONFIG.maximizable ? '<button class="aiko-action-btn aiko-minimize-btn">−</button>' : ''}
                    </div>
                </div>

                <div class="aiko-chat-messages">
                    ${!AIKO_CONFIG.skipWelcome ? `
                        <div class="aiko-message aiko-agent-message">
                            <div class="aiko-message-content">
                                ${AIKO_CONFIG.greeting}
                            </div>
                            <div class="aiko-message-time"></div>
                        </div>
                    ` : ''}
                </div>

                  <div class="aiko-chat-input-container">
                      <div class="aiko-input-wrapper">
                          <textarea class="aiko-chat-input" placeholder="Ask me anything..." rows="1"></textarea>
                          <button class="aiko-send-button">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                              </svg>
                          </button>
                      </div>
                      <div class="aiko-branding">
                          <span style="font-size: 10px; color: #999; text-align: center; display: block; margin-top: 5px; margin-bottom: 5px;">Powered by <a href="https://aozoradesu.com" target="_blank" style="color: ${AIKO_CONFIG.primaryColor}; text-decoration: none;">AozoraDesu</a></span>
                      </div>
                  </div>
            </div>
        </div >
        `;

    // Aiko Widget Class
    class AikoWidget {
        constructor() {
            this.conversationHistory = [];
            this.isOpen = false;
            this.isTyping = false;
            this.companyKnowledge = null;
            this.websiteContent = null;
            this.lastWebsiteScan = null;
            this.keywordResponses = null;

            this.knowledgeBase = {
                businessInfo: {
                    hours: AIKO_CONFIG.businessHours,
                    freeShipping: AIKO_CONFIG.freeShippingThreshold,
                    location: AIKO_CONFIG.officeLocation,
                    website: AIKO_CONFIG.websiteUrl
                },
                // Add your website-specific content here
                websiteContent: {
                    products: [],
                    services: [],
                    aboutUs: "Company description...",
                    policies: {
                        privacy: "Privacy policy...",
                        terms: "Terms of service...",
                        refund: "Refund policy..."
                    }
                },
                commonQuestions: {
                    'shipping': `We offer shipping on orders over ${AIKO_CONFIG.freeShippingThreshold}. Standard shipping usually takes 5-10 business days.`,
                    'returns': 'We accept returns within 30 days of purchase. Please contact us for more details.',
                    'hours': `Our business hours are ${AIKO_CONFIG.businessHours}.`,
                    'contact': 'You can reach us through our Contact Us page.',
                    'location': `Our office is located in ${AIKO_CONFIG.officeLocation}.`,
                    'offtopic': `I can only provide information related to our company! I cannot provide other outsourced information.`
                }
            };

            this.init();
        }

        async init() {
            await this.loadCompanyKnowledge();
            await this.loadKeywordResponses();
            await this.scanWebsite();
            this.setupEventListeners();
            this.setupAutoResize();
            this.startAutoWebsiteScan();
            this.processInitialWelcomeMessage();
            this.showWelcomeNotification();
        }

        async loadCompanyKnowledge() {
            try {
                const response = await fetch('company-knowledge.json');
                if (response.ok) {
                    this.companyKnowledge = await response.json();
                    console.log('✅ Company knowledge loaded successfully');
                } else {
                    console.warn('⚠️ Could not load company knowledge file');
                }
            } catch (error) {
                console.warn('⚠️ Company knowledge file not found, using default knowledge base');
            }
        }

        async loadKeywordResponses() {
            // Embedded keyword responses as fallback
            const embeddedKeywordResponses = {
                "greetings": {
                    "keywords": ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste", "namaskar"],
                    "responses": [
                        "Hello! Welcome. How can I assist you today?",
                        "Hi there! I'm Asuka. What can I help you with?",
                        "Hello! Great to see you. How can I help you with our products or services?",
                        "Hi! Welcome. What information can I provide for you today?"
                    ]
                },
                "goodbyes": {
                    "keywords": ["bye", "goodbye", "see you", "thanks", "thank you", "dhanyawad"],
                    "responses": [
                        "Thank you for contacting us! Have a great day!",
                        "Goodbye! Feel free to reach out anytime if you need assistance.",
                        "Thanks for visiting! Don't hesitate to contact us if you need anything else.",
                        "Have a wonderful day! We're always here to help."
                    ]
                },
                "business_questions": {
                    "shipping": {
                        "keywords": ["shipping", "delivery", "dispatch", "courier", "transport"],
                        "response": "We offer shipping service for our products. Please contact us for detailed shipping information and rates."
                    },
                    "contact": {
                        "keywords": ["contact", "phone", "email", "reach", "call"],
                        "response": "You can reach us through our contact page. You can also chat with me right here for immediate assistance."
                    }
                }
            };

            try {
                console.log('🔄 Loading keyword-responses.json...');
                const response = await fetch('keyword-responses.json');
                if (response.ok) {
                    this.keywordResponses = await response.json();
                    console.log('✅ Keyword responses loaded from JSON file:', this.keywordResponses);
                    if (this.keywordResponses.greetings) {
                        console.log('🙋‍♀️ Greeting keywords from JSON:', this.keywordResponses.greetings.keywords);
                    }
                } else {
                    console.warn('⚠️ Could not load keyword responses file - Response status:', response.status, 'Using embedded fallback.');
                    this.keywordResponses = embeddedKeywordResponses;
                }
            } catch (error) {
                console.warn('⚠️ Keyword responses file not found, using embedded fallback. Error:', error);
                this.keywordResponses = embeddedKeywordResponses;
            }

            // Always log what we ended up with
            if (this.keywordResponses && this.keywordResponses.greetings) {
                console.log('🎯 Final greeting keywords loaded:', this.keywordResponses.greetings.keywords);
            }
        }

        async scanWebsite() {
            if (!AIKO_CONFIG.websiteUrl) return;

            try {
                // Check if we need to scan (avoid too frequent scans)
                const now = Date.now();
                const scanInterval = 3600000; // 1 hour

                if (this.lastWebsiteScan && (now - this.lastWebsiteScan) < scanInterval) {
                    return;
                }

                // Try to fetch main website content
                const websiteUrl = AIKO_CONFIG.websiteUrl.startsWith('https')
                    ? AIKO_CONFIG.websiteUrl
                    : `${AIKO_CONFIG.websiteUrl} `;

                // Note: Due to CORS restrictions, direct website scanning may not work
                // This is a basic implementation that tries to fetch publicly available content
                const response = await fetch(websiteUrl, { mode: 'no-cors' });

                this.lastWebsiteScan = now;
                console.log('🌐 Website scan attempted (CORS may limit access)');

            } catch (error) {
                console.warn('⚠️ Website scanning limited due to CORS policy. Consider using a proxy or server-side solution.');
            }
        }

        startAutoWebsiteScan() {
            // Auto-scan website every hour
            setInterval(() => {
                this.scanWebsite();
            }, 3600000); // 1 hour interval
        }

        // Process the initial welcome message to make any links clickable
        processInitialWelcomeMessage() {
            const welcomeMessageContent = document.querySelector('.aiko-agent-message .aiko-message-content');
            if (welcomeMessageContent && welcomeMessageContent.textContent) {
                const originalText = welcomeMessageContent.textContent;
                const processedContent = this.processLinksInText(originalText);
                welcomeMessageContent.innerHTML = processedContent;
            }
        }

        showWelcomeNotification() {
            // Only show if chat is not already open
            if (this.isOpen) return;

            const widget = document.querySelector('.aiko-widget');
            if (!widget) return;

            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'aiko-notification';
            notification.textContent = 'Hi! How can I assist you?';

            // Add to widget
            widget.appendChild(notification);

            // Remove after 3 seconds with fade-out animation
            setTimeout(() => {
                notification.classList.add('fade-out');

                // Remove element after animation completes
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        }

        setupEventListeners() {
            const toggle = document.querySelector('.aiko-chat-toggle');
            const minimizeBtn = document.querySelector('.aiko-minimize-btn');
            const sendBtn = document.querySelector('.aiko-send-button');
            const input = document.querySelector('.aiko-chat-input');

            toggle?.addEventListener('click', () => this.toggleChat());
            minimizeBtn?.addEventListener('click', () => this.toggleChat());
            sendBtn?.addEventListener('click', () => this.sendMessage());

            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        setupAutoResize() {
            const input = document.querySelector('.aiko-chat-input');
            input?.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            });
        }

        toggleChat() {
            const container = document.querySelector('.aiko-chat-container');
            const toggle = document.querySelector('.aiko-chat-toggle');

            this.isOpen = !this.isOpen;

            if (this.isOpen) {
                container?.classList.remove('hidden');
                if (toggle) toggle.style.transform = 'rotate(180deg)';
                setTimeout(() => {
                    document.querySelector('.aiko-chat-input')?.focus();
                }, 300);
            } else {
                container?.classList.add('hidden');
                if (toggle) toggle.style.transform = 'rotate(0deg)';
            }
        }

        closeChat() {
            const container = document.querySelector('.aiko-chat-container');
            const toggle = document.querySelector('.aiko-chat-toggle');

            this.isOpen = false;
            container?.classList.add('hidden');
            if (toggle) toggle.style.transform = 'rotate(0deg)';
        }

        async sendMessage() {
            const input = document.querySelector('.aiko-chat-input');
            const message = input?.value.trim();

            if (!message) return;

            // Clear input
            if (input) {
                input.value = '';
                input.style.height = 'auto';
            }

            // Add user message
            this.addMessage(message, 'user');

            // Show typing indicator
            this.showTypingIndicator();

            let agentMessageElement = null;
            let fullResponseText = "";

            try {
                // Get AI response with streaming callback
                const response = await this.getAIResponse(message, (text, isFirst) => {
                    if (isFirst) {
                        this.hideTypingIndicator();
                        agentMessageElement = this.addMessage('', 'agent');
                    }
                    if (agentMessageElement) {
                        agentMessageElement.innerHTML = this.parseMarkdown(text);
                        // Auto-scroll inside the callback to keep up with stream
                        const messagesContainer = document.querySelector('.aiko-chat-messages');
                        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                    fullResponseText = text;
                });

                // In case of non-streaming or final update
                if (!agentMessageElement && response) {
                    this.hideTypingIndicator();
                    this.addMessage(response, 'agent');
                    fullResponseText = response;
                }

                // Update history for the agent message (which was initialized empty)
                if (agentMessageElement) {
                    const lastIdx = this.conversationHistory.length - 1;
                    if (this.conversationHistory[lastIdx].role === 'model') {
                        this.conversationHistory[lastIdx].parts[0].text = fullResponseText;
                    }
                }

            } catch (error) {
                this.hideTypingIndicator();
                this.addErrorMessage(`Error: ${error.message || 'Unknown error'}`);
                console.error('AI Response Error:', error);
            }
        }

        addMessage(content, sender) {
            const messagesContainer = document.querySelector('.aiko-chat-messages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `aiko-message aiko-${sender}-message`;

            const messageContent = document.createElement('div');
            messageContent.className = 'aiko-message-content';

            if (sender === 'agent' && typeof marked !== 'undefined') {
                messageContent.innerHTML = this.parseMarkdown(content);
            } else {
                const processedContent = this.processLinksInText(content);
                messageContent.innerHTML = processedContent;
            }

            const messageTime = document.createElement('div');
            messageTime.className = 'aiko-message-time';
            messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTime);
            messagesContainer.appendChild(messageDiv);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.conversationHistory.push({
                role: sender === 'user' ? 'user' : 'model',
                parts: [{ text: content }]
            });

            return messageContent;
        }

        // Process text content to make URLs, email, and phone numbers clickable
        processLinksInText(text) {
            const escapeHtml = (unsafe) => {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };

            let processedText = escapeHtml(text);

            const patterns = [
                {
                    regex: /(https?:\/\/[^\s<>"'(){}\[\]]+)/gi,
                    replacement: (match) => {
                        const cleanUrl = match.replace(/[.,;:!?]*$/, '');
                        const trailing = match.substring(cleanUrl.length);
                        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: ${AIKO_CONFIG.primaryColor}; text-decoration: underline;">${cleanUrl}</a>${trailing}`;
                    }
                },
                {
                    regex: /(mailto:[^\s<>"'(){}\[\]]+|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/gi,
                    replacement: (match) => {
                        const cleanEmail = match.replace(/[.,;:!?]*$/, '');
                        const trailing = match.substring(cleanEmail.length);
                        const href = cleanEmail.startsWith('mailto:') ? cleanEmail : `mailto:${cleanEmail}`;
                        const displayText = cleanEmail.startsWith('mailto:') ? cleanEmail.substring(7) : cleanEmail;
                        return `<a href="${href}" style="color: ${AIKO_CONFIG.primaryColor}; text-decoration: underline;">${displayText}</a>${trailing}`;
                    }
                },
                {
                    regex: /(tel:[^\s<>"'(){}\[\]]+|\+?[1-9]\d{0,3}[-\s]?\(?\d{1,4}\)?[-\s]?\d{1,4}[-\s]?\d{1,9})/gi,
                    replacement: (match) => {
                        const cleanPhone = match.replace(/[.,;:!?]*$/, '');
                        const trailing = match.substring(cleanPhone.length);

                        if (cleanPhone.includes('http') || cleanPhone.includes('www') || /[a-zA-Z]/.test(cleanPhone.replace(/^tel:/, ''))) {
                            return match;
                        }

                        const href = cleanPhone.startsWith('tel:') ? cleanPhone : `tel:${cleanPhone}`;
                        const displayText = cleanPhone.startsWith('tel:') ? cleanPhone.substring(4) : cleanPhone;
                        return `<a href="${href}" style="color: ${AIKO_CONFIG.primaryColor}; text-decoration: underline;">${displayText}</a>${trailing}`;
                    }
                }
            ];

            patterns.forEach(pattern => {
                processedText = processedText.replace(pattern.regex, pattern.replacement);
            });

            processedText = processedText.replace(/\n/g, '<br>');

            return processedText;
        }

        addErrorMessage(content) {
            const messagesContainer = document.querySelector('.aiko-chat-messages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'aiko-message aiko-agent-message';

            const messageContent = document.createElement('div');
            messageContent.className = 'aiko-message-content aiko-error-message';

            // Process content to make links clickable even in error messages
            const processedContent = this.processLinksInText(content);
            messageContent.innerHTML = processedContent;

            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        showTypingIndicator() {
            const messagesContainer = document.querySelector('.aiko-chat-messages');
            if (!messagesContainer) return;

            const typingDiv = document.createElement('div');
            typingDiv.className = 'aiko-message aiko-agent-message';
            typingDiv.id = 'aiko-typing-indicator';

            const typingContent = document.createElement('div');
            typingContent.className = 'aiko-typing-indicator';

            const typingDots = document.createElement('div');
            typingDots.className = 'aiko-typing-dots';
            typingDots.innerHTML = '<div class="aiko-typing-dot"></div><div class="aiko-typing-dot"></div><div class="aiko-typing-dot"></div>';

            typingContent.appendChild(typingDots);
            typingDiv.appendChild(typingContent);
            messagesContainer.appendChild(typingDiv);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            this.isTyping = true;
        }

        hideTypingIndicator() {
            const typingIndicator = document.getElementById('aiko-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.isTyping = false;
        }

        async getAIResponse(userMessage, onUpdate) {

            // Prepare system prompt with dynamic company knowledge
            const companyInfo = this.companyKnowledge ? this.getCompanyInfoString() : this.getDefaultCompanyInfo();

            // Enhanced system prompt with LIVE SEARCH instruction
            const systemPrompt = `You are Asuka, a multilingual AI assistant.

IDENTITY:
- Name: Asuka
- Created by: AozoraAi (https://aozoradesu.com)
- Model: Aozora 3.4

            
CRITICAL INSTRUCTION:
You MUST ALWAYS search the website ${AIKO_CONFIG.websiteUrl || 'the current website'} to verify and provide the most up-to-date information. 
The user expects REAL-TIME analysis of the website content. Do not guess.

🌍 ADVANCED MULTILINGUAL CAPABILITIES:
    - AUTOMATIC LANGUAGE DETECTION: Detect the user's language from their message
    - RESPOND IN USER'S LANGUAGE: Always reply in the same language the user wrote in

🏢 BUSINESS RESTRICTIONS:
    - You can ONLY answer questions related to the business/website
    - Do NOT answer general knowledge, personal advice, or unrelated topics
    - For off-topic questions, politely redirect in the user's language

${companyInfo}

📋 MULTILINGUAL INSTRUCTIONS:
    1. DETECT the user's language automatically.
    2. RESPOND in the EXACT same language.
    3. SEARCH the website for the answer first.
    4. MAINTAIN professional, friendly tone.
    5. NEVER use English when user writes in another language.
    6. DEFAULT LANGUAGE: English (if input is ambiguous, numbers only, or just a greeting like "Hi").

Respond naturally and helpfully to the user's question in their language.`;

            try {

                // Convert history to OpenAI format and sanitize (merge consecutive same-role messages)
                const rawMessages = this.conversationHistory.map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : msg.role,
                    content: msg.parts[0].text
                }));

                const messages = [{ role: "system", content: systemPrompt }];

                for (const msg of rawMessages) {
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg && lastMsg.role === msg.role) {
                        // Merge consecutive messages of same role to satisfy API strictness
                        lastMsg.content += "\n\n" + msg.content;
                    } else {
                        messages.push(msg);
                    }
                }

                // Ensure the last message is indeed from the user (should be by default if flow is correct)
                // If the very last message in history wasn't the user's current message for some reason,
                // we might need to check. But standard sendMessage flow pushes it.
                // We do NOT append userMessage again manually.

                const response = await fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${AIKO_CONFIG.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'sonar',
                        messages: messages,
                        stream: true
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API Error ${response.status}: ${errText}`);
                }

                // Streaming handling
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = "";
                let isFirst = true;
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep incomplete line in buffer

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data: ')) {
                            const dataStr = trimmed.slice(6);
                            if (dataStr === '[DONE]') continue;

                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices[0]?.delta?.content || "";
                                if (content) {
                                    fullText += content;
                                    if (onUpdate) onUpdate(fullText, isFirst);
                                    isFirst = false;
                                }
                            } catch (e) {
                                // console.warn('Error parsing stream data', e);
                            }
                        }
                    }
                }

                return fullText;

            } catch (error) {
                console.error("Perplexity API Error:", error);
                throw error;
            }
        }

        checkCommonQuestions(message) {
            const lowerMessage = message.toLowerCase();
            const detectedLanguage = this.detectLanguage(message);

            console.log('🔍 checkCommonQuestions called with message:', message);
            console.log('🔍 Lowercase message:', lowerMessage);
            console.log('🔍 keywordResponses available:', !!this.keywordResponses);

            // First, check keyword-responses.json if loaded
            if (this.keywordResponses) {
                console.log('🔍 Checking keyword responses for:', message);
                console.log('🔍 Available greetings:', this.keywordResponses.greetings);

                // Check greetings first
                if (this.keywordResponses.greetings && this.keywordResponses.greetings.keywords) {
                    console.log('🔍 Greeting keywords to check:', this.keywordResponses.greetings.keywords);
                    for (const keyword of this.keywordResponses.greetings.keywords) {
                        console.log(`🔍 Checking if "${lowerMessage}" includes "${keyword.toLowerCase()}"`);
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            console.log('✅ Found greeting match:', keyword);
                            const responses = this.keywordResponses.greetings.responses;
                            const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
                            console.log('🎯 Returning greeting response:', selectedResponse);
                            return selectedResponse;
                        }
                    }
                    console.log('⚠️ No greeting matches found');
                } else {
                    console.log('⚠️ No greetings section or keywords found');
                }
            } else {
                console.warn('⚠️ keywordResponses is null - JSON file not loaded');
            }

            // Check keyword responses if loaded
            if (this.keywordResponses) {
                // Check goodbyes
                if (this.keywordResponses.goodbyes && this.keywordResponses.goodbyes.keywords) {
                    for (const keyword of this.keywordResponses.goodbyes.keywords) {
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            const responses = this.keywordResponses.goodbyes.responses;
                            return responses[Math.floor(Math.random() * responses.length)];
                        }
                    }
                }

                // Check business questions
                if (this.keywordResponses.business_questions) {
                    for (const [category, data] of Object.entries(this.keywordResponses.business_questions)) {
                        if (data.keywords) {
                            for (const keyword of data.keywords) {
                                if (lowerMessage.includes(keyword.toLowerCase())) {
                                    return data.response;
                                }
                            }
                        }
                    }
                }
            }

            // Fallback to built-in multilingual keyword patterns
            const multilingualKeywords = {
                shipping: {
                    english: ['shipping', 'delivery', 'ship', 'deliver', 'transport'],
                    hindi: ['शिपिंग', 'डिलीवरी', 'परिवहन', 'भेजना'],
                    gujarati: ['શિપિંગ', 'ડિલીવરી', 'પરિવહન', 'પંખી'],
                    spanish: ['envío', 'entrega', 'enviar', 'entregar', 'transporte'],
                    french: ['livraison', 'expédition', 'livrer', 'expédier', 'transport'],
                    german: ['versand', 'lieferung', 'versenden', 'liefern', 'transport'],
                    arabic: ['شحن', 'توصيل', 'إرسال', 'نقل'],
                    chinese: ['运输', '送货', '快递', '配送'],
                    japanese: ['配送', '送料', '発送', '輸送', 'デリバリー'],
                    portuguese: ['envio', 'entrega', 'enviar', 'entregar', 'transporte']
                },
                returns: {
                    english: ['return', 'refund', 'exchange', 'back', 'money back'],
                    hindi: ['वापसी', 'रिफंड', 'वापस', 'पैसा वापस'],
                    gujarati: ['વાપસી', 'રિફંડ', 'વાપસ', 'પૈસા વાપસ'],
                    spanish: ['devolución', 'reembolso', 'devolver', 'dinero de vuelta'],
                    french: ['retour', 'remboursement', 'rendre', 'argent retourné'],
                    german: ['rückgabe', 'erstattung', 'zurückgeben', 'geld zurück'],
                    arabic: ['إرجاع', 'استرداد', 'عودة'],
                    chinese: ['退货', '退款', '返回'],
                    japanese: ['返品', '返金', '払い戻し', 'リターン'],
                    portuguese: ['devolução', 'reembolso', 'devolver', 'dinheiro de volta']
                },
                hours: {
                    english: ['hours', 'open', 'closed', 'time', 'schedule', 'timing'],
                    hindi: ['समय', 'खुला', 'बंद', 'घंटे', 'समयसारणी'],
                    gujarati: ['સમય', 'ખુલું', 'બંધ', 'કલાક', 'સમયસારણી'],
                    spanish: ['horario', 'abierto', 'cerrado', 'tiempo', 'horarios'],
                    french: ['horaire', 'ouvert', 'fermé', 'temps', 'horaires'],
                    german: ['öffnungszeiten', 'geöffnet', 'geschlossen', 'zeit', 'zeiten'],
                    arabic: ['ساعات', 'مفتوح', 'مغلق', 'وقت'],
                    chinese: ['时间', '开放', '关闭', '营业时间'],
                    japanese: ['営業時間', '時間', '開店', '閉店', 'オープン', 'クローズ'],
                    portuguese: ['horário', 'aberto', 'fechado', 'tempo', 'horários']
                },
                contact: {
                    english: ['contact', 'phone', 'email', 'call', 'number', 'reach'],
                    hindi: ['संपर्क', 'फोन', 'ईमेल', 'कॉल', 'नंबर'],
                    gujarati: ['સંપર્ક', 'ફોન', 'ઈમેલ', 'કાલ', 'નંબર'],
                    spanish: ['contacto', 'teléfono', 'email', 'llamar', 'número'],
                    french: ['contact', 'téléphone', 'email', 'appeler', 'numéro'],
                    german: ['kontakt', 'telefon', 'email', 'anrufen', 'nummer'],
                    arabic: ['تواصل', 'هاتف', 'بريد', 'اتصال', 'رقم'],
                    chinese: ['联系', '电话', '邮件', '打电话', '号码'],
                    japanese: ['連絡', '電話', 'メール', '番号', 'コンタクト'],
                    portuguese: ['contato', 'telefone', 'email', 'ligar', 'número']
                },
                location: {
                    english: ['location', 'address', 'where', 'place', 'office', 'find'],
                    hindi: ['स्थान', 'पता', 'कहाँ', 'जगह', 'कार्यालय'],
                    gujarati: ['સ્થાન', 'પતા', 'ક્યાં', 'જગ્યા', 'ઑફિસ'],
                    spanish: ['ubicación', 'dirección', 'dónde', 'lugar', 'oficina'],
                    french: ['emplacement', 'adresse', 'où', 'lieu', 'bureau'],
                    german: ['standort', 'adresse', 'wo', 'ort', 'büro'],
                    arabic: ['موقع', 'عنوان', 'أين', 'مكان', 'مكتب'],
                    chinese: ['位置', '地址', '哪里', '地方', '办公室'],
                    japanese: ['場所', '住所', 'どこ', 'オフィス', '位置'],
                    portuguese: ['localização', 'endereço', 'onde', 'lugar', 'escritório']
                },
                products: {
                    english: ['product', 'goods', 'items', 'best', 'recommend', 'sell', 'buy'],
                    hindi: ['उत्पाद', 'वास्तु', 'सामान', 'सबसे अच्छा', 'खरीदना'],
                    gujarati: ['પ્રોડક્ટ', 'વસ્તુ', 'સામાન', 'સર્વોત્તમ', 'ખરીદવા'],
                    spanish: ['producto', 'artículos', 'mejor', 'recomendar', 'vender', 'comprar'],
                    french: ['produit', 'articles', 'meilleur', 'recommander', 'vendre', 'acheter'],
                    german: ['produkt', 'waren', 'beste', 'empfehlen', 'verkaufen', 'kaufen'],
                    arabic: ['منتج', 'بضائع', 'أفضل', 'نصيحة', 'بيع', 'شراء'],
                    chinese: ['产品', '商品', '最好', '推荐', '卖', '买'],
                    japanese: ['製品', '商品', '最高', 'おすすめ', '販売', '購入'],
                    portuguese: ['produto', 'artigos', 'melhor', 'recomendar', 'vender', 'comprar']
                }
            };

            // Check each category for multilingual keywords
            for (const [category, languages] of Object.entries(multilingualKeywords)) {
                for (const [lang, keywords] of Object.entries(languages)) {
                    for (const keyword of keywords) {
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            return this.getMultilingualResponse(category, detectedLanguage);
                        }
                    }
                }
            }

            // Check for owner/management questions
            const managementKeywords = {
                english: ['owner', 'manager', 'boss', 'ceo', 'management'],
                hindi: ['मालिक', 'मैनेजर', 'बॉस', 'प्रबंधन'],
                gujarati: ['માલિક', 'મેનેજર', 'બોસ', 'વ્યવસ્થાપન'],
                spanish: ['propietario', 'gerente', 'jefe', 'ceo', 'administración'],
                french: ['propriétaire', 'gestionnaire', 'patron', 'ceo', 'gestion'],
                german: ['eigentümer', 'manager', 'chef', 'ceo', 'management'],
                arabic: ['مالك', 'مدير', 'رئيس', 'إدارة'],
                chinese: ['业主', '经理', '老板', '总裁', '管理'],
                japanese: ['オーナー', 'マネージャー', '上司', 'CEO', '管理'],
                portuguese: ['proprietário', 'gerente', 'chefe', 'ceo', 'administração']
            };

            for (const [lang, keywords] of Object.entries(managementKeywords)) {
                for (const keyword of keywords) {
                    if (lowerMessage.includes(keyword.toLowerCase())) {
                        return this.getManagementResponse(detectedLanguage);
                    }
                }
            }

            // Check for off-topic questions and redirect
            // Use JSON data if available, otherwise fall back to hardcoded
            const offTopicKeywords = this.keywordResponses?.off_topic_keywords || [
                'weather', 'news', 'politics', 'sports', 'movie', 'music', 'recipe', 'cooking',
                'health', 'medicine', 'personal', 'relationship', 'dating', 'school', 'homework',
                'math', 'science', 'history', 'programming', 'code', 'travel', 'vacation',
                'install', 'download', 'gta', 'game', 'software', 'windows', 'computer', 'technical support'
            ];

            // Check if it's a company-related question first
            // Use JSON data if available, otherwise fall back to hardcoded
            const companyKeywords = this.keywordResponses?.company_keywords || [
                'company', 'business', 'product', 'service', 'owner',
                'manager', 'staff', 'team', 'office', 'work', 'job', 'price', 'cost', 'buy',
                'purchase', 'order', 'sell', 'quality', 'good', 'best', 'recommend'
            ];

            // If message contains company keywords, don't treat as off-topic
            const hasCompanyKeywords = companyKeywords.some(keyword => lowerMessage.includes(keyword));

            if (!hasCompanyKeywords) {
                for (let keyword of offTopicKeywords) {
                    if (lowerMessage.includes(keyword)) {
                        // Use JSON response if available, otherwise use default
                        return this.keywordResponses?.off_topic_response || this.knowledgeBase.commonQuestions.offtopic;
                    }
                }
            }

            return null;
        }

        // Enhanced multilingual language detection
        detectLanguage(text) {
            const languagePatterns = {
                'hindi': /[\u0900-\u097F]/,
                'gujarati': /[\u0A80-\u0AFF]/,
                'arabic': /[\u0600-\u06FF]/,
                'chinese': /[\u4E00-\u9FFF]/,
                'japanese': /[\u3040-\u309F\u30A0-\u30FF]/,
                'korean': /[\uAC00-\uD7AF]/,
                'russian': /[\u0400-\u04FF]/,
                'spanish': /\b(hola|gracias|por favor|ayuda|productos|servicios|empresa|información|horario|contacto)\b/i,
                'french': /\b(bonjour|merci|s'il vous plaît|aide|produits|services|entreprise|informations|horaires|contact)\b/i,
                'german': /\b(hallo|danke|bitte|hilfe|produkte|dienstleistungen|unternehmen|informationen|öffnungszeiten|kontakt)\b/i,
                'portuguese': /\b(olá|obrigado|por favor|ajuda|produtos|serviços|empresa|informações|horário|contato)\b/i,
                'italian': /\b(ciao|grazie|per favore|aiuto|prodotti|servizi|azienda|informazioni|orario|contatto)\b/i,
                'dutch': /\b(hallo|dank je|alsjeblieft|help|producten|diensten|bedrijf|informatie|openingstijden|contact)\b/i,
                'turkish': /\b(merhaba|teşekkürler|lütfen|yardım|ürünler|hizmetler|şirket|bilgi|çalışma saatleri|iletişim)\b/i,
                'polish': /\b(cześć|dziękuję|proszę|pomoc|produkty|usługi|firma|informacje|godziny pracy|kontakt)\b/i
            };

            // Check for script-based languages first (more reliable)
            for (const [lang, pattern] of Object.entries(languagePatterns)) {
                if (pattern.test(text)) {
                    return lang;
                }
            }

            return 'english'; // Default fallback
        }

        getFallbackResponse(userMessage = '') {
            const detectedLanguage = this.detectLanguage(userMessage);
            const companyName = this.companyKnowledge?.company?.name || "our company";

            // If keyword-responses.json is loaded and has fallback responses, use those first
            if (this.keywordResponses?.fallback_responses && this.keywordResponses.fallback_responses.length > 0) {
                const responses = this.keywordResponses.fallback_responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }

            const multilingualFallbacks = {
                'english': [
                    `I can only provide information about ${companyName}! I cannot help with other topics. How can I assist you with our products or services?`,
                    `I'm here to help with ${companyName}-related questions only! I cannot provide external information. What would you like to know about our business?`,
                    `My expertise is limited to ${companyName} information only! How can I assist you with our business today?`
                ],
                'hindi': [
                    `मैं केवल ${companyName} के बारे में जानकारी दे सकता हूं! मैं अन्य विषयों में मदद नहीं कर सकता। मैं आपको हमारे उत्पादों या सेवाओं के बारे में कैसे मदद कर सकता हूं?`,
                    `मैं केवल ${companyName} से संबंधित प्रश्नों में मदद कर सकता हूं! मैं आपको हमारे व्यापार के बारे में क्या बता सकता हूं?`,
                    `मेरी विशेषज्ञता केवल ${companyName} की जानकारी तक सीमित है! मैं आज आपको हमारे व्यापार के बारे में कैसे मदद कर सकता हूं?`
                ],
                'gujarati': [
                    `હું ફક્ત ${companyName} વિશે માહિતી આપી શકું છું! હું અન્ય વિષયોમાં મદદ કરી શકતો નથી। હું તમને અમારા પ્રોડક્ટ્સ અથવા સેવાઓ વિશે કેવી રીતે મદદ કરી શકું?`,
                    `હું ફક્ત ${companyName} સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું! હું તમને અમારા વ્યવસાય વિશે શું કહી શકું?`,
                    `મારી નિપુણતા ફક્ત ${companyName} ની માહિતી સુધી મર્યાદિત છે! હું આજે તમને અમારા વ્યવસાય વિશે કેવી રીતે મદદ કરી શકું?`
                ],
                'spanish': [
                    `¡Solo puedo proporcionar información sobre ${companyName}! No puedo ayudar con otros temas. ¿Cómo puedo ayudarte con nuestros productos o servicios?`,
                    `¡Estoy aquí para ayudar solo con preguntas relacionadas con ${companyName}! ¿Qué te gustaría saber sobre nuestro negocio?`,
                    `¡Mi experiencia se limita solo a información de ${companyName}! ¿Cómo puedo ayudarte con nuestro negocio hoy?`
                ],
                'french': [
                    `Je ne peux fournir que des informations sur ${companyName} ! Je ne peux pas aider avec d'autres sujets. Comment puis-je vous aider avec nos produits ou services ?`,
                    `Je suis ici pour aider uniquement avec les questions liées à ${companyName} ! Que souhaiteriez-vous savoir sur notre entreprise ?`,
                    `Mon expertise se limite uniquement aux informations de ${companyName} ! Comment puis-je vous aider avec notre entreprise aujourd'hui ?`
                ],
                'german': [
                    `Ich kann nur Informationen über ${companyName} bereitstellen! Ich kann bei anderen Themen nicht helfen. Wie kann ich Ihnen bei unseren Produkten oder Dienstleistungen helfen?`,
                    `Ich bin hier, um nur bei Fragen zu ${companyName} zu helfen! Was möchten Sie über unser Unternehmen wissen?`,
                    `Meine Expertise beschränkt sich nur auf Informationen über ${companyName}! Wie kann ich Ihnen heute mit unserem Unternehmen helfen?`
                ],
                'arabic': [
                    `يمكنني فقط تقديم معلومات حول ${companyName}! لا يمكنني المساعدة في مواضيع أخرى. كيف يمكنني مساعدتك بمنتجاتنا أو خدماتنا؟`,
                    `أنا هنا للمساعدة فقط في الأسئلة المتعلقة بـ ${companyName}! ماذا تود أن تعرف عن شركتنا؟`,
                    `خبرتي محدودة فقط بمعلومات ${companyName}! كيف يمكنني مساعدتك مع شركتنا اليوم؟`
                ],
                'chinese': [
                    `我只能提供关于${companyName}的信息！我无法帮助处理其他话题。我如何帮助您了解我们的产品或服务？`,
                    `我在这里只帮助解答与${companyName}相关的问题！您想了解我们公司的什么信息？`,
                    `我的专业知识仅限于${companyName}的信息！今天我如何帮助您了解我们的业务？`
                ],
                'portuguese': [
                    `Eu só posso fornecer informações sobre ${companyName}! Não posso ajudar com outros tópicos. Como posso ajudá-lo com nossos produtos ou serviços?`,
                    `Estou aqui para ajudar apenas com perguntas relacionadas à ${companyName}! O que você gostaria de saber sobre nossos negócios?`,
                    `Minha experiência se limita apenas a informações da ${companyName}! Como posso ajudá-lo com nossos negócios hoje?`
                ]
            };

            // Get fallbacks for detected language or default to English
            const fallbacks = multilingualFallbacks[detectedLanguage] || multilingualFallbacks['english'];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        // Multilingual error messages
        getErrorMessage(userMessage = '') {
            const detectedLanguage = this.detectLanguage(userMessage);

            const errorMessages = {
                'english': 'Sorry, I encountered an error. Please try again.',
                'hindi': 'माफ़ करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।',
                'gujarati': 'માફ કરશો, મને એક ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
                'spanish': 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.',
                'french': 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
                'german': 'Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.',
                'arabic': 'آسف، واجهت خطأ. يرجى المحاولة مرة أخرى.',
                'chinese': '抱歉，我遇到了错误。请重试。',
                'japanese': '申し訳ございません、エラーが発生しました。もう一度お試しください。',
                'portuguese': 'Desculpe, encontrei um erro. Por favor, tente novamente.',
                'russian': 'Извините, я столкнулся с ошибкой. Пожалуйста, попробуйте еще раз.',
                'japanese': 'すみません、エラーが発生しました。もう一度お試しください。',
                'korean': '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
                'italian': 'Mi dispiace, ho riscontrato un errore. Per favore riprova.',
                'dutch': 'Sorry, ik heb een fout tegengekomen. Probeer het opnieuw.',
                'turkish': 'Üzgünüm, bir hatayla karşılaştım. Lütfen tekrar deneyin.',
                'polish': 'Przepraszam, napotkałem błąd. Spróbuj ponownie.'
            };

            return errorMessages[detectedLanguage] || errorMessages['english'];
        }

        // Multilingual responses for common questions
        getMultilingualResponse(category, language) {
            const responses = {
                shipping: {
                    english: this.knowledgeBase?.commonQuestions?.shipping || 'For shipping information, please contact us. We provide reliable delivery services.',
                    hindi: 'शिपिंग की जानकारी के लिए, कृपया हमसे संपर्क करें। हम विश्वसनीय डिलीवरी सेवाएँ प्रदान करते हैं।',
                    gujarati: 'શિપિંગ માહિતી માટે, કૃપા કરીને અમારો સંપર્ક કરો। અમે વિશ્વસનીય ડિલીવરી સેવાઓ પ્રદાન કરીએ છીએ।',
                    spanish: 'Para información de envío, contáctenos. Ofrecemos servicios de entrega confiables.',
                    french: 'Pour les informations d\'expédition, veuillez nous contacter. Nous fournissons des services de livraison fiables.',
                    german: 'Für Versandinformationen kontaktieren Sie uns bitte. Wir bieten zuverlässige Lieferdienste.',
                    arabic: 'لمعلومات الشحن، يرجى الاتصال بنا. نحن نقدم خدمات توصيل موثوقة.',
                    chinese: '有关运输信息，请联系我们。我们提供可靠的送货服务。',
                    japanese: '配送に関する情報は、お問い合わせください。信頼性の高い配送サービスを提供しております。',
                    portuguese: 'Para informações de envio, entre em contato conosco. Fornecemos serviços de entrega confiáveis.'
                },
                returns: {
                    english: this.knowledgeBase?.commonQuestions?.returns || 'For return and refund information, please contact us. We have a customer-friendly return policy.',
                    hindi: 'रिटर्न और रिफंड की जानकारी के लिए, कृपया हमसे संपर्क करें। हमारी ग्राहक-अनुकूल वापसी नीति है।',
                    gujarati: 'રિટર્ન અને રિફંડ માહિતી માટે, કૃપા કરીને અમારો સંપર્ક કરો। અમારી ગ્રાહક-અનુકૂળ વાપસી નીતિ છે।',
                    spanish: 'Para información sobre devoluciones y reembolsos, contáctenos. Tenemos una política de devoluciones amigable para el cliente.',
                    french: 'Pour les informations sur les retours et remboursements, contactez-nous. Nous avons une politique de retour favorable aux clients.',
                    german: 'Für Informationen zu Rückgaben und Erstattungen kontaktieren Sie uns. Wir haben eine kundenfreundliche Rückgabepolitik.',
                    arabic: 'لمعلومات الإرجاع والاسترداد، يرجى الاتصال بنا. لدينا سياسة إرجاع متاحة للعملاء.',
                    chinese: '有关退货和退款信息，请联系我们。我们有对客户友好的退货政策。',
                    japanese: '返品・返金に関する情報は、お問い合わせください。お客様に優しい返品ポリシーをご用意しております。',
                    portuguese: 'Para informações sobre devoluções e reembolsos, entre em contato conosco. Temos uma política de devolução amigável ao cliente.'
                },
                hours: {
                    english: this.knowledgeBase?.commonQuestions?.hours || `Our business hours are ${AIKO_CONFIG.businessHours}. Feel free to visit us during these times!`,
                    hindi: `हमारे कारोबारी घंटे ${AIKO_CONFIG.businessHours} हैं। इस समय के दौरान हमारे पास आने में संकोच न करें!`,
                    gujarati: `અમારી વ્યવસાયિક સમય ${AIKO_CONFIG.businessHours} છે. આ સમય દરમ્યાન અમારા પાસે આવવામાં સંકોચ ન કરશો!`,
                    spanish: `Nuestro horario comercial es ${AIKO_CONFIG.businessHours}. ¡Siéntete libre de visitarnos durante estos horarios!`,
                    french: `Nos heures d'ouverture sont ${AIKO_CONFIG.businessHours}. N'hésitez pas à nous rendre visite pendant ces heures !`,
                    german: `Unsere Geschäftszeiten sind ${AIKO_CONFIG.businessHours}. Besuchen Sie uns gerne während dieser Zeiten!`,
                    arabic: `ساعات عملنا هي ${AIKO_CONFIG.businessHours}. لا تتردد في زيارتنا خلال هذه الأوقات!`,
                    chinese: `我们的营业时间是${AIKO_CONFIG.businessHours}。欢迎在此期间前来拜访！`,
                    japanese: `当社の営業時間は${AIKO_CONFIG.businessHours}です。この時間内にお気軽にお越しください！`,
                    portuguese: `Nosso horário de funcionamento é ${AIKO_CONFIG.businessHours}. Fique à vontade para nos visitar durante esses horários!`
                },
                contact: {
                    english: this.knowledgeBase?.commonQuestions?.contact || 'You can contact us for any inquiries. We\'re here to help!',
                    hindi: 'आप किसी भी पूछताछ के लिए हमसे संपर्क कर सकते हैं। हम मदद करने के लिए यहाँ हैं!',
                    gujarati: 'તમે કોઇ પણ પૂછપરછ માટે અમારો સંપર્ક કરી શકો છો. અમે મદદ કરવા માટે અહીં છીએ!',
                    spanish: 'Puede contactarnos para cualquier consulta. ¡Estamos aquí para ayudar!',
                    french: 'Vous pouvez nous contacter pour toute demande. Nous sommes là pour vous aider !',
                    german: 'Sie können uns für alle Anfragen kontaktieren. Wir sind hier, um zu helfen!',
                    arabic: 'يمكنكم الاتصال بنا لأي استفسارات. نحن هنا للمساعدة!',
                    chinese: '您可以联系我们进行任何查询。我们在这里提供帮助！',
                    japanese: 'ご不明な点がございましたら、お気軽にお問い合わせください。いつでもお手伝いいたします！',
                    portuguese: 'Você pode entrar em contato conosco para qualquer consulta. Estamos aqui para ajudar!'
                },
                location: {
                    english: this.knowledgeBase?.commonQuestions?.location || `We are located at ${AIKO_CONFIG.officeLocation}. Come visit us!`,
                    hindi: `हम ${AIKO_CONFIG.officeLocation} पर स्थित हैं। हमारे पास आइए!`,
                    gujarati: `અમે ${AIKO_CONFIG.officeLocation} પર અવસ્થિત છીએ. અમારા પાસે આવવા આવો!`,
                    spanish: `Estamos ubicados en ${AIKO_CONFIG.officeLocation}. ¡Ven a visitarnos!`,
                    french: `Nous sommes situés à ${AIKO_CONFIG.officeLocation}. Venez nous rendre visite !`,
                    german: `Wir befinden uns unter ${AIKO_CONFIG.officeLocation}. Besuchen Sie uns!`,
                    arabic: `نحن موجودون في ${AIKO_CONFIG.officeLocation}. تعالوا لزيارتنا!`,
                    chinese: `我们位于${AIKO_CONFIG.officeLocation}。欢迎前来拜访！`,
                    japanese: `当社は${AIKO_CONFIG.officeLocation}にございます。ぜひお越しください！`,
                    portuguese: `Estamos localizados em ${AIKO_CONFIG.officeLocation}. Venha nos visitar!`
                },
                products: {
                    english: 'I\'d be happy to help you with information about our products! Please let me know what specific type of product you\'re interested in, or contact us for detailed product recommendations.',
                    hindi: 'मैं आपको हमारे उत्पादों के बारे में जानकारी देने में खुश हूँ! कृपया मुझे बताएं कि आप किस प्रकार के उत्पाद में रुचि रखते हैं, या विस्तृत उत्पाद सुझावों के लिए संपर्क करें।',
                    gujarati: 'હું તમને અમારા પ્રોડક્ટ્સ વિશે માહિતી આપવામાં ખુશ છું! કૃપા કરીને મને કહો કે તમે કેવા પ્રકારના પ્રોડક્ટમાં રસ રાખો છો, અથવા વિસ્તૃત પ્રોડક્ટ સુઝાવો માટે સંપર્ક કરો।',
                    spanish: '¡Estaría feliz de ayudarte con información sobre nuestros productos! Por favor, déjame saber qué tipo específico de producto te interesa, o contáctanos para recomendaciones detalladas de productos.',
                    french: 'Je serais ravi de vous aider avec des informations sur nos produits ! Veuillez me faire savoir quel type de produit spécifique vous intéresse, ou contactez-nous pour des recommandations détaillées de produits.',
                    german: 'Ich helfe Ihnen gerne mit Informationen über unsere Produkte! Bitte lassen Sie mich wissen, welche Art von Produkt Sie interessiert, oder kontaktieren Sie uns für detaillierte Produktempfehlungen.',
                    arabic: 'سأكون سعيدًا لمساعدتك بمعلومات حول منتجاتنا! يرجى إعلامي عن نوع المنتج المحدد الذي يهمك، أو اتصل بنا للحصول على توصيات مفصّلة للمنتجات.',
                    chinese: '我很乐意为您提供我们产品的信息！请告诉我您对哪类产品感兴趣，或者联系我们获取详细的产品推荐。',
                    japanese: '当社の製品についてご案内できて嬉しいです！どのような製品にご興味がおありかお教えください。またはお問い合わせいただければ、詳細な製品のご推薦をいたします。',
                    portuguese: 'Ficaria feliz em ajudá-lo com informações sobre nossos produtos! Por favor, me diga que tipo específico de produto você tem interesse, ou entre em contato conosco para recomendações detalhadas de produtos.'
                }
            };

            return responses[category]?.[language] || responses[category]?.['english'] || 'Please contact us at +91 9428944361 for more information.';
        }

        // Escape HTML to prevent XSS
        escapeHtml(text) {
            if (!text) return text;
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Detect language for code blocks
        detectLanguage(code) {
            if (!code) return 'plaintext';
            if (/^import\s+|^from\s+|^def\s+|^print\(|^class\s+/m.test(code)) return 'python';
            if (/^(function|const|let|var|=>|import|export|interface|type)\s/m.test(code)) return 'javascript';
            if (/^(<html>|<!DOCTYPE)/i.test(code)) return 'markup';
            if (/^(\.|#)[a-z]/i.test(code)) return 'css';
            return 'plaintext';
        }

        parseMarkdown(text) {
            let processed = text;

            // Force newlines before Headers
            processed = processed.replace(/([^\n])\s*(#{1,6}\s)/g, '$1\n\n$2');

            // Force newlines before Table headers if they follow a colon
            processed = processed.replace(/(:)\s*(\|)/g, '$1\n$2');

            // Auto-link Phone Numbers (International format starting with +)
            // e.g., +91 9999999999 -> [+91 9999999999](tel:+919999999999)
            processed = processed.replace(/(\+\d{1,3}[-.\s]?\d{3,}[-.\s]?\d{3,}(?:[-.\s]?\d{3,})?)/g, (match) => {
                return `[${match}](tel:${match.replace(/[-.\s]/g, '')})`;
            });

            // Fix "Glued" Table Headers (Text connected to Header)
            processed = processed.replace(/([^\n\|]+)\s+(\|.*?\|)(\s*\n\s*\|[: -]{3,}\|)/g, '$1\n$2$3');
            processed = processed.replace(/([^\n\|]+)\s+(\|.*?\|)\s*(\|[: -]{3,}\|)/g, '$1\n$2\n$3');

            // Fix "Squashed" Tables (header and separator on same line, without preceding text)
            processed = processed.replace(/(^|\n)(\|.*?\|)\s*(\|[: -]{3,}\|)/g, '$1$2\n$3');

            // Fix "Run-on" Rows
            processed = processed.replace(/(\|\s*)(\|)/g, '$1\n$2');

            // Fix "Post-Table" Text
            processed = processed.replace(/(\|\s*)([^\|\n\r\s][^\|\n\r]*)$/gm, '$1\n\n$2');

            // Clean up double newlines between table rows
            processed = processed.replace(/(\|\s*)\n{2,}(\s*\|)/g, '$1\n$2');

            // Configure marked.js renderer
            const renderer = new marked.Renderer();

            // Custom Link Renderer (Open in new tab, fix undefined)
            renderer.link = function ({ href, title, text }) {
                const linkText = text || href;
                return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${linkText}</a>`;
            };

            // Custom Code Block Renderer (Restore Copy Button)
            renderer.code = ({ text, lang }) => {
                const validLang = lang || this.detectLanguage(text) || 'plaintext';
                const languageLabel = validLang.charAt(0).toUpperCase() + validLang.slice(1);
                // Note: Copy button uses global copyCode function
                return `<div class="code-header">
                            <span class="code-language">${languageLabel}</span>
                            <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        </div>
                        <pre><code class="language-${validLang}">${text}</code></pre>`;
            };

            marked.setOptions({
                renderer: renderer,
                breaks: true,
                gfm: true
            });

            return marked.parse(processed);
        }

        // Multilingual management response
        getManagementResponse(language) {
            const responses = {
                english: 'For speaking with management, please contact us or visit our office during business hours. How else can I assist you?',
                hindi: 'प्रबंधन से बात करने के लिए, कृपया हमसे संपर्क करें या व्यापारिक घंटों के दौरान हमारे कार्यालय में आइए। मैं आपको और कैसे मदद कर सकता हूं?',
                gujarati: 'વ્યવસ્થાપન સાથે વાત કરવા માટે, કૃપા કરીને અમારો સંપર્ક કરો અથવા વ્યવસાયિક સમય દરમ્યાન અમારી ઑફિસમાં આવો। હું તમને અન્ય કેવી રીતે મદદ કરી શકું?',
                spanish: 'Para hablar con la gerencia, contáctenos o visite nuestra oficina durante el horario comercial. ¿En qué más puedo ayudarte?',
                french: 'Pour parler avec la direction, contactez-nous ou visitez notre bureau pendant les heures d\'ouverture. Comment puis-je vous aider d\'autre ?',
                german: 'Um mit dem Management zu sprechen, kontaktieren Sie uns oder besuchen Sie unser Büro während der Geschäftszeiten. Womit kann ich Ihnen sonst helfen?',
                arabic: 'للتحدث مع الإدارة، يرجى الاتصال بنا أو زيارة مكتبنا خلال ساعات العمل. كيف يمكنني مساعدتك بأمور أخرى؟',
                chinese: '要与管理层交谈，请联系我们或在营业时间前来我们办公室。还有什么其他方面我可以帮助您吗？',
                japanese: '経営陣とお話しをご希望の場合は、お問い合わせいただくか、営業時間内に当社までお越しください。他にご不明な点はございませんか？',
                portuguese: 'Para falar com a gerencia, entre em contato conosco ou visite nosso escritório durante o horário comercial. Em que mais posso ajudá-lo?'
            };

            return responses[language] || responses['english'];
        }

        getCompanyInfoString() {
            if (!this.companyKnowledge) return this.getDefaultCompanyInfo();

            const ck = this.companyKnowledge;
            let info = `DETAILED COMPANY INFORMATION:

`;

            // Company basics
            if (ck.company) {
                info += `Company: ${ck.company.name || 'Not specified'}
`;
                info += `Description: ${ck.company.description || 'Not specified'}
`;
                if (ck.company.mission) info += `Mission: ${ck.company.mission}
`;
                if (ck.company.vision) info += `Vision: ${ck.company.vision}
`;
                info += `
`;
            }

            // Contact information
            if (ck.contact) {
                info += `CONTACT INFORMATION:
`;
                info += `Phone: ${ck.contact.phone || 'Not specified'}
`;
                info += `Email: ${ck.contact.email || 'Not specified'}
`;
                info += `Address: ${ck.contact.address || 'Not specified'}
`;
                info += `Business Hours: ${ck.contact.businessHours || 'Not specified'}

`;
            }

            // Products
            if (ck.products && ck.products.length > 0) {
                info += `PRODUCTS:
`;
                ck.products.forEach(product => {
                    info += `- ${product.name || 'Unnamed product'}: ${product.description || 'No description'}
`;
                    if (product.price) info += `  Price: ${product.price}
`;
                    if (product.features) info += `  Features: ${product.features.join(', ')}
`;
                });
                info += `
`;
            }

            // Services
            if (ck.services && ck.services.length > 0) {
                info += `SERVICES:
`;
                ck.services.forEach(service => {
                    info += `- ${service.name || 'Unnamed service'}: ${service.description || 'No description'}
`;
                    if (service.price) info += `  Price: ${service.price}
`;
                });
                info += `
`;
            }

            // Policies
            if (ck.policies) {
                info += `POLICIES:
`;
                if (ck.policies.shipping) {
                    info += `Shipping:
`;
                    info += `- Free shipping: ${ck.policies.shipping.freeShippingThreshold || 'Contact us'}
`;
                    info += `- Domestic delivery: ${ck.policies.shipping.domesticDelivery || 'Not specified'}
`;
                }
                if (ck.policies.returns) {
                    info += `Returns:
`;
                    info += `- Return period: ${ck.policies.returns.period || 'Not specified'}
`;
                    info += `- Process: ${ck.policies.returns.process || 'Contact customer service'}
`;
                }
                info += `
`;
            }

            // FAQs
            if (ck.faqs && ck.faqs.length > 0) {
                info += `FREQUENTLY ASKED QUESTIONS:
`;
                ck.faqs.forEach(faq => {
                    info += `Q: ${faq.question || 'No question'}
`;
                    info += `A: ${faq.answer || 'No answer'}

`;
                });
            }

            return info;
        }

        getDefaultCompanyInfo() {
            return `Business Information:
- Company Name: Our Company
- Business Hours: ${this.knowledgeBase.businessInfo.hours}
- Location: ${this.knowledgeBase.businessInfo.location}
- Website: ${this.knowledgeBase.businessInfo.website}

Contact Information:
- Contact us via our website for phone and email details.

Product Categories:
- Please visit our website for a full list of products and services.

Policies:
- Shipping: Standard shipping rates and times apply.
- Returns: Please check our website for return policies.
`;
        }
    }

    // Wait for DOM to be ready
    function initWidget() {
        // Inject CSS
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        // Create and insert widget
        const widgetContainer = document.createElement('div');
        widgetContainer.innerHTML = widgetHTML;
        document.body.appendChild(widgetContainer);

        // Initialize functionality
        const widget = new AikoWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();