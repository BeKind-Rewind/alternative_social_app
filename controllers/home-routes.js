const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const validateParam = require('../middleware/validateParam');

// Get all posts for homepage
router.get('/', async (req, res) => {
  try {
    const dbPostData = await Post.findAll({
      attributes: [
        'id',
        'title',
        'content',
        'post_url',
        'created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
      ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: { model: User, attributes: ['username'] }
        },
        { model: User, attributes: ['username'] }
      ]
    });

    const posts = dbPostData.map(post => post.get({ plain: true }));
    res.render('homepage', {
      posts,
      loggedIn: req.session.loggedIn,
      profile_img: req.session.profile_img
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load homepage.' });
  }
});

// Get single post
router.get('/post/:id', validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const dbPostData = await Post.findOne({
      where: { id },
      attributes: [
        'id',
        'title',
        'content',
        'post_url',
        'created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
      ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: { model: User, attributes: ['username'] }
        },
        { model: User, attributes: ['username', 'profile_img'] }
      ]
    });

    if (!dbPostData) {
      return res.status(404).json({ message: 'No post found with this id' });
    }

    const post = dbPostData.get({ plain: true });
    res.render('single-post', {
      post,
      loggedIn: req.session.loggedIn,
      profile_img: req.session.profile_img
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load post.' });
  }
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/');
  }
  res.render('login');
});

module.exports = router;
