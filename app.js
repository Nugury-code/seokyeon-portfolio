const projectDialog = document.getElementById('project');
let lastTrigger = null;
for (const trigger of document.querySelectorAll('[data-dialog]')) {
  trigger.addEventListener('click', () => {
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (!dialog || dialog.open) return;
    lastTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
  });
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.querySelectorAll('video').forEach(video => video.pause());
    document.body.classList.remove('dialog-open');
    lastTrigger?.focus();
  });
}
const tabs = [...projectDialog.querySelectorAll('[role="tab"]')];
function selectTab(tab, moveFocus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !selected;
    if (!selected) panel.querySelectorAll('video').forEach(video => video.pause());
  }
  if (moveFocus) tab.focus();
}
for (const tab of tabs) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const index = tabs.indexOf(tab);
    let next = null;
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (next) { event.preventDefault(); selectTab(next, true); }
  });
}
const copyButton = document.querySelector('.copy-email');
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(copyButton.dataset.email);
    status.textContent = '이메일 주소를 복사했습니다.';
  } catch {
    status.textContent = '위 이메일 주소를 길게 누르거나 선택해 복사해 주세요.';
  }
});
const navLinks = [...document.querySelectorAll('.site-header nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of navLinks) {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, {rootMargin: '-10% 0px -55% 0px'});
  sections.forEach(section => observer.observe(section));
  observer.observe(document.getElementById('hello'));
}
