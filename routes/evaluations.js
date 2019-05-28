'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Evaluation = require('../models/evaluation');

router.post('/:postId/users/:userId', authenticationEnsurer, (req,res,next) => {
  const postId = req.params.postId;
  const userId = req.params.userId;
  let evaluation = req.body.evaluation;
console.log(userId+'さんの'+postId+'への評価は'+evaluation+'です');
  Evaluation.upsert({
    postId:postId,
    userId:userId,
    evaluation:evaluation
  }).then(() => {
    //以下、イイね総数を取得！
    //最後に ↓
    res.json( {status: 'OK', evaluation: evaluation} ) // 足す, countUpEv: countUpEv } )
  });
});

module.exports = router;