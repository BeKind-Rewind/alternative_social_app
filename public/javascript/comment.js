async function commentFormHandler(event) {
  event.preventDefault();

  const comment_text = document.querySelector('textarea[name="comment-body"]').value.trim();
  const post_id = window.location.toString().split('/')[
    window.location.toString().split('/').length - 1
  ];

  if (!comment_text) {
    showToast('Please enter a comment.');
    return;
  }

  const response = await apiFetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ post_id, comment_text }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.reload();
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('.comment-form').addEventListener('submit', commentFormHandler);
