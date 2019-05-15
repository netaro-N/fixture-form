var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const authenticationEnsurer = require('./authentication-ensurer');
const config = require('../config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', csrfProtection,(req, res, next) => {
  const title = 'Fixture-Form';
  Post.findAll({
    include: [
      {
        model: User,
        attributes: ['userId','username']
      }],
    order: [['id', 'DESC']] 
  }).then((posts) => {
    posts.forEach((post) => {
      post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });
    res.render('index', {
      title: title,
      user: req.user,
      posts: posts,
      admin: config.admin,
      csrfToken: req.csrfToken()
    });
  });
});

function isMine(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && post.postedBy === userId ;
}

function isAdmin(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && config.admin === userId ;
}

router.post('/posts', authenticationEnsurer, csrfProtection,(req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    const id = req.body.id;
    Post.findByPk(id).then((post) => {
      if(post && (isMine(req, post) || isAdmin(req, post)) ){
        post.destroy().then(() => {
          res.redirect(303, '/');
        });
      } else {
        const err = new Error('指定された投稿がない、または、削除する権限がありません。');
        err.status = 404;
        next(err);
      }
    });
  } else {
    const userId = req.user.provider + req.user.id;
    Post.create({
      postedBy: userId,
      content: req.body.content
    }).then(() => {
      res.redirect(303, '/');
    });
  }
});

module.exports = router;
