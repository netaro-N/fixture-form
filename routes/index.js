var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const authenticationEnsurer = require('./authentication-ensurer');
const config = require('../config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', csrfProtection,(req, res, next) => {
  let storedPosts =null;
  //評価済みMap(key:postId 、値：評価)を作成
  const selfEvaluationMap = new Map();
  //全評価Map(key:postId 、値：評価)を作成
  const rendSelfEvaluationMap = new Map();
  const title = 'Fixture-Form';

  Post.findAll({
    include: [
      {
        model: User,
        attributes: ['userId','username','thumbUrl']
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
        where: { userId: req.user.provider+req.user.id}
    });
  }).then((evaluations) =>{
// forEach でselfEvaluationMapに{[postId:evaluation]…}入れていく
// selfEvaluationMap.set(e.postId , e.evaluation)


// storedPostsをforEachで回して、
// const e = selfEvaluationMap.get(p.id) || 0
// rendSelfEvaluationMap.set(p.id , e)

    res.render('index', {
      title: title,
      user: req.user,
      posts: storedPosts,
      admin: config.admin,
      csrfToken: req.csrfToken()
    });
  });
});

function isMine(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && post.postedBy === userId ;
}

function isAdmin(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && config.admin === userId ;
}

router.post('/posts', authenticationEnsurer, csrfProtection,(req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    const id = req.body.id;
    Post.findByPk(id).then((post) => {
      if(post && (isMine(req, post) || isAdmin(req, post)) ){
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
