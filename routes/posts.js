var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    const contents = [];
    contents.push(req.body.content);
    console.info('投稿されました: ' + contents);
    res.redirect(303,'/');
  });



module.exports = router;