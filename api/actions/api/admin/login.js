/**
 * Created by isaac on 2/20/16.
 */

import mongoose from 'mongoose';
import {getIP, genToken, kExpirePeriod} from '../../lib/auth';
import config from '../../config';
const Admin = mongoose.model('Admin');
const checkcaptcha = false;

export default function login(req) {

  return new Promise((resolve, reject) => {
    // make async call to database
    const email = req.body.email;
    const password = req.body.password;
    const captcha = req.body.captcha;
    console.log(password);
    const process = () => {
      Admin.findOne({email: email})
        .populate('hospital doctor')
        .exec((error, doc) => {
          if (error) {
            console.log(error);
            reject({msg: '登陆失败!'});
          } else {
            if (doc) {
              if (doc.validPassword(password)) {
                doc.password = null;
                req.session.user = doc;
                req.session.exp = Date.now() + kExpirePeriod;
                resolve({
                  code: config.code.success,
                  user: doc,
                  access_token: genToken(doc.id, getIP(req))
                });
              } else {
                reject({msg: '密码错误'});
              }
            } else {
              reject({msg: '邮箱不存在'});
            }
          }
        });
    };

    if (email && password) {

      if (checkcaptcha) {
        if (req.session.captcha === captcha) {
          process();
        } else {
          reject({msg: '验证码错误'});
        }
      } else {
        process();
      }
    } else {
      reject({msg: '缺少参数'});
    }
  });
}
