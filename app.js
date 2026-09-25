// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
let notes = JSON.parse(localStorage.getItem('aesthetic_notes')) || [
  {
    id: 'demo-1',
    title: 'My Goals ♡',
    pinStyle: 'pin-pink',
    noteStyle: 'style-pink',
    image: null,
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
    image: null,
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
const boardContainer = document.getElementById('board-container');
const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTitleInput = document.getElementById('note-title');
const pinSelect = document.getElementById('note-pin-select');
const styleSelect = document.getElementById('note-style-select');
const noteImageInput = document.getElementById('note-image-input');
const taskItemInput = document.getElementById('task-item-input');
const addItemBtn = document.getElementById('add-item-btn');
const modalTaskList = document.getElementById('modal-task-list');

// Initial Render
renderNotes();

// ==========================================
// 3. EVENT LISTENERS
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

  const file = noteImageInput ? noteImageInput.files[0] : null;
  const randomRotation = (Math.random() * 6 - 3).toFixed(1);

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      createNewNote(title, imageDataUrl, randomRotation);
    };
    reader.readAsDataURL(file);
  } else {
    createNewNote(title, null, randomRotation);
  }
});

function createNewNote(title, imageDataUrl, rotation) {
  const newNote = {
    id: 'note_' + Date.now(),
    title,
    pinStyle: pinSelect.value,
    noteStyle: styleSelect.value,
    image: imageDataUrl,
    rotation,
    items: currentNewTaskItems
  };

  notes.push(newNote);
  saveAndRender();
  noteModal.classList.add('hidden');
  resetModal();
}

// ==========================================
// 4. HELPER FUNCTIONS & RENDERING
// ==========================================
function saveAndRender() {
  localStorage.setItem('aesthetic_notes', JSON.stringify(notes));
  renderNotes();
}

function resetModal() {
  noteTitleInput.value = '';
  taskItemInput.value = '';
  if (noteImageInput) noteImageInput.value = '';
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
      ${note.image ? `<img src="${note.image}" class="note-attached-image" alt="Attached photo" />` : ''}
      <ul class="task-list">
        ${note.items.map((item, idx) => `
          <li class="task-item ${item.completed ? 'done' : ''}" onclick="toggleTask('${note.id}',${idx})">
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
    const timerElem = document.getElementById('ad-timer');
    if (timerElem) timerElem.textContent = timerVal;
    
    if (timerVal <= 0) {
      clearInterval(interval);
      document.body.removeChild(adOverlay);
      onSuccess();
    }
  }, 1000);
}