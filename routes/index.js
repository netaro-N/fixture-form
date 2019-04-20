var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const contents = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user:req.user ,contents:contents});
});

router.post('/posts', function(req, res, next) {
  console.log('リクエストユーザー（req.user.userid）の情報' + req.user.userid)
  contents.push(req.body.content);
    /*
  Post.create({
      postedBy: req.user
    })*/
    res.redirect(303,'/');
});

module.exports = router;
