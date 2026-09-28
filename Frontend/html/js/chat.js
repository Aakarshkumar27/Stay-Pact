/**
 * StayPact - Real-time Chat & Negotiation Controller
 */

let activeRecipient = null;
let currentMessages = [];
let socket = null;

document.addEventListener('DOMContentLoaded', () => {
  initSocket();
  initChatUI();
});

function initSocket() {
  if (typeof io !== 'undefined' && window.location.protocol.startsWith('http')) {
    try {
      socket = io(window.location.origin);
      const user = API.getCurrentUser();
      if (user && user._id) {
        socket.emit('register_user', user._id);
      }

      socket.on('receive_message', (msg) => {
        if (activeRecipient && (msg.senderId === activeRecipient._id || msg.receiverId === activeRecipient._id)) {
          appendMessage(msg.text, 'incoming', msg.createdAt);
        }
      });
    } catch (e) {
      console.log('Socket.io running in offline mode');
    }
  }
}

function initChatUI() {
  const user = API.getCurrentUser();
  if (!user) {
    const main = document.querySelector('.chat-window-card');
    if (main) {
      main.innerHTML = `
        <div style="text-align: center; padding: 4.5rem 1.5rem; width: 100%;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; font-size: 1.5rem;">
            <i class="fa-regular fa-comments"></i>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A;">Sign in to access Live Negotiations</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 8px auto 0; max-width: 460px;">
            Create an account or sign in to chat directly with verified renters and landlords regarding custom clauses.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
            <a href="login.html?tab=login&redirect=chat.html" class="btn btn-primary">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </a>
            <a href="login.html?tab=signup&redirect=chat.html" class="btn btn-outline">
              <i class="fa-solid fa-user-plus"></i> Create Account
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get('userId');
  const isLandlord = user.role === 'landlord';

  // Seeded conversations
  const conversations = isLandlord ? [
    {
      _id: 'user-bachelor-1',
      name: 'Arjun Mehta',
      role: 'tenant',
      tenantType: 'bachelor',
      occupation: 'Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      lastMessage: 'Hi Rajesh! Is the Koramangala 1BHK available for move-in next week?',
    },
    {
      _id: 'user-family-1',
      name: 'Priya & Vikram Malhotra',
      role: 'tenant',
      tenantType: 'family',
      occupation: 'Marketing Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      lastMessage: 'We submitted a booking request for the 3BHK HSR layout flat.',
    }
  ] : [
    {
      _id: 'user-landlord-1',
      name: 'Rajesh Sharma',
      role: 'landlord',
      occupation: 'Property Owner (10+ Yrs)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      lastMessage: 'Welcome! I have confirmed your mutual agreement terms on the portal.',
    },
    {
      _id: 'user-landlord-2',
      name: 'Ananya Deshmukh',
      role: 'landlord',
      occupation: 'Architect & Host',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      lastMessage: 'All mutual terms look good. Feel free to sign the agreement anytime.',
    }
  ];

  renderThreadList(conversations);

  let initialRecipient = conversations[0];
  if (targetUserId) {
    const found = conversations.find(c => c._id === targetUserId);
    if (found) initialRecipient = found;
  }

  selectRecipient(initialRecipient);

  document.getElementById('chatForm')?.addEventListener('submit', handleSendMessage);
}

function renderThreadList(contacts) {
  const container = document.getElementById('chatThreadList');
  if (!container) return;

  container.innerHTML = contacts.map(c => `
    <div class="chat-thread-item" id="thread_${c._id}" onclick='selectRecipient(${JSON.stringify(c)})'>
      <img src="${c.avatar}" class="chat-thread-avatar" alt="${c.name}">
      <div class="chat-thread-info">
        <div class="chat-thread-name">${c.name}</div>
        <div class="chat-thread-last-msg">${c.lastMessage}</div>
      </div>
    </div>
  `).join('');
}

function selectRecipient(recipient) {
  activeRecipient = recipient;
  if (!activeRecipient) return;

  document.querySelectorAll('.chat-thread-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`thread_${recipient._id}`)?.classList.add('active');

  document.getElementById('chatHeaderName').textContent = recipient.name;
  document.getElementById('chatHeaderRole').textContent = recipient.occupation || (recipient.role === 'landlord' ? 'Property Host' : 'Verified Tenant');
  document.getElementById('chatHeaderAvatar').src = recipient.avatar;

  loadMessagesForRecipient(recipient);
}

function loadMessagesForRecipient(recipient) {
  const user = API.getCurrentUser() || { name: 'You' };
  
  // Seeded exchange
  currentMessages = [
    {
      sender: 'them',
      text: `Hello ${user.name.split(' ')[0]}! I received your inquiry on StayPact. We are fully aligned on the mutual living terms.`,
      time: '10:14 AM'
    },
    {
      sender: 'me',
      text: `Thanks! We appreciate the transparent 30-day notice clause and zero moral policing assurance.`,
      time: '10:18 AM'
    },
    {
      sender: 'them',
      text: `Absolutely. That is standard on all our StayPact listings. Once ready, you can review and sign the digital pact.`,
      time: '10:22 AM'
    }
  ];

  renderMessages();
}

function renderMessages() {
  const container = document.getElementById('chatMessagesBody');
  if (!container) return;

  container.innerHTML = currentMessages.map(m => `
    <div class="message-bubble ${m.sender === 'me' ? 'outgoing' : 'incoming'}">
      <div>${m.text}</div>
      <div class="message-time">${m.time}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function appendMessage(text, type, timeStr) {
  const time = timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  currentMessages.push({
    sender: type === 'outgoing' ? 'me' : 'them',
    text,
    time
  });
  renderMessages();
}

function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatTextInput');
  const text = input.value.trim();
  if (!text || !activeRecipient) return;

  appendMessage(text, 'outgoing');
  input.value = '';

  const user = API.getCurrentUser();
  if (socket && socket.connected && user) {
    socket.emit('send_message', {
      senderId: user._id,
      receiverId: activeRecipient._id,
      text,
      createdAt: new Date().toISOString()
    });
  } else {
    // Instant smart simulated response
    setTimeout(() => {
      const replies = [
        "Sounds great! Everything is codified directly into the Living Pact.",
        "Got it! Let me know if you need any adjustments to the move-in inventory.",
        "Understood. The 48-hour deposit escrow guarantee protects both of us.",
        "Sure! Feel free to proceed with the digital signature."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      appendMessage(randomReply, 'incoming');
    }, 1000);
  }
}
