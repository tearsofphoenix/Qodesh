/*
 * Copyright(c) omk 2016
 * Filename: admin-api-test.js
 * Author  : Lin Chen <lc@omk.io>
 * Create  : 星期四,  2 六月 2016.
 */

import chai from 'chai';
/* import chaiHttp from 'chai-http';*/
import config from '../../../server/config'
/* const server = require('../../../../api');*/
/* const should = chai.should();*/
const should = chai.should();
import request from 'supertest';

/* chai.use(chaiHttp);*/
describe('Routing', () => {

  const url = 'http://localhost:3030';

  before((done) => {
    //do something prepare
    done();
  });

  const admin = {
    email: '123@omk.io',
    password: '123',
    role: 'superadmin'
  };

  let access_token = null;

  describe('#registerAdmin', () => {
    it('should register success on /admin/register POST', (done) => {

      request(url)
        .post('/admin/register')
        .send(admin)
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.be.a('object');
          res.body.should.have.property('code');
          res.body.user.should.have.property('email');
          res.body.code.should.be.equal(config.code.success);
          res.body.user.email.should.be.equal('123@omk.io');
          done();
        });
    });

    it('should return err using existing email on /admin/register POST', (done) => {

      request(url)
        .post('/admin/register')
        .send(admin)
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(500);
          res.text.should.be.equal('{"msg":"邮箱已被注册!"}');
          done();
        });
    });
  });

  describe('#loginAdmin', () => {
    it('should login success on /admin/login POST', (done) => {

      request(url)
        .post('/admin/login')
        .send(admin)
        .end((err, res) => {
          if(err) {return err;}
          res.body.should.be.a('object');
          res.body.should.have.property('code');
          res.body.should.have.property('user');
          res.body.should.have.property('access_token');
          access_token = res.body.access_token;
          res.body.code.should.be.equal(config.code.success);
          res.body.user.should.be.a('object');
          res.body.user.email.should.be.equal('123@omk.io');
          done();
        });
    });

    it('should return err missing email on /admin/login POST', (done) => {

      request(url)
        .post('/admin/login')
        .send({password: '234'})
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(500);
          res.text.should.be.equal('{"msg":"缺少参数"}');
          done();
        });
    })

    it('should return err missing password on /admin/login POST', (done) => {

      request(url)
        .post('/admin/login')
        .send({email: '123@omk.io'})
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(500);
          res.text.should.be.equal('{"msg":"缺少参数"}');
          done();
        });
    })


    it('should login error with error password on /admin/login POST', (done) => {

      request(url)
        .post('/admin/login')
        .send({email: '123@omk.io', password: '234'})
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(500);
          res.text.should.be.equal('{"msg":"密码错误"}');
          done();
        });
    });

    it('should login err with not exit email on /admin/login POST', (done) => {

      request(url)
        .post('/admin/login')
        .send({email: '234@omk.io', password: '123'})
        .end((err, res) => {
          if (err) {return err;}
          res.status.should.be.equal(500);
          res.text.should.be.equal('{"msg":"邮箱不存在"}');
          done();
        });
    });
  });

  describe('#allAdmin', () => {
    it('should retun all admins list on /admin/all GET', (done) => {
      request(url)
        .get('/admin/all')
        .set('x-access-token', access_token)
        .end((err, res) => {
          if(err) {return err;}
          res.status.should.be.equal(200);
          done();
        })
    });
  })
})
