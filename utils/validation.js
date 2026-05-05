function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseSignup(body = {}) {
  const username = normalizeString(body.username);
  const email = normalizeString(body.email).toLowerCase();
  const password = body.password;
  if (!username || !email || !password) {
    return { error: { status: 400, message: 'username, email, and password are required.' } };
  }
  if (!isValidEmail(email)) {
    return { error: { status: 400, message: 'A valid email is required.' } };
  }
  if (typeof password !== 'string' || password.length < 8) {
    return { error: { status: 400, message: 'Password must be at least 8 characters.' } };
  }
  return { data: { username, email, password } };
}

function parseLogin(body = {}) {
  const email = normalizeString(body.email).toLowerCase();
  const password = body.password;
  if (!email || !password) {
    return { error: { status: 400, message: 'Email and password are required.' } };
  }
  if (!isValidEmail(email)) {
    return { error: { status: 400, message: 'A valid email is required.' } };
  }
  return { data: { email, password } };
}

function parseUserUpdate(body = {}) {
  const updateData = {};
  if (typeof body.username === 'string') {
    updateData.username = normalizeString(body.username);
    if (!updateData.username) {
      return { error: { status: 400, message: 'Username cannot be blank.' } };
    }
  }
  if (typeof body.email === 'string') {
    updateData.email = normalizeString(body.email).toLowerCase();
    if (!isValidEmail(updateData.email)) {
      return { error: { status: 400, message: 'A valid email is required.' } };
    }
  }
  if (typeof body.password === 'string') {
    updateData.password = body.password;
    if (updateData.password.length < 8) {
      return { error: { status: 400, message: 'Password must be at least 8 characters.' } };
    }
  }
  if (Object.keys(updateData).length === 0) {
    return { error: { status: 400, message: 'No valid fields to update.' } };
  }
  return { data: updateData };
}

function parsePostCreate(body = {}) {
  const title = normalizeString(body.title);
  const content = normalizeString(body.content);
  const post_url = normalizeString(body.post_url);
  if (!title || !content || !post_url) {
    return { error: { status: 400, message: 'title, content, and post_url are required.' } };
  }
  if (!isHttpUrl(post_url)) {
    return { error: { status: 400, message: 'A valid http or https URL is required.' } };
  }
  return { data: { title, content, post_url } };
}

function parsePostUpdate(body = {}) {
  const title = normalizeString(body.title);
  const content = normalizeString(body.content);
  if (!title || !content) {
    return { error: { status: 400, message: 'title and content are required.' } };
  }
  return { data: { title, content } };
}

function parseCommentCreate(body = {}) {
  const comment_text = normalizeString(body.comment_text);
  const post_id = parsePositiveInteger(body.post_id);
  if (!comment_text || !post_id) {
    return { error: { status: 400, message: 'comment_text and post_id are required.' } };
  }
  return { data: { comment_text, post_id } };
}

function parseUpvote(body = {}) {
  const post_id = parsePositiveInteger(body.post_id);
  if (!post_id) {
    return { error: { status: 400, message: 'post_id is required.' } };
  }
  return { data: { post_id } };
}

module.exports = {
  isHttpUrl,
  isValidEmail,
  normalizeString,
  parsePositiveInteger,
  parseSignup,
  parseLogin,
  parseUserUpdate,
  parsePostCreate,
  parsePostUpdate,
  parseCommentCreate,
  parseUpvote
};
