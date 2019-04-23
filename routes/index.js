var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const authenticationEnsurer = require('./authentication-ensurer');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'Fixture-Form';
  Post.findAll({order:[['id', 'DESC']]}).then((posts) => {
    res.render('index', {
      title: title,
      user:req.user ,
      posts:posts
    });
  });
});

router.post('/posts', (req, res, next) => {

  const userId = req.user.provider + req.user.id;
  Post.create({
      postedBy: userId,
      content: req.body.content
    }).then(() => {
      res.redirect(303,'/');
    });

});

module.exports = router;
