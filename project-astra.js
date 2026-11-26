(() => {
  const media = window.ASTRA_MEDIA || { scenarios: {} };
  const cover = document.querySelector('[data-astra-cover]');
  const fallback = document.querySelector('[data-astra-cover-fallback]');
  if (cover && fallback && media.cover) {
    cover.addEventListener('load', () => { cover.hidden = false; fallback.hidden = true; });
    cover.addEventListener('error', () => { cover.hidden = true; fallback.hidden = false; });
    cover.src = media.cover;
  }
  for (const panel of document.querySelectorAll('[data-astra-scenario]')) {
    const item = media.scenarios?.[panel.dataset.astraScenario];
    if (!item?.video) continue;
    const video = panel.querySelector('video');
    const placeholder = panel.querySelector('.astra-video-placeholder');
    video.src = item.video;
    if (item.poster) video.poster = item.poster;
    video.hidden = false;
    placeholder.hidden = true;
    video.addEventListener('error', () => {
      video.hidden = true;
      placeholder.hidden = false;
      placeholder.querySelector('p').textContent = '시연 영상을 불러오지 못했습니다.';
    });
  }
})();

// Cycle the decorative highlight without hiding content or announcing updates.
(() => {
  const flow = document.querySelector('.astra-flow');
  if (!flow) return;
  const steps = [...flow.children];
  if (steps.length < 2) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let inView = false;
  let hovered = false;
  let timer;
  const show = index => {
    current = index;
    steps.forEach((step, i) => step.classList.toggle('is-highlighted', i === current));
  };
  const sync = () => {
    window.clearInterval(timer);
    if (inView && !hovered && !document.hidden && !reducedMotion.matches) {
      timer = window.setInterval(() => show((current + 1) % steps.length), 1800);
    }
  };
  show(0);
  steps.forEach((step, index) => {
    step.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      show(index);
      sync();
    });
    step.addEventListener('pointerleave', () => {
      hovered = false;
      sync();
    });
  });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }, { threshold: 0.15 }).observe(flow);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
})();
