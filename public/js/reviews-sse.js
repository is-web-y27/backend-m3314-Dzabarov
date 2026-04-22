(function () {
  const feed = document.getElementById('sse-feed');

  if (!feed || typeof EventSource === 'undefined') {
    return;
  }

  const source = new EventSource('/reviews/stream');

  const addMessage = (text) => {
    const item = document.createElement('div');
    item.className = 'sse-message';
    item.textContent = text;
    feed.prepend(item);
  };

  source.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    const text = `Отзывы: ${payload.action} -> ${payload.title}`;
    addMessage(text);

    if (window.toastr) {
      window.toastr.info(text);
    }
  };
})();
