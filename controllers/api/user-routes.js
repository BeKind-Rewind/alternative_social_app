const router = require('express').Router();
const { v2: cloudinary } = require('cloudinary');
const { User, Post, Comment, Vote } = require('../../models');
const withAuth = require('../../utils/auth');
const validateBody = require('../../middleware/validateBody');
const validateParam = require('../../middleware/validateParam');
const { parseSignup, parseLogin, parseUserUpdate } = require('../../utils/validation');

const allowedProfileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function userPublicJson(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profile_img: user.profile_img
  };
}

function startUserSession(req, res, user, payload) {
  req.session.regenerate((regenerateErr) => {
    if (regenerateErr) {
      console.error(regenerateErr);
      return res.status(500).json({ message: 'Could not start session.' });
    }

    req.session.user_id = user.id;
    req.session.username = user.username;
    req.session.profile_img = user.profile_img;
    req.session.loggedIn = true;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error(saveErr);
        return res.status(500).json({ message: 'Could not save session.' });
      }
      res.json(payload);
    });
  });
}

// Get all users
router.get('/', async (req, res) => {
  try {
    const dbUserData = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(dbUserData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load users.' });
  }
});

router.get('/:id', validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const dbUserData = await User.findOne({
      attributes: { exclude: ['password'] },
      where: { id },
      include: [
        { model: Post, attributes: ['id', 'title', 'post_url', 'content', 'created_at'] },
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at'],
          include: { model: Post, attributes: ['title'] }
        },
        { model: Post, attributes: ['title'], through: Vote, as: 'voted_posts' }
      ]
    });

    if (!dbUserData) {
      return res.status(404).json({ message: 'No user found with this id' });
    }
    res.json(dbUserData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load user.' });
  }
});

// Upload profile picture via Cloudinary
router.post('/profile', withAuth, async (req, res) => {
  const profilePicture = req.files?.profilePicture;
  if (!profilePicture) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  if (!allowedProfileTypes.includes(profilePicture.mimetype)) {
    return res.status(400).json({ message: 'Only image uploads are allowed.' });
  }

  if (profilePicture.size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: 'Profile image must be 5MB or smaller.' });
  }

  try {
    const user = await User.findByPk(req.session.user_id);
    if (!user) {
      return res.status(400).json({ message: 'User does not exist.' });
    }

    const response = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
      folder: 'alt-soc-app/profiles',
      resource_type: 'image'
    });
    user.profile_img = response.secure_url;
    req.session.profile_img = response.secure_url;
    await user.save();

    res.json({ message: 'Profile image updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed.' });
  }
});

// Create a new user
router.post('/', validateBody(parseSignup), async (req, res) => {
  try {
    const { username, email, password } = req.validated;

    const dbUserData = await User.create({
      username,
      email,
      password
    });

    startUserSession(req, res, dbUserData, userPublicJson(dbUserData));
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'That email is already registered.' });
    }
    res.status(500).json({ message: 'Could not create account. Please try again.' });
  }
});

// Login
router.post('/login', validateBody(parseLogin), async (req, res) => {
  try {
    const { email, password } = req.validated;

    const dbUserData = await User.findOne({ where: { email } });

    if (!dbUserData) {
      return res.status(400).json({ message: 'No user with that email address!' });
    }

    const validPassword = dbUserData.checkPassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Incorrect password!' });
    }

    startUserSession(req, res, dbUserData, {
      user: userPublicJson(dbUserData),
      message: 'You are now logged in!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => res.status(204).end());
  } else {
    res.status(404).end();
  }
});

// Update user (auth required)
router.put('/:id', withAuth, validateParam('id'), validateBody(parseUserUpdate), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    if (id !== Number(req.session.user_id)) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const [affected] = await User.update(req.validated, {
      individualHooks: true,
      where: { id }
    });

    if (!affected) {
      return res.status(404).json({ message: 'No user found with this id' });
    }
    res.json({ message: 'Profile updated.', affected });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'That email is already in use.' });
    }
    res.status(500).json({ message: 'Could not update profile.' });
  }
});

// Delete user (auth required)
router.delete('/:id', withAuth, validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    if (id !== Number(req.session.user_id)) {
      return res.status(403).json({ message: 'You can only delete your own account.' });
    }

    const dbUserData = await User.destroy({ where: { id } });

    if (!dbUserData) {
      return res.status(404).json({ message: 'No user found with this id' });
    }
    res.json(dbUserData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete account.' });
  }
});

module.exports = router;
