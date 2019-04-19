var express = require('express');
var router = express.Router();
const contents = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user:req.user ,contents:contents});
});

router.post('/posts', function(req, res, next) {
    contents.push(req.body.content);
    console.info('投稿されました: ' + contents);
    res.redirect(303,'/');
});

module.exports = router;
