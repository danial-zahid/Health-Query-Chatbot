// --- DOM Elements ---
const chatBody = document.getElementById('chat-body');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const skyBg = document.getElementById('sky-bg');
const newChatBtn = document.getElementById('new-chat-btn');

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Generate Floating Clouds ---
function createClouds() {
    if (!skyBg) return;
    for(let i = 0; i < 6; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        
        // Random sizes for variety
        const size = Math.random() * 200 + 100; 
        cloud.style.width = size + 'px';
        cloud.style.height = (size * 0.6) + 'px';
        
        // Random vertical position
        cloud.style.top = Math.random() * 80 + '%';
        
        // Random animation speed (40s to 80s)
        const duration = Math.random() * 40 + 40;
        cloud.style.animation = `floatCloud ${duration}s linear infinite`;
        
        // Stagger start positions so they don't all start at the right edge
        cloud.style.animationDelay = `-${Math.random() * duration}s`;
        
        skyBg.appendChild(cloud);
    }
}
createClouds();

if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        userInput.value = '';
        document.querySelectorAll('.chat-body .message').forEach((el) => el.remove());
        if (welcomeScreen) {
            welcomeScreen.style.display = '';
        }
        if (sidebar) sidebar.classList.remove('active');
        userInput.focus();
    });
}

// --- Theme Toggle (Dark/Light Mode) ---
themeToggle.addEventListener('click', () => {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
    }
});

// --- Sidebar Toggle (Mobile) ---
sidebarToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); });

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// --- Chat Logic ---
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    appendMessage(text, 'user');
    userInput.value = '';

    showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            removeTypingIndicator();
            typeMessage("❌ Invalid response from server.");
            return;
        }
        removeTypingIndicator();
        if (!response.ok) {
            typeMessage(data.response || `Server error (${response.status}).`);
            return;
        }
        typeMessage(data.response || "No reply from server.");
    } catch (error) {
        removeTypingIndicator();
        typeMessage("❌ Connection error. Please check if the server is running.");
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    const icon = sender === 'bot' ? 'fa-robot' : 'fa-user';
    const safeText = escapeHtml(text);
    div.innerHTML = `<div class="msg-avatar"><i class="fa-solid ${icon}"></i></div><div class="msg-bubble">${safeText}</div>`;
    chatBody.appendChild(div);
    scrollToBottom();
}

function typeMessage(text) {
    const div = document.createElement('div');
    div.classList.add('message', 'bot');
    div.innerHTML = `<div class="msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-bubble"></div>`;
    chatBody.appendChild(div);
    
    const bubble = div.querySelector('.msg-bubble');
    let index = 0;

    function type() {
        if (index < text.length) {
            bubble.textContent += text.charAt(index);
            index++;
            scrollToBottom();
            setTimeout(type, 20);
        }
    }
    type();
}

function showTypingIndicator() {
    const div = document.createElement('div');
    div.classList.add('message', 'bot');
    div.setAttribute('id', 'typing-indicator');
    div.innerHTML = `<div class="msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-bubble typing-indicator"><span></span><span></span><span></span></div>`;
    chatBody.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() { chatBody.scrollTop = chatBody.scrollHeight; }

function useSuggestion(text) {
    userInput.value = text;
    void sendMessage();
}