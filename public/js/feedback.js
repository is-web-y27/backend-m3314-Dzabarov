(function() {
  'use strict';

  class FeedbackManager {
    constructor() {
      this.storageKey = 'dagestan_feedbacks';
      this.feedbacks = this.loadFeedbacks();

      this.form = document.getElementById('feedback-form');
      this.feedbackList = document.getElementById('feedback-list');
      this.template = document.getElementById('feedback-template');

      this.init();
    }

    init() {
      if (!this.form || !this.feedbackList || !this.template) {
        return;
      }

      this.renderFeedbacks();
      this.setupEventListeners();
    }

    loadFeedbacks() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        return [];
      }
    }

    saveFeedbacks() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.feedbacks));
      } catch (error) {
        console.error('Ошибка при сохранении отзывов:', error);
        this.showMessage('Ошибка при сохранении данных', 'error');
      }
    }

    validateForm(data) {
      const errors = [];

      if (!data.name || data.name.length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
      }

      if (data.email && !this.isValidEmail(data.email)) {
        errors.push('Введите корректный email');
      }

      if (!data.rating || data.rating < 1 || data.rating > 5) {
        errors.push('Оценка должна быть от 1 до 5');
      }

      if (!data.comment || data.comment.length < 10) {
        errors.push('Комментарий должен содержать минимум 10 символов');
      }

      return errors;
    }

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    handleSubmit(event) {
      event.preventDefault();

      const formData = new FormData(this.form);
      const feedbackData = {
        id: Date.now(),
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        program: formData.get('program'),
        rating: parseInt(formData.get('rating')),
        comment: formData.get('comment').trim(),
        date: new Date().toLocaleString('ru-RU')
      };

      const errors = this.validateForm(feedbackData);

      if (errors.length > 0) {
        alert('Ошибки:\n' + errors.join('\n'));
        return;
      }

      this.addFeedback(feedbackData);
      this.form.reset();
      this.showMessage('Отзыв успешно добавлен!', 'success');
    }

    addFeedback(feedback) {
      this.feedbacks.push(feedback);
      this.saveFeedbacks();
      this.renderFeedbacks();
    }

    updateFeedback(id, updatedData) {
      const index = this.feedbacks.findIndex(f => f.id === id);
      if (index !== -1) {
        this.feedbacks[index] = { ...this.feedbacks[index], ...updatedData };
        this.saveFeedbacks();
        this.renderFeedbacks();
      }
    }

    deleteFeedback(id) {
      if (confirm('Удалить этот отзыв?')) {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.saveFeedbacks();
        this.renderFeedbacks();
        this.showMessage('Отзыв удален', 'info');
      }
    }

    createStars(rating) {
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
      }
      return stars;
    }

    getProgramName(program) {
      const programs = {
        'trekking': 'Горный треккинг',
        'wrestling': 'Борьба и ОФП',
        'media': 'Медиашкола'
      };
      return program ? programs[program] || program : 'Не указана';
    }

    renderFeedbacks() {
      this.feedbackList.innerHTML = '';

      if (this.feedbacks.length === 0) {
        this.feedbackList.innerHTML = '<p class="article">Пока нет отзывов. Будьте первым!</p>';
        return;
      }

      const sortedFeedbacks = [...this.feedbacks].sort((a, b) => b.id - a.id);

      sortedFeedbacks.forEach(feedback => {
        const feedbackElement = this.createFeedbackElement(feedback);
        this.feedbackList.appendChild(feedbackElement);
      });
    }

    createFeedbackElement(feedback) {
      const template = this.template.content.cloneNode(true);
      const element = template.querySelector('.feedback-item');

      element.dataset.id = feedback.id;
      element.querySelector('.feedback-name').textContent = feedback.name;
      element.querySelector('.feedback-program').textContent = this.getProgramName(feedback.program);
      element.querySelector('.rating-stars').textContent = this.createStars(feedback.rating);
      element.querySelector('.rating-value').textContent = `(${feedback.rating}/5)`;
      element.querySelector('.feedback-comment').textContent = feedback.comment;
      element.querySelector('.feedback-email').textContent = feedback.email ? `Email: ${feedback.email}` : '';
      element.querySelector('.feedback-date').textContent = `Добавлен: ${feedback.date}`;

      element.querySelector('.edit-btn').addEventListener('click', () => this.editFeedback(feedback.id));
      element.querySelector('.delete-btn').addEventListener('click', () => this.deleteFeedback(feedback.id));

      return element;
    }

    editFeedback(id) {
      const feedback = this.feedbacks.find(f => f.id === id);
      if (!feedback) return;

      document.getElementById('name').value = feedback.name;
      document.getElementById('email').value = feedback.email || '';
      document.getElementById('program').value = feedback.program || '';
      document.getElementById('rating').value = feedback.rating;
      document.getElementById('comment').value = feedback.comment;

      const submitBtn = this.form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Сохранить изменения';

      this.form.removeEventListener('submit', this.handleSubmitBound);

      const handleUpdate = (e) => {
        e.preventDefault();

        const updatedData = {
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          program: document.getElementById('program').value,
          rating: parseInt(document.getElementById('rating').value),
          comment: document.getElementById('comment').value.trim(),
          date: new Date().toLocaleString('ru-RU')
        };

        const errors = this.validateForm(updatedData);
        if (errors.length > 0) {
          alert('Ошибки:\n' + errors.join('\n'));
          return;
        }

        this.updateFeedback(id, updatedData);
        this.form.reset();
        submitBtn.textContent = 'Добавить отзыв';
        this.showMessage('Отзыв обновлен!', 'success');

        this.form.removeEventListener('submit', handleUpdate);
        this.form.addEventListener('submit', this.handleSubmitBound);
      };

      this.form.addEventListener('submit', handleUpdate);

      this.form.scrollIntoView({ behavior: 'smooth' });
    }

    showMessage(text, type) {
      const oldMessage = document.querySelector('.message');
      if (oldMessage) oldMessage.remove();

      const message = document.createElement('div');
      message.className = `message message--${type}`;
      message.textContent = text;
      message.style.cssText = `
                padding: 1rem;
                margin: 1rem 0;
                border-radius: var(--border-radius);
                background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
                color: ${type === 'success' ? '#155724' : '#721c24'};
                border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
            `;

      this.form.parentNode.insertBefore(message, this.form);

      setTimeout(() => message.remove(), 3000);
    }

    setupEventListeners() {
      this.handleSubmitBound = this.handleSubmit.bind(this);
      this.form.addEventListener('submit', this.handleSubmitBound);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    new FeedbackManager();
  });

})();