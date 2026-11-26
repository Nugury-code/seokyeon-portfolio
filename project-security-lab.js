(() => {
  const dialog = document.getElementById('security-lab');
  if (!dialog) return;
  const tabs = [...dialog.querySelectorAll('[role="tab"]')];
  const select = (tab, focus = false) => {
    for (const item of tabs) {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      dialog.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !active;
    }
    if (focus) tab.focus();
  };
  for (const tab of tabs) {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft' ? tabs[(index - 1 + tabs.length) % tabs.length]
        : event.key === 'Home' ? tabs[0]
        : event.key === 'End' ? tabs[tabs.length - 1] : null;
      if (next) { event.preventDefault(); select(next, true); }
    });
  }
})();
