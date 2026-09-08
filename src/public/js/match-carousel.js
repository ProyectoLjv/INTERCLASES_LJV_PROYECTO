(function initializeMatchCarousel() {
  const carousel = document.querySelector('#match-carousel');

  if (!carousel) return;

  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const dotsContainer = carousel.querySelector('[data-carousel-dots]');
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const autoplayDelay = 4000;
  let activeIndex = 0;
  let autoplayTimer;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let isDragging = false;

  function getSlideDistance() {
    const slideStyles = window.getComputedStyle(slides[0]);
    const gap = parseFloat(window.getComputedStyle(slides[0].parentElement).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap + parseFloat(slideStyles.marginRight || 0);
  }

  function updateActiveDot(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    dotsContainer.querySelectorAll('.match-carousel__dot').forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    const targetIndex = (index + slides.length) % slides.length;
    viewport.scrollTo({ left: targetIndex * getSlideDistance(), behavior: 'smooth' });
    updateActiveDot(targetIndex);
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
  }

  function startAutoplay() {
    stopAutoplay();
    if (slides.length > 1) {
      autoplayTimer = window.setInterval(() => goToSlide(activeIndex + 1), autoplayDelay);
    }
  }

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'match-carousel__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mostrar partido ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      startAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  previousButton.addEventListener('click', () => {
    goToSlide(activeIndex - 1);
    startAutoplay();
  });

  nextButton.addEventListener('click', () => {
    goToSlide(activeIndex + 1);
    startAutoplay();
  });

  viewport.addEventListener('scroll', () => {
    if (!isDragging) {
      updateActiveDot(Math.round(viewport.scrollLeft / getSlideDistance()));
    }
  }, { passive: true });

  viewport.addEventListener('pointerdown', (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScrollLeft = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
    stopAutoplay();
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    viewport.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
  });

  function finishDragging(event) {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    if (event.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    goToSlide(Math.round(viewport.scrollLeft / getSlideDistance()));
    startAutoplay();
  }

  viewport.addEventListener('pointerup', finishDragging);
  viewport.addEventListener('pointercancel', finishDragging);
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  window.addEventListener('resize', () => goToSlide(activeIndex));

  updateActiveDot(0);
  startAutoplay();
})();