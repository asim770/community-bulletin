/**
 * Community Bulletin Board — Chat Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const chatFab = document.getElementById('chat-fab');
  const chatWindow = document.getElementById('chat-window');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const pinnedMessagesContainer = document.getElementById('pinned-messages-container');
  const onlineCountSpan = document.getElementById('online-count');
  const onlineBadgeSpan = document.getElementById('online-badge');

  // We only initialize Socket.IO if the script is loaded
  if (typeof io === 'undefined') {
    console.error('Socket.IO is not loaded.');
    return;
  }

  // Connect to the same origin
  const socket = io();

  // Function to get the current username dynamically
  let fallbackGuestName = 'Guest-' + Math.floor(Math.random() * 10000);
  function getCurrentUsername() {
    if (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.username) {
      return Auth.currentUser.username;
    }
    return fallbackGuestName;
  }

  // ---- UI Event Listeners ----

  chatFab.addEventListener('click', () => {
    chatWindow.classList.add('active');
    chatInput.focus();
    scrollToBottom();
  });

  closeChatBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      // Emit the message to the server
      const username = getCurrentUsername();
      socket.emit('chat message', { username, text });
      chatInput.value = '';
    }
  });

  // ---- Socket.IO Event Listeners ----

  socket.on('init chat', (data) => {
    // Clear current chat
    const systemMessage = chatMessages.querySelector('.chat-system-message');
    chatMessages.innerHTML = '';
    if (systemMessage) chatMessages.appendChild(systemMessage);
    pinnedMessagesContainer.innerHTML = '';
    
    // Check if we need to show pinned area
    if (data.pinnedMessages && data.pinnedMessages.length > 0) {
      pinnedMessagesContainer.style.display = 'flex';
      data.pinnedMessages.forEach(msg => addChatMessage(msg, msg.username === getCurrentUsername(), true));
    } else {
      pinnedMessagesContainer.style.display = 'none';
    }

    if (data.recentMessages) {
      data.recentMessages.forEach(msg => addChatMessage(msg, msg.username === getCurrentUsername(), false));
    }
  });

  socket.on('user connect', (data) => {
    updateOnlineCount(data.onlineCount);
  });

  socket.on('user disconnect', (data) => {
    updateOnlineCount(data.onlineCount);
  });

  socket.on('chat message', (msg) => {
    const currentUsername = getCurrentUsername();
    const isSelf = msg.username === currentUsername;
    addChatMessage(msg, isSelf, false);
  });

  socket.on('message pinned', (msg) => {
    // Show container
    pinnedMessagesContainer.style.display = 'flex';
    // Remove if already there
    const existing = document.getElementById('pinned-' + msg._id);
    if (existing) existing.remove();
    // Add to pinned
    addChatMessage(msg, msg.username === getCurrentUsername(), true);
  });

  socket.on('message unpinned', (msg) => {
    const existing = document.getElementById('pinned-' + msg._id);
    if (existing) existing.remove();
    if (pinnedMessagesContainer.children.length === 0) {
      pinnedMessagesContainer.style.display = 'none';
    }
  });

  // ---- Helper Functions ----

  function updateOnlineCount(count) {
    if (onlineCountSpan) onlineCountSpan.textContent = count;
    if (onlineBadgeSpan) onlineBadgeSpan.textContent = count;
  }

  function addChatMessage(msg, isSelf, isPinnedRender = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${isSelf ? 'self' : 'other'}`;
    if (msg._id) {
      messageEl.id = (isPinnedRender ? 'pinned-' : 'msg-') + msg._id;
    }

    const date = msg.timestamp ? new Date(msg.timestamp) : new Date();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const displayName = isSelf ? 'You' : msg.username;

    // Pin/Unpin button UI
    const pinActionBtn = isPinnedRender 
      ? `<button class="pin-action-btn unpin-btn" data-id="${msg._id}" title="Unpin Message">❌</button>`
      : `<button class="pin-action-btn pin-btn" data-id="${msg._id}" title="Pin Message">📌</button>`;

    messageEl.innerHTML = `
      ${msg._id ? pinActionBtn : ''}
      <div class="chat-meta">
        <span class="chat-username" style="font-weight: 700; color: ${isSelf ? 'var(--accent-primary)' : 'var(--text-primary)'};">${escapeHtml(displayName)}</span>
        <span class="chat-time">${timeString}</span>
      </div>
      <div class="chat-bubble">
        ${escapeHtml(msg.text)}
      </div>
    `;

    // Add event listener for pin/unpin
    if (msg._id) {
      const btn = messageEl.querySelector('.pin-action-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          if (isPinnedRender) {
            socket.emit('unpin message', msg._id);
          } else {
            socket.emit('pin message', msg._id);
          }
        });
      }
    }

    if (isPinnedRender) {
      pinnedMessagesContainer.appendChild(messageEl);
      pinnedMessagesContainer.scrollTop = pinnedMessagesContainer.scrollHeight;
    } else {
      chatMessages.appendChild(messageEl);
      scrollToBottom();
    }
  }

  function addSystemMessage(text) {
    const el = document.createElement('div');
    el.className = 'chat-system-message';
    el.textContent = text;
    chatMessages.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Simple HTML escaper to prevent XSS in chat
  function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
});
