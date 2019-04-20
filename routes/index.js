var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const contents = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user:req.user ,contents:contents});
});

router.post('/posts', function(req, res, next) {
  const userId = req.user.provider + req.user.id;
  contents.push(req.body.content);

  Post.create({
      postedBy: userId,
      content: req.body.content
    }).then(() => {
      res.redirect(303,'/');
    });
});

module.exports = router;
