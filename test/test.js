'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Post = require('../models/post');
const Evaluation = require('../models/evaluation');
const deleteScheduleAggregate = require('../routes/index').deleteScheduleAggregate;

// describe('/login', () => {
//   before(() => {
//     passportStub.install(app);
//     passportStub.login({ username: 'testuser'});
//   });

//   after(() => {
//     passportStub.logout();
//     passportStub.uninstall(app);
//   });

//   it('ログインのためのリンクが含まれる', (done) => {
//     request(app)
//       .get('/login')
//       .expect('Content-Type', 'text/html; charset=utf-8')
//       .expect(/<a href="\/auth\/github"/)
//       .expect(200, done);
//   });

//   it('ログイン時はユーザー名が表示される', (done) => {
//     request(app)
//       .get('/login')
//       .expect(/testuser/)
//       .expect(200, done);
//   });
// });
  
// describe('/logout', () => {
//   it('ログアウト時は/にリダイレクトされる', (done) => {
//     request(app)
//       .get('/logout')
//       .expect('Location', '/')
//       .expect(302, done)
//   });
// });

describe('/', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 'test', provider: 'テスト', username: 'テストユーザー', photos:[{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('トップページ', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser',thumbUrl:'hoge' }).then(() => {
      Post.upsert({ postedBy: 'test0', content: 'test content'}).then(() => {
        request(app)
          .get('/')
          .expect(/test content/)
          .expect(200, done);
          // .end((err, res) => {
          //   const match = res.html.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
          //   const csrf = match[1];
          //   request(app)
          //     .post('/posts')
          //     .set('cookie', res.headers['set-cookie'])
          //     .send({ content: 'テスト1', _csrf: csrf })
          //     .expect('Location', '/')
          //     .expect(302)
              // .end((err, res) => {
              //   const createdSchedulePath = res.headers.location;
              //   request(app)
              //     .get(createdSchedulePath)
              //     // TODO 作成された予定と候補が表示されていることをテストする
              //     .expect(/テスト予定1/)
              //     .expect(200)
              //     .end((err, res) => { deleteScheduleAggregate(createdSchedulePath.split('/schedules/')[1], done, err); });
              // });
          // });
      });
    });
  });
});
