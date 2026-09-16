// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
let notes = JSON.parse(localStorage.getItem('aesthetic_notes')) || [
  {
    id: 'demo-1',
    title: 'My Goals ♡',
    pinStyle: 'pin-pink',
    noteStyle: 'style-pink',
    rotation: -2,
    items: [
      { text: 'Score 99%+', completed: false },
      { text: 'Make my parents proud', completed: true },
      { text: 'Be the best version of myself', completed: false }
    ]
  },
  {
    id: 'demo-2',
    title: 'Study More ♡ Worry Less',
    pinStyle: 'tape-washi',
    noteStyle: 'style-kraft',
    rotation: 1,
    items: [
      { text: 'Less scrolling', completed: true },
      { text: 'More learning', completed: true },
      { text: 'More self-belief', completed: false }
    ]
  }
];

let unlockedStyles = JSON.parse(localStorage.getItem('unlocked_styles')) || ['style-pink', 'style-kraft', 'style-polaroid'];
let currentNewTaskItems = [];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
// Board & Modal Elements
const boardContainer = document.getElementById('board-container');
const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTitleInput = document.getElementById('note-title');
const pinSelect = document.getElementById('note-pin-select');
const styleSelect = document.getElementById('note-style-select');
const taskItemInput = document.getElementById('task-item-input');
const addItemBtn = document.getElementById('add-item-btn');
const modalTaskList = document.getElementById('modal-task-list');

// Chatbot Elements
const chatToggleBtn = document.getElementById('chat-toggle');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatMessages = document.getElementById('chat-messages');

// Initial Render
renderNotes();

// ==========================================
// 3. NOTE CREATION & MODAL LISTENERS
// ==========================================
addNoteBtn.addEventListener('click', () => noteModal.classList.remove('hidden'));

cancelNoteBtn.addEventListener('click', () => {
  noteModal.classList.add('hidden');
  resetModal();
});

addItemBtn.addEventListener('click', () => {
  const text = taskItemInput.value.trim();
  if (text) {
    currentNewTaskItems.push({ text, completed: false });
    taskItemInput.value = '';
    renderModalItems();
  }
});

// Rewarded Ad Simulation for Exclusive Themes
styleSelect.addEventListener('change', (e) => {
  const selectedStyle = e.target.value;
  if (!unlockedStyles.includes(selectedStyle)) {
    const watchAd = confirm("🎬 Watch a quick 5-second video ad to permanently unlock this aesthetic note theme?");
    if (watchAd) {
      showSimulatedAd(() => {
        unlockedStyles.push(selectedStyle);
        localStorage.setItem('unlocked_styles', JSON.stringify(unlockedStyles));
        alert("🎉 Premium style unlocked!");
      }, () => {
        e.target.value = 'style-pink';
      });
    } else {
      e.target.value = 'style-pink';
    }
  }
});

saveNoteBtn.addEventListener('click', () => {
  const title = noteTitleInput.value.trim();
  if (!title) return alert('Please enter a title ♡');

  const randomRotation = (Math.random() * 6 - 3).toFixed(1);

  const newNote = {
    id: 'note_' + Date.now(),
    title,
    pinStyle: pinSelect.value,
    noteStyle: styleSelect.value,
    rotation: randomRotation,
    items: currentNewTaskItems
  };

  notes.push(newNote);
  saveAndRender();
  noteModal.classList.add('hidden');
  resetModal();
});

// ==========================================
// 4. CHATBOT COMPANION LOGIC
// ==========================================
chatToggleBtn.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

sendChatBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSendMessage();
});

async function handleSendMessage() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  // 1. Render User Message
  appendMessage(userText, 'user');
  chatInput.value = '';

  // 2. Render Loading Indicator
  const loadingId = appendMessage('Thinking... 🌸', 'bot');

  // 3. Gather Board Context
  const boardContext = getBoardTasksSummary();

  // 4. Call Serverless Backend Proxy
  try {
    const aiResponse = await fetchAIResponse(userText, boardContext);
    updateMessage(loadingId, aiResponse);
  } catch (err) {
    console.error(err);
    updateMessage(loadingId, "Oops! I couldn't connect right now. Please check your internet connection 💕");
  }
}

// Fetch AI Response via Secure Backend Endpoint (/api/chat)
async function fetchAIResponse(userMood, context) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userMood: userMood,
      boardContext: context
    })
  });

  if (!res.ok) {
    throw new Error('Server response failed');
  }

  const data = await res.json();
  return data.reply;
}

// Extract task stats to feed into AI prompt
function getBoardTasksSummary() {
  let completed = [];
  let pending = [];

  notes.forEach(note => {
    note.items.forEach(item => {
      if (item.completed) {
        completed.push(`"${item.text}" (from ${note.title})`);
      } else {
        pending.push(`"${item.text}" (from ${note.title})`);
      }
    });
  });

  return { completed, pending };
}

// UI Helpers for Messages
function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  const msgId = 'msg_' + Date.now();
  msgDiv.id = msgId;
  msgDiv.className = `message ${sender}`;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgId;
}

function updateMessage(msgId, newText) {
  const msgDiv = document.getElementById(msgId);
  if (msgDiv) {
    msgDiv.textContent = newText;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ==========================================
// 5. HELPER FUNCTIONS & RENDERING
// ==========================================
function saveAndRender() {
  localStorage.setItem('aesthetic_notes', JSON.stringify(notes));
  renderNotes();
}

function resetModal() {
  noteTitleInput.value = '';
  taskItemInput.value = '';
  currentNewTaskItems = [];
  modalTaskList.innerHTML = '';
}

function renderModalItems() {
  modalTaskList.innerHTML = currentNewTaskItems.map(item => `<li>${item.text}</li>`).join('');
}

function toggleTask(noteId, itemIndex) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.items[itemIndex]) {
    note.items[itemIndex].completed = !note.items[itemIndex].completed;
    saveAndRender();
  }
}

function renderNotes() {
  boardContainer.innerHTML = notes.map(note => `
    <div class="sticky-note ${note.noteStyle} ${note.pinStyle}" style="transform: rotate(${note.rotation}deg);">
      <h3>${note.title}</h3>
      <ul class="task-list">
        ${note.items.map((item, idx) => `
          <li class="task-item ${item.completed ? 'done' : ''}" onclick="toggleTask('${note.id}', ${idx})">
            <span>${item.completed ? '☑' : '☐'} ${item.text}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

// Rewarded Ad Overlay Simulation
function showSimulatedAd(onSuccess, onCancel) {
  const adOverlay = document.createElement('div');
  adOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:9999;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;';
  adOverlay.innerHTML = `
    <h2>🎬 Unlocking Aesthetic Theme</h2>
    <p style="margin-top:10px;">Ad finishing in <b id="ad-timer">5</b>s...</p>
  `;
  document.body.appendChild(adOverlay);

  let timerVal = 5;
  const interval = setInterval(() => {
    timerVal--;
    document.getElementById('ad-timer').textContent = timerVal;
    if (timerVal <= 0) {
      clearInterval(interval);
      document.body.removeChild(adOverlay);
      onSuccess();
    }
  }, 1000);
}