var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
/*
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    const decoded = decodeURIComponent(body);
    const content = decoded.split('content=')[1];
*/
    console.info('投稿されました: ' + req.body.content);
    res.redirect(303,'/');
  });



module.exports = router;