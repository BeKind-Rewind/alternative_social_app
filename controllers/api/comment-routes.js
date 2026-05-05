const router = require('express').Router();
const { Comment } = require('../../models');
const withAuth = require('../../utils/auth');
const validateBody = require('../../middleware/validateBody');
const validateParam = require('../../middleware/validateParam');
const { parseCommentCreate } = require('../../utils/validation');

router.get('/', async (req, res) => {
  try {
    const dbCommentData = await Comment.findAll();
    res.json(dbCommentData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load comments.' });
  }
});

router.post('/', withAuth, validateBody(parseCommentCreate), async (req, res) => {
  try {
    const { comment_text, post_id } = req.validated;

    const dbCommentData = await Comment.create({
      comment_text,
      user_id: req.session.user_id,
      post_id
    });
    res.json(dbCommentData);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not add comment.' });
  }
});

router.delete('/:id', withAuth, validateParam('id'), async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'No comment found with this id!' });
    }

    if (Number(comment.user_id) !== Number(req.session.user_id)) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    const dbCommentData = await Comment.destroy({ where: { id } });

    if (!dbCommentData) {
      return res.status(404).json({ message: 'No comment found with this id!' });
    }
    res.json(dbCommentData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete comment.' });
  }
});

module.exports = router;
