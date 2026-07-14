document.addEventListener('DOMContentLoaded', () => {
  initializePageTransitions();
  initializeAmbientEffects();
});

function initializePageTransitions() {
  const transition = document.getElementById('pageTransition');

  document.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const isLocal = url.origin === window.location.origin && !link.target && !url.hash;
    if (!isLocal || link.hasAttribute('download')) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (!transition) {
        window.location.assign(url.href);
        return;
      }

      transition.classList.add('active');
      window.setTimeout(() => window.location.assign(url.href), 420);
    });
  });
}

function initializeAmbientEffects() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.ambient-effects')) return;

  const layer = document.createElement('div');
  layer.className = 'ambient-effects';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <span class="candle-glow left"></span>
    <span class="candle-glow right"></span>
    <span class="candle-glow low"></span>
    <span class="smoke-veil"></span>
  `;
  document.body.prepend(layer);

  const createDrip = () => {
    const drip = document.createElement('span');
    drip.className = 'blood-drip';
    drip.style.left = `${4 + Math.random() * 92}%`;
    drip.style.setProperty('--drip-width', `${3 + Math.random() * 4}px`);
    drip.style.setProperty('--drip-height', `${90 + Math.random() * 190}px`);
    drip.style.setProperty('--drip-distance', `${36 + Math.random() * 54}vh`);
    drip.style.setProperty('--drip-speed', `${9 + Math.random() * 8}s`);
    layer.appendChild(drip);
    drip.addEventListener('animationend', () => drip.remove(), { once: true });
  };

  // A single early trail establishes the effect without turning the page into a slaughterhouse.
  window.setTimeout(createDrip, 1800 + Math.random() * 2400);
  window.setInterval(() => {
    if (document.hidden || layer.querySelectorAll('.blood-drip').length >= 3) return;
    createDrip();
  }, 8500);
}
