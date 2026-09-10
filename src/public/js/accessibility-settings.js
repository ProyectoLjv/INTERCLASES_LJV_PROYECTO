(function initializeAccessibilitySettings() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  const savedContrast = localStorage.getItem('accessibility-contrast') === 'true';
  const savedReading = localStorage.getItem('accessibility-reading') === 'true';
  const savedFontSize = parseInt(localStorage.getItem('accessibility-font-size'), 10);

  document.body.classList.toggle('dark-mode', theme === 'dark');
  if (savedContrast) document.body.classList.add('high-contrast');
  if (savedReading) document.body.classList.add('reading-mode');
  if (savedFontSize && !isNaN(savedFontSize)) {
    document.documentElement.style.fontSize = `${savedFontSize}%`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const accessibilityToggle = document.querySelector('#accessibility-toggle');
    const accessibilityPanel = document.querySelector('#accessibility-panel');
    const settingsToggle = document.querySelector('#settings-toggle');
    const settingsPanel = document.querySelector('#settings-panel');
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const contrastToggle = document.querySelector('[data-accessibility="contrast"]');
    const readingToggle = document.querySelector('[data-accessibility="reading"]');
    const root = document.documentElement;
    let baseFontSize = savedFontSize && !isNaN(savedFontSize) ? savedFontSize : 100;

    function setPanel(panel, toggle, isOpen) {
      panel.hidden = !isOpen;
      toggle.setAttribute('aria-expanded', String(isOpen));
    }

    function closePanels() {
      if (accessibilityPanel && accessibilityToggle) setPanel(accessibilityPanel, accessibilityToggle, false);
      if (settingsPanel && settingsToggle) setPanel(settingsPanel, settingsToggle, false);
    }

    if (!accessibilityToggle || !accessibilityPanel || !settingsToggle || !settingsPanel) return;

    if (themeToggle) themeToggle.checked = theme === 'dark';
    if (contrastToggle) contrastToggle.checked = savedContrast || document.body.classList.contains('high-contrast');
    if (readingToggle) readingToggle.checked = savedReading || document.body.classList.contains('reading-mode');

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

    const fontIncreaseBtn = document.querySelector('[data-font-action="increase"]');
    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => {
        baseFontSize = Math.min(baseFontSize + 10, 130);
        root.style.fontSize = `${baseFontSize}%`;
        localStorage.setItem('accessibility-font-size', baseFontSize);
      });
    }

    const fontDecreaseBtn = document.querySelector('[data-font-action="decrease"]');
    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => {
        baseFontSize = Math.max(baseFontSize - 10, 80);
        root.style.fontSize = `${baseFontSize}%`;
        localStorage.setItem('accessibility-font-size', baseFontSize);
      });
    }

    if (contrastToggle) {
      contrastToggle.addEventListener('change', () => {
        const isChecked = contrastToggle.checked;
        document.body.classList.toggle('high-contrast', isChecked);
        localStorage.setItem('accessibility-contrast', String(isChecked));
      });
    }

    if (readingToggle) {
      readingToggle.addEventListener('change', () => {
        const isChecked = readingToggle.checked;
        document.body.classList.toggle('reading-mode', isChecked);
        localStorage.setItem('accessibility-reading', String(isChecked));
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        const nextTheme = themeToggle.checked ? 'dark' : 'light';
        document.body.classList.toggle('dark-mode', nextTheme === 'dark');
        localStorage.setItem('theme', nextTheme);
      });
    }

    const resetBtn = document.querySelector('[data-accessibility="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        baseFontSize = 100;
        root.style.fontSize = '';
        document.body.classList.remove('high-contrast', 'reading-mode');
        if (contrastToggle) contrastToggle.checked = false;
        if (readingToggle) readingToggle.checked = false;
        localStorage.removeItem('accessibility-contrast');
        localStorage.removeItem('accessibility-reading');
        localStorage.removeItem('accessibility-font-size');
      });
    }
  });
})();
