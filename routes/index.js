const express = require('express');
const router = express.Router();
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const Post = require('../models/post');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const authenticationEnsurer = require('./authentication-ensurer');
const config = require('../config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  let storedPosts = null;
  //評価済みMap(key:postId 、値：評価)を作成
  const selfEvaluationMap = new Map();
  //全評価Map(key:postId 、値：評価)を作成
  const rendSelfEvaluationMap = new Map();
  const title = 'Fixture-Form';

  Post.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'username', 'thumbUrl']
      }],
    order: [['id', 'DESC']]
  }).then((posts) => {
    storedPosts = posts;
    storedPosts.forEach((post) => {
      post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });

    return Evaluation.findAll({
      // include: [
      //   {
      //     model: User,
      //     attributes: ['userId','username','thumbUrl']
      //   }],
      where: { userId: req.user.provider + req.user.id }
    });
  }).then((evaluations) => {

    // forEach でselfEvaluationMapに{[postId:evaluation]…}入れていく
    // selfEvaluationMap.set(e.postId , e.evaluation)
    evaluations.forEach((e) => {
      selfEvaluationMap.set(e.postId, e.evaluations);
console.log('（評価済み）投稿' + e.postId + 'へあなたの評価は' + e.evaluations);
    });
    // storedPostsをforEachで回して、
    // const e = selfEvaluationMap.get(p.id) || 0
    // rendSelfEvaluationMap.set(p.id , e)
    storedPosts.forEach((p) => {
      const e = selfEvaluationMap.get(p.id) || 0;
      rendSelfEvaluationMap.set(p.id, e);
console.log('（全投稿）投稿' + p.id + 'へあなたの評価は' + e);
    });
  });

    // storedPostsごとforEachの、Evaluation.findAllの{evaluation: true}の合計
    // sumPostEvMap.set(postId , COUNT)
    return Evaluation.findAll({
      attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
      group: ['postId'],
      where: { evaluation: true }
    }).then((sumEva) => {
      const sumPostEvMap = new Map();
      sumEva.forEach((postEva) => {
        sumPostEvMap.set(postEva.postId, postEva.evaluation);
console.log(postEva.postId+'の「いいね」の数は'+postEva.evaluation);
      });
      // プラスするもの＝＞　rendSelfEvaluationMap , sumPostEvMap
      res.render('index', {
        title: title,
        user: req.user,
        posts: storedPosts,
        SelfEvaMap: rendSelfEvaluationMap,
        sumPostEvMap: sumPostEvMap,
        admin: config.admin,
        csrfToken: req.csrfToken()
      });
    });
});

function isMine(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && post.postedBy === userId;
}

function isAdmin(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && config.admin === userId;
}

router.post('/posts', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    const id = req.body.id;
    Post.findByPk(id).then((post) => {
      if (post && (isMine(req, post) || isAdmin(req, post))) {
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
