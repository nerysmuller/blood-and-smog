const playerData = {
  player1: makeOperative('Operative One', 'Human Rogue | Level 10', 'Human', 'Rogue', 'Factory Worker'),
  player2: makeOperative('Operative Two', 'Elf Cleric | Level 10', 'Elf', 'Cleric', 'Plague Physician'),
  player3: makeOperative('Operative Three', 'Dwarf Fighter | Level 10', 'Dwarf', 'Fighter', 'Union Organizer'),
  player4: makeOperative('Operative Four', 'Tiefling Sorcerer | Level 10', 'Tiefling', 'Sorcerer', 'Disgraced Aristocrat'),
  player5: makeOperative('Operative Five', 'Halfling Ranger | Level 10', 'Halfling', 'Ranger', 'Canal Smuggler')
};

function makeOperative(name, summary, species, cls, background) {
  return {
    name, summary,
    race: species, className: cls, level: 10, background,
    hp: { current: 70, max: 70 }, ac: 16,
    abilities: { STR: 12, DEX: 16, CON: 14, INT: 13, WIS: 14, CHA: 12 },
    attacks: [
      { name: 'Primary Weapon', bonus: '+7 to hit', damage: 'Edit in player-script.js' },
      { name: 'Signature Feature', bonus: 'Class dependent', damage: 'Edit in player-script.js' }
    ]
  };
}

let currentPlayer = null;
const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  $('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = $('playerSelect').value;
    if (!playerData[selected]) return showError('Select a character file.');
    currentPlayer = selected;
    sessionStorage.setItem('bloodSmogPlayer', selected);
    showDashboard();
  });
  $('logoutBtn').addEventListener('click', logout);
  document.querySelectorAll('.dice-btn').forEach((button) => button.addEventListener('click', () => rollDice(Number(button.dataset.dice))));
  const saved = sessionStorage.getItem('bloodSmogPlayer');
  if (playerData[saved]) { currentPlayer = saved; showDashboard(); }
});

function showDashboard() {
  const player = playerData[currentPlayer];
  $('loginSection').style.display = 'none';
  $('playerDashboard').classList.add('active');
  $('playerName').textContent = `FILE RETRIEVED: ${player.name.toUpperCase()}`;
  $('playerClass').textContent = `${player.summary} // STATUS: WANTED`;
  $('charName').textContent = player.name;
  $('charRace').textContent = player.race;
  $('charClass').textContent = player.summary;
  $('charLevel').textContent = player.level;
  $('charBackground').textContent = player.background;
  $('currentHP').textContent = player.hp.current;
  $('maxHP').textContent = player.hp.max;
  $('armorClass').textContent = player.ac;
  $('abilitiesGrid').innerHTML = Object.entries(player.abilities).map(([name, score]) => {
    const mod = Math.floor((score - 10) / 2);
    return `<div class="ability"><div class="ability-name">${name}</div><div class="ability-score">${score}</div><div class="ability-mod">${mod >= 0 ? '+' : ''}${mod}</div></div>`;
  }).join('');
  $('attacksList').innerHTML = player.attacks.map((attack) => `<div class="attack-item"><div class="attack-name">${attack.name}</div><div class="attack-bonus">${attack.bonus}</div><div class="attack-damage">${attack.damage}</div></div>`).join('');
  initializeNotes();
  populateParty();
}

function logout() {
  currentPlayer = null;
  sessionStorage.removeItem('bloodSmogPlayer');
  $('playerDashboard').classList.remove('active');
  $('loginSection').style.display = 'block';
}

function showError(message) { $('errorMessage').hidden = false; $('errorMessage').textContent = message; }

function rollDice(sides) {
  const modifier = Number($('diceModifier').value) || 0;
  const roll = Math.floor(Math.random() * sides) + 1;
  const total = roll + modifier;
  $('resultValue').textContent = total;
  $('resultBreakdown').textContent = `d${sides}: ${roll}${modifier ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''}`;
  const item = document.createElement('div');
  item.className = 'history-item';
  item.textContent = `d${sides} → ${total}`;
  $('historyList').prepend(item);
  while ($('historyList').children.length > 8) $('historyList').lastElementChild.remove();
}

