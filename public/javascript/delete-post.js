async function deleteFormHandler(event) {
  event.preventDefault();

  const id = window.location.toString().split('/')[
    window.location.toString().split('/').length - 1
  ];

  const response = await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });

  if (response.ok) {
    document.location.replace('/dashboard/');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('.delete-post-btn').addEventListener('click', deleteFormHandler);
