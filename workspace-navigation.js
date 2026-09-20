// A disclosure menu: no overlay, scroll lock or changes to application routes.
export function initWorkspaceNavigation(root) {
  const button = root?.querySelector('#workspace-menu');
  const sidebar = root?.querySelector('#workspace-sidebar');
  if (!button || !sidebar) return;
  const setOpen = open => {
    root.classList.toggle('workspace-menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = open ? 'Close <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">☰</span>';
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  sidebar.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setOpen(false); button.focus(); }
  });
  sidebar.querySelectorAll('[data-nav]').forEach(item => {
    if (item.classList.contains('active')) item.setAttribute('aria-current', 'page');
    item.addEventListener('click', () => setOpen(false));
  });
}
