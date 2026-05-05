async function loginFormHandler(event) {
  event.preventDefault();

  const email = document.querySelector('#email-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();

  if (!email || !password) {
    showToast('Please enter email and password.');
    return;
  }

  const response = await apiFetch('/api/users/login', {
    method: 'post',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.replace('/dashboard/');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

async function signupFormHandler(event) {
  event.preventDefault();

  const username = document.querySelector('#username-signup').value.trim();
  const email = document.querySelector('#email-signup').value.trim();
  const password = document.querySelector('#password-signup').value.trim();

  if (!username || !email || !password) {
    showToast('Please fill in username, email, and password.');
    return;
  }

  if (password.length < 8) {
    showToast('Password must be at least 8 characters.');
    return;
  }

  const response = await apiFetch('/api/users', {
    method: 'post',
    body: JSON.stringify({ username, email, password }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    document.location.replace('/dashboard/');
  } else {
    showToast(await parseApiErrorMessage(response));
  }
}

document.querySelector('.login-form').addEventListener('submit', loginFormHandler);
document.querySelector('.signup-form').addEventListener('submit', signupFormHandler);
