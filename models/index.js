// import all models
const Post = require('./Post');
const User = require('./User');
const Vote = require('./Vote');
const Comment = require('./Comment');

// create associations
User.hasMany(Post, {
  foreignKey: 'user_id'
});

Post.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'SET NULL'
});

User.belongsToMany(Post, {
  through: Vote,
  as: 'voted_posts',

  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Post.belongsToMany(User, {
  through: Vote,
  as: 'voted_posts',
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Vote.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Vote.belongsTo(Post, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

User.hasMany(Vote, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Post.hasMany(Vote, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Comment.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'SET NULL'
});

Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  onDelete: 'SET NULL'
});

User.hasMany(Comment, {
  foreignKey: 'user_id',
  onDelete: 'SET NULL'
});

Post.hasMany(Comment, {
  foreignKey: 'post_id'
});

module.exports = { User, Post, Vote, Comment };
