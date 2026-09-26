document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  let notes = [];
  try {
    notes = JSON.parse(localStorage.getItem('aesthetic_notes')) || [];
  } catch (e) {
    notes = [];
  }

  if (notes.length === 0) {
    notes = [
      {
        id: 'demo-1',
        title: 'My Goals ♡',
        pinStyle: 'pin-pink',
        noteStyle: 'style-beige',
        image: null,
        rotation: -2,
        items: [
          { text: 'Score 99%+', completed: false },
          { text: 'Make my parents proud', completed: true }
        ]
      }
    ];
  }

  let unlockedStyles = JSON.parse(localStorage.getItem('unlocked_styles')) || ['style-beige', 'style-polaroid'];
  let currentNewTaskItems = [];
  let editingNoteId = null;

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  const boardContainer = document.getElementById('board-container');
  const addNoteBtn = document.getElementById('add-note-btn');
  const noteModal = document.getElementById('note-modal');
  const cancelNoteBtn = document.getElementById('cancel-note-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const modalTitleHeader = noteModal ? noteModal.querySelector('h2') : null;
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
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
      editingNoteId = null;
      if (modalTitleHeader) modalTitleHeader.textContent = '✨ Create Aesthetic Note';
      resetModal();
      if (noteModal) noteModal.classList.remove('hidden');
    });
  }

  if (cancelNoteBtn) {
    cancelNoteBtn.addEventListener('click', () => {
      if (noteModal) noteModal.classList.add('hidden');
      resetModal();
    });
  }

  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      const text = taskItemInput ? taskItemInput.value.trim() : '';
      if (text) {
        currentNewTaskItems.push({ text, completed: false });
        if (taskItemInput) taskItemInput.value = '';
        renderModalItems();
      }
    });
  }

  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      const title = noteTitleInput ? noteTitleInput.value.trim() : '';
      if (!title) return alert('Please enter a title ♡');

      const file = noteImageInput && noteImageInput.files ? noteImageInput.files[0] : null;
      const randomRotation = (Math.random() * 6 - 3).toFixed(1);

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          compressImage(e.target.result, 600, 0.7, (compressedDataUrl) => {
            saveOrUpdateNote(title, compressedDataUrl, randomRotation);
          });
        };
        reader.readAsDataURL(file);
      } else {
        const existingNote = notes.find(n => n.id === editingNoteId);
        const existingImage = existingNote ? existingNote.image : null;
        saveOrUpdateNote(title, existingImage, randomRotation);
      }
    });
  }

  // ==========================================
  // 4. HELPER FUNCTIONS & RENDERING
  // ==========================================
  function compressImage(base64Str, maxWidth, quality, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => callback(null);
  }

  function saveOrUpdateNote(title, imageDataUrl, rotation) {
    try {
      if (editingNoteId) {
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
          note.title = title;
          note.pinStyle = pinSelect ? pinSelect.value : 'pin-pink';
          note.noteStyle = styleSelect ? styleSelect.value : 'style-beige';
          note.items = currentNewTaskItems;
          if (imageDataUrl !== undefined) note.image = imageDataUrl;
        }
      } else {
        const newNote = {
          id: 'note_' + Date.now(),
          title,
          pinStyle: pinSelect ? pinSelect.value : 'pin-pink',
          noteStyle: styleSelect ? styleSelect.value : 'style-beige',
          image: imageDataUrl,
          rotation,
          items: currentNewTaskItems
        };
        notes.push(newNote);
      }

      saveAndRender();
      if (noteModal) noteModal.classList.add('hidden');
      resetModal();
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Storage limit reached! Try using a smaller photo or deleting an old note.');
    }
  }

  function saveAndRender() {
    localStorage.setItem('aesthetic_notes', JSON.stringify(notes));
    renderNotes();
  }

  function resetModal() {
    editingNoteId = null;
    if (noteTitleInput) noteTitleInput.value = '';
    if (taskItemInput) taskItemInput.value = '';
    if (noteImageInput) noteImageInput.value = '';
    currentNewTaskItems = [];
    if (modalTaskList) modalTaskList.innerHTML = '';
  }

  function renderModalItems() {
    if (!modalTaskList) return;
    modalTaskList.innerHTML = currentNewTaskItems.map((item, idx) => `
      <li>
        ${item.text} 
        <button type="button" class="remove-item-btn" data-index="${idx}">✕</button>
      </li>
    `).join('');

    modalTaskList.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        currentNewTaskItems.splice(idx, 1);
        renderModalItems();
      });
    });
  }

  function renderNotes() {
    if (!boardContainer) return;
    boardContainer.innerHTML = notes.map(note => `
      <div class="sticky-note ${note.noteStyle} ${note.pinStyle}" style="transform: rotate(${note.rotation}deg);">
        <div class="note-actions">
          <button class="action-btn edit-btn" data-id="${note.id}" title="Edit Note">✏️</button>
          <button class="action-btn delete-btn" data-id="${note.id}" title="Delete Note">🗑️</button>
        </div>
        <h3>${note.title}</h3>
        ${note.image ? `<img src="${note.image}" class="note-attached-image" alt="Attached photo" />` : ''}
        <ul class="task-list">
          ${note.items.map((item, idx) => `
            <li class="task-item ${item.completed ? 'done' : ''}" data-id="${note.id}" data-idx="${idx}">
              <span>${item.completed ? '☑' : '☐'} ${item.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    // Attach click events safely
    boardContainer.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    boardContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteNote(id);
      });
    });

    boardContainer.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        toggleTask(id, idx);
      });
    });
  }

  function openEditModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    editingNoteId = noteId;
    if (modalTitleHeader) modalTitleHeader.textContent = '✏️ Edit Aesthetic Note';
    if (noteTitleInput) noteTitleInput.value = note.title;
    if (pinSelect) pinSelect.value = note.pinStyle;
    if (styleSelect) styleSelect.value = note.noteStyle;
    currentNewTaskItems = [...note.items];

    renderModalItems();
    if (noteModal) noteModal.classList.remove('hidden');
  }

  function deleteNote(noteId) {
    if (confirm('Are you sure you want to remove this note from your board? 🌸')) {
      notes = notes.filter(n => n.id !== noteId);
      saveAndRender();
    }
  }

  function toggleTask(noteId, itemIndex) {
    const note = notes.find(n => n.id === noteId);
    if (note && note.items[itemIndex]) {
      note.items[itemIndex].completed = !note.items[itemIndex].completed;
      saveAndRender();
    }
  }
});