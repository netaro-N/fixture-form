'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Post = require('../models/post');
const Evaluation = require('../models/evaluation');
const deleteScheduleAggregate = require('../routes/index').deleteScheduleAggregate;

// ログアウトのテスト
describe('/logout', () => {
  it('ログアウト時は/にリダイレクトされる', (done) => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done)
  });
});

// ログインおよび既存の投稿の確認
describe('/', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 'test', provider: 'テスト', username: 'テストユーザー', photos:[{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('テストユーザーのログインと、testuserによる投稿の確認', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser',thumbUrl:'hoge' }).then(() => {
      Post.upsert({ id:1, postedBy: 'test0', content: 'test content'}).then(() => {
        request(app)
          .get('/')
          .expect(/テストユーザー/)
          .expect(/test content/)
          .expect(200, done);
      });
    });
  });
});

// 新規投稿とその削除
describe('/posts', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 'test', provider: 'テスト', username: 'テストユーザー', photos:[{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('testuserによる新規投稿、確認、削除', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser',thumbUrl:'hoge' }).then(() => {
      Post.upsert({ id:1, postedBy: 'test0', content: 'test content'}).then(() => {
        request(app)
          .get('/')
          .expect(/テストユーザー/)
          .expect(/test content/)
          .expect(200, done)
          .end((err, res) => {
            const match = res.html.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
            const csrf = match[1];
            request(app)
              .post('/posts')
              .set('cookie', res.headers['set-cookie'])
              .send({ content: 'テストです', _csrf: csrf })
              .expect('Location', '/')
              .expect(302)
              .end((err, res) => {
              //ここpostedbyからpost.id  const createdSchedulePath = res.headers.location;
                request(app)
                  .get(createdSchedulePath)
                  // TODO 作成された投稿が表示されていることをテストする
                  .expect(/テストです/)
                  .expect(200)
                  .end((err, res) => { deleteScheduleAggregate(createdSchedulePath.split('/schedules/')[1], done, err); });
              });
          });
      });
    });
  });
});
