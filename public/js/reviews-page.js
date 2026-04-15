(function () {
  const reviewForm = document.getElementById('review-form');
  const programSelect = document.getElementById('programId');
  const list = document.getElementById('reviews-list');
  const status = document.getElementById('reviews-status');
  const allowedPrograms = ['Горные походы', 'Борьба и ОФП', 'Медиашкола'];

  if (!reviewForm || !programSelect || !list || !status) {
    return;
  }

  const setOptions = (select, items, labelBuilder) => {
    select.innerHTML = '';
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = labelBuilder(item);
      select.appendChild(option);
    });
  };

  const getJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error();
    }
    return response.json();
  };

  const getOrCreateParticipant = async () => {
    const participantsData = await getJson('/api/participants?limit=50');
    const participants = Array.isArray(participantsData.items)
      ? participantsData.items
      : [];
    const email = reviewForm.email.value.trim();
    const existing = participants.find((item) => item.email === email);

    if (existing) {
      return existing;
    }

    const response = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: reviewForm.fullName.value.trim(),
        age: Number(reviewForm.age.value),
        email,
        phone: reviewForm.phone.value.trim(),
        city: reviewForm.city.value.trim() || null,
        telegram: reviewForm.telegram.value.trim() || null,
      }),
    });

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  };

  const loadPrograms = async () => {
    const data = await getJson('/api/programs');
    const items = Array.isArray(data.items)
      ? data.items.filter((item) => allowedPrograms.includes(item.title))
      : [];
    setOptions(programSelect, items, (item) => item.title);
  };

  const loadReviews = async () => {
    list.innerHTML = '<p class="empty-state">Загрузка...</p>';

    try {
      const data = await getJson('/api/reviews');
      const items = Array.isArray(data.items) ? data.items : [];
      list.innerHTML = '';

      if (items.length === 0) {
        list.innerHTML = '<p class="empty-state">Отзывов пока нет</p>';
        return;
      }

      items.forEach((review) => {
        const card = document.createElement('article');
        card.className = 'entity-card';
        card.innerHTML = `
          <h3 class="article__title">Отзыв #${review.id}</h3>
          <p><strong>Программа:</strong> ${review.programId}</p>
          <p><strong>Оценка:</strong> ${review.rating}</p>
          <p>${review.comment}</p>
        `;
        list.appendChild(card);
      });
    } catch {
      list.innerHTML = '<p class="empty-state">Не удалось загрузить отзывы</p>';
    }
  };

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';

    try {
      const participant = await getOrCreateParticipant();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          programId: Number(programSelect.value),
          rating: Number(reviewForm.rating.value),
          comment: reviewForm.comment.value.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      status.textContent = 'Отзыв успешно отправлен';
      if (window.toastr) {
        window.toastr.success('Отзыв отправлен');
      }
      reviewForm.rating.value = '';
      reviewForm.comment.value = '';
      await loadReviews();
    } catch {
      status.textContent = 'Не удалось отправить отзыв';
      if (window.toastr) {
        window.toastr.error('Не удалось отправить отзыв');
      }
    }
  });

  Promise.all([loadPrograms(), loadReviews()]);
})();
