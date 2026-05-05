const validation = require('../utils/validation');

describe('validation helpers', () => {
  test('parseSignup trims and lowercases email', () => {
    const r = validation.parseSignup({
      username: '  ada ',
      email: ' Ada@Example.COM ',
      password: 'secret123'
    });
    expect(r.data).toEqual({
      username: 'ada',
      email: 'ada@example.com',
      password: 'secret123'
    });
  });

  test('parseSignup rejects missing fields', () => {
    const r = validation.parseSignup({ username: '', email: 'a@b.com', password: 'x' });
    expect(r.error).toBeDefined();
    expect(r.error.status).toBe(400);
  });

  test('parseSignup rejects invalid email and short password', () => {
    expect(validation.parseSignup({
      username: 'ada',
      email: 'not-an-email',
      password: 'secret123'
    }).error.message).toBe('A valid email is required.');
    expect(validation.parseSignup({
      username: 'ada',
      email: 'ada@example.com',
      password: 'short'
    }).error.message).toBe('Password must be at least 8 characters.');
  });

  test('parseLogin requires email and password', () => {
    expect(validation.parseLogin({ email: '', password: 'x' }).error).toBeDefined();
    expect(validation.parseLogin({ email: 'a@b.com', password: 'x' }).data).toEqual({
      email: 'a@b.com',
      password: 'x'
    });
  });

  test('parseUserUpdate rejects empty body', () => {
    expect(validation.parseUserUpdate({}).error).toBeDefined();
  });

  test('parseUserUpdate rejects blank and invalid fields', () => {
    expect(validation.parseUserUpdate({ username: '   ' }).error.message).toBe('Username cannot be blank.');
    expect(validation.parseUserUpdate({ email: 'nope' }).error.message).toBe('A valid email is required.');
    expect(validation.parseUserUpdate({ password: 'short' }).error.message).toBe('Password must be at least 8 characters.');
  });

  test('parsePostCreate requires all fields', () => {
    expect(validation.parsePostCreate({ title: 't', content: '', post_url: 'u' }).error).toBeDefined();
    const ok = validation.parsePostCreate({
      title: ' t ',
      content: ' body ',
      post_url: ' https://ex.com '
    });
    expect(ok.data.title).toBe('t');
    expect(ok.data.post_url).toBe('https://ex.com');
  });

  test('parsePostCreate rejects non-http URLs', () => {
    expect(validation.parsePostCreate({
      title: 't',
      content: 'body',
      post_url: 'ftp://example.com'
    }).error.message).toBe('A valid http or https URL is required.');
  });

  test('parseCommentCreate requires text and numeric post', () => {
    expect(validation.parseCommentCreate({ comment_text: '', post_id: 1 }).error).toBeDefined();
    expect(validation.parseCommentCreate({ comment_text: 'x', post_id: '-2' }).error).toBeDefined();
    expect(validation.parseCommentCreate({ comment_text: 'x', post_id: '1.5' }).error).toBeDefined();
    const ok = validation.parseCommentCreate({ comment_text: ' hi ', post_id: '2' });
    expect(ok.data).toEqual({ comment_text: 'hi', post_id: 2 });
  });

  test('parseUpvote requires post_id', () => {
    expect(validation.parseUpvote({}).error).toBeDefined();
    expect(validation.parseUpvote({ post_id: 'abc' }).error).toBeDefined();
    expect(validation.parseUpvote({ post_id: 0 }).error).toBeDefined();
    expect(validation.parseUpvote({ post_id: 5 }).data.post_id).toBe(5);
  });

  test('parsePositiveInteger accepts only positive whole numbers', () => {
    expect(validation.parsePositiveInteger('9')).toBe(9);
    expect(validation.parsePositiveInteger(9)).toBe(9);
    expect(validation.parsePositiveInteger('0')).toBeNull();
    expect(validation.parsePositiveInteger('-1')).toBeNull();
    expect(validation.parsePositiveInteger('1.5')).toBeNull();
    expect(validation.parsePositiveInteger('abc')).toBeNull();
  });
});