const noteCategories = ['sessionNotes', 'inventoryNotes', 'relationshipNotes', 'theoriesNotes'];
function initializeNotes() {
  noteCategories.forEach((category) => {
    const section = $(`${category}Section`);
    if (section.dataset.ready) return;
    section.dataset.ready = 'true';
    section.insertAdjacentHTML('beforeend', `<div class="new-note-form"><input class="note-title" placeholder="Record title"><button class="save-button">Create</button></div><div class="note-list"></div><div class="note-editor"><div class="note-editor-header"><strong></strong><button class="close-editor-btn">Close</button></div><textarea></textarea><button class="save-button save-edit">Save Changes</button></div>`);
    section.querySelector('.new-note-form button').addEventListener('click', () => createNote(category, section));
    section.querySelector('.close-editor-btn').addEventListener('click', () => closeEditor(section));
    section.querySelector('.save-edit').addEventListener('click', () => saveEdit(category, section));
    renderNotes(category, section);
  });
}
function storageKey(category) { return `bloodSmog_${currentPlayer}_${category}`; }
function getNotes(category) { return JSON.parse(localStorage.getItem(storageKey(category)) || '[]'); }
function setNotes(category, notes) { localStorage.setItem(storageKey(category), JSON.stringify(notes)); }
function createNote(category, section) {
  const input = section.querySelector('.note-title');
  const title = input.value.trim();
  if (!title) return;
  const notes = getNotes(category);
  const note = { id: Date.now(), title, content: '', date: new Date().toLocaleDateString() };
  notes.push(note); setNotes(category, notes); input.value = ''; renderNotes(category, section); openEditor(category, section, note.id);
}
function renderNotes(category, section) {
  section.querySelector('.note-list').innerHTML = getNotes(category).slice().reverse().map((note) => `<div class="saved-note-item"><div class="saved-note-title">${escapeHtml(note.title)}</div><div class="saved-note-date">${note.date}</div><div class="saved-note-preview">${escapeHtml(note.content.slice(0,120))}</div><div class="saved-note-actions"><button class="note-action-btn" data-edit="${note.id}">Edit</button><button class="note-action-btn" data-delete="${note.id}">Delete</button></div></div>`).join('');
  section.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openEditor(category, section, Number(button.dataset.edit))));
  section.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteNote(category, section, Number(button.dataset.delete))));
}
function openEditor(category, section, id) {
  const note = getNotes(category).find((item) => item.id === id); if (!note) return;
  const editor = section.querySelector('.note-editor'); editor.dataset.id = id; editor.querySelector('strong').textContent = note.title; editor.querySelector('textarea').value = note.content; editor.classList.add('active'); section.querySelector('.note-list').style.display = 'none'; section.querySelector('.new-note-form').style.display = 'none';
}
function closeEditor(section) { section.querySelector('.note-editor').classList.remove('active'); section.querySelector('.note-list').style.display = ''; section.querySelector('.new-note-form').style.display = ''; }
function saveEdit(category, section) { const id = Number(section.querySelector('.note-editor').dataset.id); const notes = getNotes(category); const note = notes.find((item) => item.id === id); if (!note) return; note.content = section.querySelector('textarea').value; note.date = new Date().toLocaleDateString(); setNotes(category, notes); renderNotes(category, section); closeEditor(section); }
function deleteNote(category, section, id) { if (!confirm('Delete this record?')) return; setNotes(category, getNotes(category).filter((note) => note.id !== id)); renderNotes(category, section); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function populateParty() { $('partyList').innerHTML = Object.entries(playerData).filter(([id]) => id !== currentPlayer).map(([, player]) => `<div class="attack-item"><div class="attack-name">${player.name}</div><div class="attack-bonus">${player.summary}</div></div>`).join(''); }
