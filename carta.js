// Menú desplegable
const toggleBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navrapido');

// Abrir/cerrar menú
toggleBtn.addEventListener('click', () => {
  nav.classList.toggle('show');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.navrapido a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('show');
  });
});

// Cerrar menú al hacer clic fuera del nav
document.addEventListener('click', (e) => {
  const isClickInside = nav.contains(e.target) || toggleBtn.contains(e.target);
  if (!isClickInside) {
    nav.classList.remove('show');
  }
});