var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('./config');

// モデルの読み込み
var User = require('./models/user');
var Post = require('./models/post');
var Evaluation = require('./models/evaluation');
User.sync().then(() => {
  Post.belongsTo(User, {foreignKey: 'postedBy'});
  Post.sync();
  Evaluation.belongsTo(User, {foreignKey: 'userId'});
  Evaluation.sync();
});

// GitHub認証
passport.use(new GitHubStrategy({
  clientID: config.github.CLIENT_ID,
  clientSecret: config.github.CLIENT_SECRET,
  callbackURL: config.github.callbackURL,
  scope: ['user:email'],
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      const userId = profile.provider + profile.id;  // サロゲートキー
      User.upsert({
        userId: userId,
        username: profile.username,
        thumbUrl: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  })
);

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
      const userId = profile.provider+profile.id  //サロゲートキー
      User.upsert({
        userId: userId,
        username: profile.username,
        thumbUrl: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


var indexRouter = require('./routes/index');
var logoutRouter = require('./routes/logout');
var evaluationsRouter = require('./routes/evaluations');
// var postsRouter = require('./routes/posts');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: '5b04d0ad49a2c506', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/logout', logoutRouter);
app.use('/post', evaluationsRouter);
// app.use('/posts', postsRouter);

// GitHub認証の実行およびコールバック処理
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/');
});

// Twitter認証の実行およびコールバック処理
app.get('/auth/twitter',
  passport.authenticate('twitter', { scope: ['user:email'] }),
  function (req, res){
});
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
