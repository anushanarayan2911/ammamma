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

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const tribute = form.tribute.value.trim();
  if (!name || !tribute) return;

  const item = document.createElement('li');
  item.className = 'tribute-card';
  item.innerHTML = `
    <p>&ldquo;${escapeHtml(tribute)}&rdquo;</p>
    <span class="tribute-name">${escapeHtml(name)}</span>
    <span class="tribute-role">Just now</span>
  `;
  list.prepend(item);
  list.scrollTo({ left: 0, behavior: 'smooth' });

  status.textContent = 'Thank you — your tribute has been shared.';
  form.reset();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
