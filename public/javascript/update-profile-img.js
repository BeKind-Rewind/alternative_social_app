

const profileUploadForm = document.querySelector("#profile-upload")

profileUploadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  fetch('/api/users/profile', {
    method: 'post',
    body: new FormData(profileUploadForm)
  })
    .then((response) => {
      if (response.ok) {
        location.reload();
      }
    })
    .catch((err) => {
      console.error(err);
    })
})