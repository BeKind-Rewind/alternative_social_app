async function editFormHandler(event) {
  event.preventDefault();

  const title = document.querySelector('input[name="post-title"]').value.trim();
  const content = document.querySelector('textarea[name="content"]').value.trim();

  if (!title || !content) {
    showToast('Title and content are required.');
    return;
  }

  const id = window.location.toString().split('/')[
    window.location.toString().split('/').length - 1
  ];

  const response = await apiFetch(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.replace('/dashboard/');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('.edit-post-form').addEventListener('submit', editFormHandler);
