document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navList.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const form = document.getElementById('tributeForm');
const submitBtn = form.querySelector('button[type="submit"]');
const status = document.getElementById('formStatus');
const list = document.getElementById('tributesList');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');

carouselPrev.addEventListener('click', () => {
  list.scrollBy({ left: -list.clientWidth, behavior: 'smooth' });
});

carouselNext.addEventListener('click', () => {
  list.scrollBy({ left: list.clientWidth, behavior: 'smooth' });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderTributes(docs) {
  list.innerHTML = '';

  if (docs.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'tribute-card tribute-empty';
    empty.innerHTML = '<p>Be the first to share a memory of Dr. Seetha.</p>';
    list.appendChild(empty);
    return;
  }

  docs.forEach((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
    const item = document.createElement('li');
    item.className = 'tribute-card';
    item.innerHTML = `
      <p>&ldquo;${escapeHtml(data.message)}&rdquo;</p>
      <span class="tribute-name">${escapeHtml(data.name)}</span>
      <span class="tribute-role">${escapeHtml(timeAgo(createdAt))}</span>
    `;
    list.appendChild(item);
  });
}

const isFirebaseConfigured = typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== 'YOUR_API_KEY';

if (!isFirebaseConfigured) {
  renderTributes([]);
  list.querySelector('.tribute-empty p').textContent = 'The guestbook isn’t connected yet.';
  submitBtn.disabled = true;
  status.textContent = 'The guestbook isn’t connected yet — tributes can’t be saved.';
} else {
  try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const tributesRef = db.collection('tributes');

    tributesRef.orderBy('createdAt', 'desc').onSnapshot(
      (snapshot) => renderTributes(snapshot.docs),
      (error) => {
        console.error('Failed to load tributes:', error);
        status.textContent = 'Could not load tributes right now. Please try again later.';
      }
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.name.value.trim();
      const tribute = form.tribute.value.trim();
      if (!name || !tribute) return;

      submitBtn.disabled = true;
      status.textContent = 'Sharing your tribute…';

      try {
        await tributesRef.add({
          name,
          message: tribute,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        list.scrollTo({ left: 0, behavior: 'smooth' });
        status.textContent = 'Thank you — your tribute has been shared.';
        form.reset();
      } catch (error) {
        console.error('Failed to submit tribute:', error);
        status.textContent = 'Something went wrong. Please try again.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    status.textContent = 'The guestbook is temporarily unavailable.';
  }
}
