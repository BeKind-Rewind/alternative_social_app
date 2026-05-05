async function newFormHandler(event) {
  event.preventDefault();

  const title = document.querySelector('input[name="post-title"]').value.trim();
  const content = document.querySelector('textarea[name="content"]').value.trim();
  const post_url = document.querySelector('input[name="post_url"]').value.trim();

  if (!title || !content || !post_url) {
    showToast('Title, link, and content are required.');
    return;
  }

  const response = await apiFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, post_url }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.replace('/dashboard');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('.new-post-form').addEventListener('submit', newFormHandler);
