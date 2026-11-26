(() => {
  const media = window.ASTRA_MEDIA || { scenarios: {} };
  const viewer = document.createElement('dialog');
  viewer.className = 'astra-lightbox';
  viewer.setAttribute('aria-labelledby', 'astra-lightbox-title');
  viewer.innerHTML = '<div class="astra-lightbox-header"><div><span class="astra-lightbox-label">ASTRA · 시연 영상</span><h2 id="astra-lightbox-title"></h2></div><button type="button" class="astra-lightbox-close" aria-label="영상 창 닫기">닫기 <span aria-hidden="true">×</span></button></div><video controls playsinline preload="none"></video><p class="astra-lightbox-error" role="status" hidden>영상을 불러오지 못했습니다. 잠시 후 다시 재생해 주세요.</p>';
  document.body.append(viewer);
  const player = viewer.querySelector('video');
  const playerTitle = viewer.querySelector('h2');
  const playerError = viewer.querySelector('.astra-lightbox-error');
  let playTrigger;
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    playTrigger?.focus();
  });
  player.addEventListener('error', () => {
    if (viewer.open && player.hasAttribute('src')) playerError.hidden = false;
  });
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
    video.controls = false;
    video.tabIndex = -1;
    video.setAttribute('aria-hidden', 'true');
    video.hidden = false;
    placeholder.hidden = true;
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'astra-video-launch';
    launch.setAttribute('aria-haspopup', 'dialog');
    const title = panel.querySelector('h4').textContent;
    launch.setAttribute('aria-label', title + ' 시연 영상 재생');
    launch.innerHTML = '<span class="astra-video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>';
    video.parentElement.append(launch);
    launch.addEventListener('click', () => {
      playTrigger = launch;
      playerTitle.textContent = title;
      player.setAttribute('aria-label', title + ' 시연 영상');
      player.poster = item.poster || '';
      playerError.hidden = true;
      player.src = item.video;
      viewer.showModal();
      player.play().catch(() => {});
    });
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
