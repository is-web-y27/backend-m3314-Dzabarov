(function() {
  'use strict';

  class ApiFeedbackManager {
    constructor() {
      this.apiUrl = 'https://jsonplaceholder.typicode.com/comments';
      this.apiCommentsContainer = document.getElementById('api-comments-container');
      this.loadApiBtn = document.getElementById('load-api-comments');
      this.apiCommentTemplate = document.getElementById('api-comment-template');

      this.init();
    }

    init() {
      if (this.loadApiBtn) {
        this.setupEventListeners();
      }
    }

    setupEventListeners() {
      this.loadApiBtn.addEventListener('click', () => this.loadApiComments());
    }

    async loadApiComments() {
      try {
        this.showLoader();

        const randomPostId = Math.floor(Math.random() * 100) + 1;
        const response = await fetch(`${this.apiUrl}?postId=${randomPostId}&_limit=5`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const comments = await response.json();
        this.displayApiComments(comments);

      } catch (error) {
        this.handleError(error);
      } finally {
        this.hideLoader();
      }
    }

    showLoader() {
      this.apiCommentsContainer.innerHTML = `
                <div class="loader">
                    <div class="spinner"></div>
                    <p>Загрузка комментариев...</p>
                </div>
            `;
      this.loadApiBtn.disabled = true;
      this.loadApiBtn.textContent = 'Загрузка...';
    }

    hideLoader() {
      this.loadApiBtn.disabled = false;
      this.loadApiBtn.textContent = 'Загрузить из API';
    }

    displayApiComments(comments) {
      this.apiCommentsContainer.innerHTML = '';

      if (!comments || comments.length === 0) {
        this.apiCommentsContainer.innerHTML = '<p class="article">Комментариев не найдено</p>';
        return;
      }

      comments.forEach(comment => {
        const commentElement = this.createApiCommentElement(comment);
        this.apiCommentsContainer.appendChild(commentElement);
      });
    }

    createApiCommentElement(comment) {
      const template = this.apiCommentTemplate.content.cloneNode(true);
      const element = template.querySelector('.api-comment-item');

      element.querySelector('.api-comment-name').textContent = comment.name || 'Аноним';
      element.querySelector('.api-comment-email').textContent = comment.email || '';
      element.querySelector('.api-comment-body').textContent = comment.body || '';
      element.querySelector('.api-comment-id').textContent = `ID: ${comment.id}`;

      return element;
    }

    handleError(error) {
      console.error('Ошибка при загрузке данных:', error);

      let errorMessage = 'Произошла ошибка при загрузке данных';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API не доступен. Попробуйте позже.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Ошибка на сервере. Попробуйте позже.';
      }

      this.apiCommentsContainer.innerHTML = `
                <div class="error-message">
                    <h4>Ошибка</h4>
                    <p>${errorMessage}</p>
                    <button class="button button--small" onclick="location.reload()">Попробовать снова</button>
                </div>
            `;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('api-comments-container')) {
      new ApiFeedbackManager();
    }
  });

})();