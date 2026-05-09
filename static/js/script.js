// --- DOM Elements ---
const chatBody = document.getElementById('chat-body');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const skyBg = document.getElementById('sky-bg');

// --- Generate Floating Clouds ---
function createClouds() {
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

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    appendMessage(text, 'user');
    userInput.value = '';
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        const botResponse = generateMockResponse(text);
        typeMessage(botResponse);
    }, 1500);
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    const icon = sender === 'bot' ? 'fa-robot' : 'fa-user';
    div.innerHTML = `<div class="msg-avatar"><i class="fa-solid ${icon}"></i></div><div class="msg-bubble">${text}</div>`;
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

function useSuggestion(text) { userInput.value = text; sendMessage(); }

function generateMockResponse(query) {
    if (query.toLowerCase().includes('sore throat')) {
        return "A sore throat can be caused by viral infections (like colds), bacterial infections, allergies, or dry air. Resting your voice and drinking warm liquids can help. If it persists, consult a doctor.";
    } else if (query.toLowerCase().includes('paracetamol')) {
        return "Paracetamol is generally safe for children when given in the correct dosage based on their weight and age. However, always consult a pediatrician before administering any medication to a child.";
    } else {
        return "I am processing your query. As a mock UI, my responses are limited right now. Once connected to the Nura Health backend AI, I will provide detailed health insights based on your questions.";
    }
}