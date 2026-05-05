const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment, Vote } = require('../../models');
const withAuth = require('../../utils/auth');
const validateBody = require('../../middleware/validateBody');
const validateParam = require('../../middleware/validateParam');
const { parsePostCreate, parsePostUpdate, parseUpvote } = require('../../utils/validation');

// Get all posts
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
    res.json(dbPostData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load posts.' });
  }
});

router.get('/:id', validateParam('id'), async (req, res) => {
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
        { model: User, attributes: ['username'] }
      ]
    });

    if (!dbPostData) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    res.json(dbPostData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load post.' });
  }
});

router.post('/', withAuth, validateBody(parsePostCreate), async (req, res) => {
  try {
    const { title, content, post_url } = req.validated;

    const dbPostData = await Post.create({
      title,
      content,
      post_url,
      user_id: req.session.user_id
    });
    res.json(dbPostData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create post.' });
  }
});

router.put('/upvote', withAuth, validateBody(parseUpvote), async (req, res) => {
  try {
    const { post_id } = req.validated;
    const updatedVoteData = await Post.upvote(
      { post_id, user_id: req.session.user_id },
      { Vote, Comment, User }
    );
    if (!updatedVoteData) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    res.json(updatedVoteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not record vote.' });
  }
});

router.put('/:id', withAuth, validateParam('id'), validateBody(parsePostUpdate), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const existingPost = await Post.findByPk(id);
    if (!existingPost) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    if (Number(existingPost.user_id) !== Number(req.session.user_id)) {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    const { title, content } = req.validated;
    const [affected] = await Post.update({ title, content }, { where: { id } });

    if (!affected) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    res.json({ message: 'Post updated.', affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update post.' });
  }
});

router.delete('/:id', withAuth, validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const existingPost = await Post.findByPk(id);
    if (!existingPost) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    if (Number(existingPost.user_id) !== Number(req.session.user_id)) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    const dbPostData = await Post.destroy({
      where: { id }
    });

    if (!dbPostData) {
      return res.status(404).json({ message: 'No post found with this id' });
    }
    res.json(dbPostData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete post.' });
  }
});

module.exports = router;
