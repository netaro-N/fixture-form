var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const authenticationEnsurer = require('./authentication-ensurer');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'Fixture-Form';
  Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
    res.render('index', {
      title: title,
      user: req.user,
      posts: posts
    });
  });
});

function isMine(req, post) {
  
}

router.post('/posts', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    // console.log(req.body.id);
    const id = req.body.id;
    Post.findByPk(id).then((post) => {
      if(post && isMine(req, post)){
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
