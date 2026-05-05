async function logout() {
  const response = await apiFetch('/api/users/logout', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.replace('/');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('#logout').addEventListener('click', logout);
