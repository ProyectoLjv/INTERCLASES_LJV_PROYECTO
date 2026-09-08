(function initializeRegisterValidation() {
  const form = document.querySelector('[data-register-form]');

  if (!form) return;

  const nameInput = form.querySelector('[name="nombre"]');
  const passwordInput = form.querySelector('[name="password"]');
  const confirmInput = form.querySelector('[name="confirmPassword"]');
  const nameFeedback = form.querySelector('[data-name-feedback]');
  const confirmFeedback = form.querySelector('[data-confirm-feedback]');
  const rules = {
    length: (value) => value.length >= 8,
    uppercase: (value) => /[A-Z]/.test(value),
    number: (value) => /\d/.test(value),
    special: (value) => /[^A-Za-z0-9]/.test(value)
  };

  function updateName() {
    const name = nameInput.value.trim();
    if (!name) {
      nameFeedback.textContent = 'Usa solo letras y espacios.';
      nameFeedback.classList.remove('is-valid', 'is-invalid');
      return false;
    }

    const hasValidLength = name.length >= 3;
    const hasValidCharacters = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+)*$/.test(name);
    const isValid = hasValidLength && hasValidCharacters;
    nameFeedback.textContent = isValid
      ? 'Nombre válido.'
      : !hasValidLength
        ? 'El nombre debe tener al menos 3 caracteres.'
        : 'El nombre solo puede contener letras y espacios.';
    nameFeedback.classList.toggle('is-valid', isValid);
    nameFeedback.classList.toggle('is-invalid', !isValid);
    return isValid;
  }

  function updatePassword() {
    const results = Object.entries(rules).map(([ruleName, check]) => {
      const isValid = check(passwordInput.value);
      const item = form.querySelector(`[data-password-rule="${ruleName}"]`);
      item.classList.toggle('is-valid', isValid);
      item.classList.toggle('is-invalid', !isValid);
      return isValid;
    });
    return results.every(Boolean);
  }

  function updateConfirmation() {
    const isValid = confirmInput.value.length > 0 && confirmInput.value === passwordInput.value;
    confirmFeedback.textContent = isValid ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.';
    confirmFeedback.classList.toggle('is-valid', isValid);
    confirmFeedback.classList.toggle('is-invalid', !isValid);
    return isValid;
  }

  nameInput.addEventListener('input', updateName);
  passwordInput.addEventListener('input', () => {
    updatePassword();
    if (confirmInput.value) updateConfirmation();
  });
  confirmInput.addEventListener('input', updateConfirmation);
  form.addEventListener('submit', (event) => {
    const nameIsValid = updateName();
    const passwordIsValid = updatePassword();
    const confirmationIsValid = updateConfirmation();
    const isValid = nameIsValid && passwordIsValid && confirmationIsValid;
    if (!isValid) {
      event.preventDefault();
      form.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();