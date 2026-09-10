(function initializeAccessibilitySettings() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.body.classList.toggle('dark-mode', theme === 'dark');

  document.addEventListener('DOMContentLoaded', () => {
    const accessibilityToggle = document.querySelector('#accessibility-toggle');
    const accessibilityPanel = document.querySelector('#accessibility-panel');
    const settingsToggle = document.querySelector('#settings-toggle');
    const settingsPanel = document.querySelector('#settings-panel');
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const contrastToggle = document.querySelector('[data-accessibility="contrast"]');
    const readingToggle = document.querySelector('[data-accessibility="reading"]');
    const root = document.documentElement;
    let baseFontSize = 100;

    function setPanel(panel, toggle, isOpen) {
      panel.hidden = !isOpen;
      toggle.setAttribute('aria-expanded', String(isOpen));
    }

    function closePanels() {
      if (accessibilityPanel && accessibilityToggle) setPanel(accessibilityPanel, accessibilityToggle, false);
      if (settingsPanel && settingsToggle) setPanel(settingsPanel, settingsToggle, false);
    }

    if (!accessibilityToggle || !accessibilityPanel || !settingsToggle || !settingsPanel) return;

    themeToggle.checked = theme === 'dark';
    contrastToggle.checked = document.body.classList.contains('high-contrast');
    readingToggle.checked = document.body.classList.contains('reading-mode');

    accessibilityToggle.addEventListener('click', () => {
      const isOpen = !accessibilityPanel.hidden;
      closePanels();
      setPanel(accessibilityPanel, accessibilityToggle, !isOpen);
    });

    settingsToggle.addEventListener('click', () => {
      const isOpen = !settingsPanel.hidden;
      closePanels();
      setPanel(settingsPanel, settingsToggle, !isOpen);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.floating-tool')) closePanels();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanels();
    });

    document.querySelector('[data-font-action="increase"]').addEventListener('click', () => {
      baseFontSize = Math.min(baseFontSize + 10, 130);
      root.style.fontSize = `${baseFontSize}%`;
    });

    document.querySelector('[data-font-action="decrease"]').addEventListener('click', () => {
      baseFontSize = Math.max(baseFontSize - 10, 80);
      root.style.fontSize = `${baseFontSize}%`;
    });

    contrastToggle.addEventListener('change', () => {
      document.body.classList.toggle('high-contrast', contrastToggle.checked);
    });

    readingToggle.addEventListener('change', () => {
      document.body.classList.toggle('reading-mode', readingToggle.checked);
    });

    themeToggle.addEventListener('change', () => {
      const nextTheme = themeToggle.checked ? 'dark' : 'light';
      document.body.classList.toggle('dark-mode', nextTheme === 'dark');
      localStorage.setItem('theme', nextTheme);
    });

    document.querySelector('[data-accessibility="reset"]').addEventListener('click', () => {
      baseFontSize = 100;
      root.style.fontSize = '';
      document.body.classList.remove('high-contrast', 'reading-mode');
      contrastToggle.checked = false;
      readingToggle.checked = false;
    });
  });
})();
