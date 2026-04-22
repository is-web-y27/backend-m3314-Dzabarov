(function() {
  'use strict';

  class NavigationManager {
    constructor() {
      this.navLinks = document.querySelectorAll('.nav__link');
      this.currentPath = window.location.pathname;
      this.init();
    }

    init() {
      this.setActiveLink();
      this.setupSmoothScrolling();
      this.setupKeyboardNavigation();
    }

    setActiveLink() {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === this.currentPath) {
          link.classList.add('nav__link--active');
        }
      });
    }

    setupSmoothScrolling() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(anchor.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }

    setupKeyboardNavigation() {
      this.navLinks.forEach((link, index) => {
        link.addEventListener('keydown', (e) => {
          let newIndex = index;

          switch(e.key) {
            case 'ArrowRight':
              newIndex = index < this.navLinks.length - 1 ? index + 1 : 0;
              break;
            case 'ArrowLeft':
              newIndex = index > 0 ? index - 1 : this.navLinks.length - 1;
              break;
            case 'Home':
              newIndex = 0;
              break;
            case 'End':
              newIndex = this.navLinks.length - 1;
              break;
            default:
              return;
          }

          e.preventDefault();
          this.navLinks[newIndex].focus();
        });
      });
    }
  }

  class FooterYearManager {
    constructor() {
      this.updateYear();
      this.updateStats();
    }

    updateYear() {
      const footerText = document.querySelector('.footer__text');
      if (footerText) {
        footerText.innerHTML = `&copy; ${new Date().getFullYear()} Джабаров Саид Аскерович, М3314`;
      }
    }

    updateStats() {
      const stats = document.getElementById('footer-stats');
      if (!stats || !window.performance) {
        return;
      }

      const clientElapsedTime = Math.round(window.performance.now());
      const serverElapsedTime = stats.dataset.serverElapsedTime;
      const serverText = serverElapsedTime ? ` · Сервер: ${serverElapsedTime}мс` : '';

      stats.innerHTML = `<p class="footer__load-time">Клиент: ${clientElapsedTime}мс${serverText}</p>`;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    new FooterYearManager();
  });

})();
