const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3001';

const state = {
  cookie: '',
  csrfToken: ''
};

function updateCookie(response) {
  const setCookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);

  if (setCookies.length > 0) {
    state.cookie = setCookies
      .map(cookie => cookie.split(';')[0])
      .join('; ');
  }
}

function updateCsrfToken(html) {
  const match = html.match(/<meta name="csrf-token" content="([^"]*)">/);
  if (!match) {
    throw new Error('Could not find CSRF token in rendered page.');
  }
  state.csrfToken = match[1];
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (state.cookie) {
    headers.set('Cookie', state.cookie);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const method = options.method || 'GET';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('X-CSRF-Token', state.csrfToken);
  }

  const response = await fetch(baseUrl + path, {
    ...options,
    headers,
    redirect: 'manual'
  });

  updateCookie(response);
  return response;
}

async function expectOk(label, response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${label} failed: ${response.status} ${response.statusText} ${text}`);
  }
  console.log(`ok - ${label}`);
  return response;
}

async function getPage(path) {
  const response = await expectOk(`GET ${path}`, await request(path));
  const html = await response.text();
  updateCsrfToken(html);
  return html;
}

async function jsonRequest(label, path, body, method = 'POST') {
  const response = await expectOk(label, await request(path, {
    method,
    body: JSON.stringify(body)
  }));
  return response.json();
}

async function main() {
  const suffix = Date.now();
  const credentials = {
    username: `smoke_${suffix}`,
    email: `smoke_${suffix}@example.com`,
    password: 'smokePass123'
  };

  await getPage('/login');

  const user = await jsonRequest('signup', '/api/users', credentials);
  if (!user.id) {
    throw new Error('Signup did not return a user id.');
  }

  await getPage('/dashboard');

  const post = await jsonRequest('create post', '/api/posts', {
    title: 'Smoke Test Post',
    content: 'Created by the smoke test.',
    post_url: `https://example.com/smoke-${suffix}`
  });
  if (!post.id) {
    throw new Error('Post create did not return a post id.');
  }

  await jsonRequest('upvote post', '/api/posts/upvote', { post_id: post.id }, 'PUT');
  const comment = await jsonRequest('comment post', '/api/comments', {
    post_id: post.id,
    comment_text: 'Smoke test comment.'
  });
  await jsonRequest('edit post', `/api/posts/${post.id}`, {
    title: 'Smoke Test Post Updated',
    content: 'Updated by the smoke test.'
  }, 'PUT');

  await expectOk('view post page', await request(`/post/${post.id}`));
  await expectOk('delete comment', await request(`/api/comments/${comment.id}`, { method: 'DELETE' }));
  await expectOk('delete post', await request(`/api/posts/${post.id}`, { method: 'DELETE' }));
  await expectOk('logout', await request('/api/users/logout', { method: 'POST' }));

  await getPage('/login');
  await jsonRequest('login', '/api/users/login', {
    email: credentials.email,
    password: credentials.password
  });

  await getPage('/dashboard');
  await expectOk('delete smoke user', await request(`/api/users/${user.id}`, { method: 'DELETE' }));

  console.log('smoke test complete');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
