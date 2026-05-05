const profileUploadForm = document.querySelector('#profile-upload');

profileUploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const response = await apiFetch('/api/users/profile', {
      method: 'post',
      body: new FormData(profileUploadForm)
    });

    if (response.ok) {
      location.reload();
    } else {
      showToast(await parseApiErrorMessage(response));
    }
  } catch (err) {
    console.error(err);
    showToast('Upload failed. Check your connection and try again.');
  }
});
