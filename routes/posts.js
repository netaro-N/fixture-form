var express = require('express');
var router = express.Router();
const contents = [];

router.post('/', function(req, res, next) {
    contents.push(req.body.content);
    console.info('投稿されました: ' + contents);
    res.redirect(303,'/');
});



module.exports = router;