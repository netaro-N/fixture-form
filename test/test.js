'use strict';
const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Post = require('../models/post');
const Evaluation = require('../models/evaluation');
const deletePostAggregate = require('../routes/index').deletePostAggregate;

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
    passportStub.login({ id: 'test', provider: 'テスト', username: 'テストユーザー', photos: [{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('テストユーザーのログインと、testuserによる投稿の確認', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser', thumbUrl: 'hoge' }).then(() => {
      Post.upsert({ id: 1, postedBy: 'test0', content: 'test content' }).then(() => {
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
    passportStub.login({ id: 0, provider: 'test', username: 'testuser', photos: [{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('testuserによる新規投稿、確認、削除', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser', thumbUrl: 'hoge' }).then(() => {
      Post.upsert({ id: 1, postedBy: 'test0', content: 'test content' }).then(() => {
        request(app)
          .get('/')
          .expect(/testuser/)
          .expect(/test content/)
          //.expect(/<input type="hidden" name="_csrf" value=/)
          .expect(200)
          .end((err, res) => {
            const match = res.text.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
            const csrf = match[1];
            request(app)
              .post('/posts')
              .set('cookie', res.headers['set-cookie'])
              .send({ content: 'テストです', _csrf: csrf })
              .expect('Location', '/')
              .expect(302)
              .end((err, res) => {
                request(app)
                  .get('/')
                  // TODO 作成された投稿が表示されていることをテストする
                  .expect(/テストです/)
                  .expect(200)
                  .end((err, res) => {
                    const matchId = res.text.match(/<p class="test0" id="(.*?)" style="white-space:pre-wrap;">テストです/);
                    console.log('matchIdがでないなぁ＾＾＾＾＾' + matchId);
                    const id = matchId[1];
                    deletePostAggregate(id, done, err);
                  });
              });
          });
      });
    });
  });
});

// いいね機能のテスト
describe('/post/:postId/users/:userId', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, provider: 'test', username: 'testuser', photos: [{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('いいね機能のテスト', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser', thumbUrl: 'hoge' }).then(() => {
      Post.upsert({ id: 1, postedBy: 'test0', content: 'test content' }).then(() => {
        request(app)
          .get('/')
          //.expect(/testuser/)
          //.expect(/test content/)
          //.expect(200)
          .end((err, res) => {
            const match = res.text.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
            const csrf = match[1];
            request(app)
              .post('/posts')
              .set('cookie', res.headers['set-cookie'])
              .send({ content: 'テストです', _csrf: csrf })
              .end((err, res) => {
                request(app)
                  .get('/')
                  .end((err, res) => {
                    const matchId = res.text.match(/<p class="test0" id="(.*?)" style="white-space:pre-wrap;">テストです/);
                    const id = matchId[1];
                    const userId = 'test0';
                    request(app)
                      //postで評価をtrueに
                      .post(`/post/${id}/users/${userId}`)
                      .send({ evaluation: true })
                      .expect('{"status":"OK","evaluation":true}')
                      .end((err, res) => {
                        //assert.equalでも良いが、それよりも再びgetしてイイね総数を取得するほうがよりテストとしてふさわしい。
                        //いや、データベースが一番大事だから、だとしたらassert.equalだな
                        Evaluation.findAll({
                          where: { postId: id }
                        }).then((evaluations) => {
                          assert.equal(evaluations.length, 1);
                          assert.equal(evaluations[0].evaluation, true);
                          deletePostAggregate(id, done, err);
                        });
                      });
                  });
              });
          });
      });
    });
  });
});

// すべての削除テスト
describe('/posts?delete=1', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, provider: 'test', username: 'testuser', photos: [{ value: 'hoge' }] });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('投稿に関する全ての情報が削除できる', (done) => {
    User.upsert({ userId: 'test0', username: 'testuser', thumbUrl: 'hoge' }).then(() => {
      Post.upsert({ id: 1, postedBy: 'test0', content: 'test content' }).then(() => {
        request(app)
          .get('/')
          .end((err, res) => {
            const match = res.text.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
            const csrf = match[1];

            request(app)
              .post('/posts')
              .set('cookie', res.headers['set-cookie'])
              .send({ content: 'テスト２です', _csrf: csrf })
              .end((err, res) => {

                request(app)
                  .get('/')
                  .end((err, res) => {
                    const matchId = res.text.match(/<p class="test0" id="(.*?)" style="white-space:pre-wrap;">テスト２です/);
                    const id = matchId[1];
                    const userId = 'test0';
                    const setCookie = res.headers['set-cookie'];
                    const match = res.text.match(/<input type="hidden" name="_csrf" value="(.*?)">/);
                    const csrf = match[1];

                    const promiseEvaluation = new Promise((resolve) => {
                      request(app)
                        //postで評価をtrueに
                        .post(`/post/${id}/users/${userId}`)
                        .send({ evaluation: true })
                        .end((err, res) => {
                          if (err) done(err);
                          resolve();
                        });
                    });

                    //削除
                    const promiseDeleted = promiseEvaluation.then(() => {
                      return new Promise((resolve) => {
                        request(app)
                          .post(`/posts?delete=1`)
                          .set('Cookie', setCookie)
                          .send({ _csrf: csrf, id: id })
                          .end((err, res) => {
                            if (err) done(err);
                            resolve();
                          });
                      });
                    });

                    //テスト
                    promiseDeleted.then(() => {
                      //いいねが削除できているか？
                      const p1 = Evaluation.findAll({
                        where: { postId: id }
                      }).then((evaluations) => {
                        assert.equal(evaluations.length, 0);
                      });
                      //投稿が削除できているか？
                      const p2 = Post.findByPk(id).then((post) => {
                        assert.equal(!post, true);
                      });
                      Promise.all([p1, p2]).then(() => {
                        if (err) return done(err);
                        done();
                      });
                    });

                  });
              });
          });
      });
    });
  });
});
