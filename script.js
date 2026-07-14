document.addEventListener('DOMContentLoaded', () => {
  const transition = document.getElementById('pageTransition');
  document.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const isLocal = url.origin === window.location.origin && !link.target && !url.hash;
    if (!isLocal || link.hasAttribute('download')) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (!transition) return window.location.assign(url.href);
      transition.classList.add('active');
      window.setTimeout(() => window.location.assign(url.href), 420);
    });
  });
});
