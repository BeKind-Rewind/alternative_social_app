(function () {
  function ensureRoot() {
    let root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.setAttribute('aria-live', 'polite');
      document.body.appendChild(root);
    }
    return root;
  }

  window.showToast = function showToast(message, variant) {
    const root = ensureRoot();
    const el = document.createElement('div');
    el.className = 'toast toast--' + (variant === 'success' ? 'success' : 'error');
    el.textContent = message;
    root.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('toast--visible');
    });
    window.setTimeout(function () {
      el.classList.remove('toast--visible');
      window.setTimeout(function () {
        el.remove();
      }, 250);
    }, 4500);
  };

  window.parseApiErrorMessage = async function parseApiErrorMessage(response) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (data && typeof data.message === 'string') {
        return data.message;
      }
    } catch (_) {
      /* ignore */
    }
    return response.statusText || 'Something went wrong.';
  };

  window.apiFetch = function apiFetch(url, options) {
    const requestOptions = options || {};
    const headers = new Headers(requestOptions.headers || {});
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    headers.set('X-Requested-With', 'XMLHttpRequest');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    return fetch(url, {
      ...requestOptions,
      headers
    });
  };
})();
