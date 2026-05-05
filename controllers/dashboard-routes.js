const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');
const validateParam = require('../middleware/validateParam');

// Get all posts for dashboard
router.get('/', withAuth, async (req, res) => {
  try {
    const dbPostData = await Post.findAll({
      where: { user_id: req.session.user_id },
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

    const posts = dbPostData.map(post => post.get({ plain: true }));
    res.render('dashboard', {
      posts,
      loggedIn: true,
      profile_img: req.session.profile_img
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load dashboard.' });
  }
});

router.get('/edit/:id', withAuth, validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const dbPostData = await Post.findOne({
      where: {
        id,
        user_id: req.session.user_id
      },
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
      return res.status(404).end();
    }

    const post = dbPostData.get({ plain: true });
    res.render('edit-post', {
      post,
      loggedIn: true,
      profile_img: req.session.profile_img
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load edit page.' });
  }
});

module.exports = router;
