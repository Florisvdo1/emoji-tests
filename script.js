const EMOJIS = [
  { char: "🎨", category:"art", name:"artist palette" },
  { char: "🏖️", category:"travel", name:"beach" },
  { char: "🚀", category:"tech", name:"rocket" },
  { char: "🥑", category:"food", name:"avocado" },
  { char: "📅", category:"objects", name:"calendar" },
  { char: "🍕", category:"food", name:"pizza" },
  { char: "🏄‍♂️", category:"travel", name:"surfing man" },
  { char: "🖌️", category:"art", name:"paintbrush" },
  { char: "💻", category:"tech", name:"laptop" },
  { char: "🧳", category:"travel", name:"luggage" },
  { char: "🍏", category:"food", name:"green apple" },
  { char: "📦", category:"objects", name:"box" }
];

const deck = document.querySelector('.emoji-deck');
const placeholders = document.querySelectorAll('.placeholder');
const searchBar = document.querySelector('.search-bar');
const catButtons = document.querySelectorAll('.cat-btn');
const homeworkBtn = document.querySelector('.homework-btn');
const timeDisplay = document.querySelector('.time-display');

let currentCategory = 'all';
let draggedEmoji = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentDroppable = null;
let startX = 0;
let startY = 0;

function displayEmojis() {
  deck.innerHTML = '';
  const query = searchBar.value.toLowerCase();
  const filtered = EMOJIS.filter(e => 
    (currentCategory === 'all' || e.category === currentCategory) &&
    e.name.toLowerCase().includes(query)
  );
  filtered.forEach(e => {
    const span = document.createElement('span');
    span.classList.add('emoji-item');
    span.textContent = e.char;
    span.setAttribute('data-emoji', e.char);
    span.setAttribute('role', 'listitem');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', e.name);
    // Touch events for drag-and-drop
    span.addEventListener('touchstart', onTouchStart, {passive:false});
    deck.appendChild(span);
  });
}

function onTouchStart(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (!target.classList.contains('emoji-item')) return;
  
  const rect = target.getBoundingClientRect();
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  draggedEmoji = target.cloneNode(true);
  draggedEmoji.classList.add('dragging');
  document.body.appendChild(draggedEmoji);
  
  if (navigator.vibrate) navigator.vibrate(10);

  moveAt(touch.clientX, touch.clientY);

  document.addEventListener('touchmove', onTouchMove, {passive:false});
  document.addEventListener('touchend', onTouchEnd, {passive:false});
}

function onTouchMove(e) {
  e.preventDefault();
  if (!draggedEmoji) return;

  const touch = e.touches[0];
  moveAt(touch.clientX, touch.clientY);

  let droppable = null;
  let closestDist = Infinity;

  placeholders.forEach(pl => {
    const rect = pl.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const dx = (touch.clientX - dragOffsetX) - centerX;
    const dy = (touch.clientY - dragOffsetY) - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 150 && dist < closestDist) {
      closestDist = dist;
      droppable = pl;
    }
    pl.classList.toggle('highlight', droppable === pl);
  });

  currentDroppable = droppable;
}

function onTouchEnd(e) {
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);

  if (currentDroppable && draggedEmoji) {
    const plRect = currentDroppable.getBoundingClientRect();
    const emojiRect = draggedEmoji.getBoundingClientRect();
    const finalX = (plRect.left + plRect.width/2) - (emojiRect.width/2);
    const finalY = (plRect.top + plRect.height/2) - (emojiRect.height/2);

    draggedEmoji.style.transition = 'transform 0.2s ease-out';
    draggedEmoji.style.transform = `translate(${finalX - emojiRect.left}px, ${finalY - emojiRect.top}px)`;

    draggedEmoji.addEventListener('transitionend', () => {
      currentDroppable.textContent = draggedEmoji.textContent;
      currentDroppable.classList.remove('highlight');
      currentDroppable.classList.remove('empty');
      currentDroppable.setAttribute('aria-label', 'Placeholder with ' + draggedEmoji.textContent);

      if (navigator.vibrate) navigator.vibrate(20);
      draggedEmoji.remove();
      draggedEmoji = null;
    }, { once:true });
  } else {
    if (draggedEmoji) {
      draggedEmoji.remove();
      draggedEmoji = null;
    }
  }

  placeholders.forEach(pl => pl.classList.remove('highlight'));
}

function moveAt(x, y) {
  if (!draggedEmoji) return;
  draggedEmoji.style.position = 'fixed';
  draggedEmoji.style.left = (x - dragOffsetX) + 'px';
  draggedEmoji.style.top = (y - dragOffsetY) + 'px';
  draggedEmoji.style.zIndex = 9999;
}

// Homework toggle
homeworkBtn.addEventListener('click', () => {
  if (homeworkBtn.classList.contains('green')) {
    homeworkBtn.classList.remove('green');
    homeworkBtn.textContent = 'Homework';
  } else {
    homeworkBtn.classList.add('green');
    homeworkBtn.innerHTML = `<span class="thumbs-up">👍</span>Homework`;
  }
});

// Update time every second
function updateTime() {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
setInterval(updateTime, 1000);
updateTime();

catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    displayEmojis();
  });
});

searchBar.addEventListener('input', displayEmojis);

displayEmojis();
