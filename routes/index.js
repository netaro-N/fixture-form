var express = require('express');
var router = express.Router();
const Post = require('../model/post');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user:req.user ,contents:contents});
});

router.post('/posts', function(req, res, next) {
  console.log('リクエストユーザー（req.user）の情報' + req.user)
    /*
  Post.create({
      postedBy: req.user
    })*/
    res.redirect(303,'/');
});

module.exports = router;
