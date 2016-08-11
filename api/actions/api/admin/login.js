/**
 * Created by isaac on 2/20/16.
 */

import mongoose from 'mongoose';
import {getIP, genToken, kExpirePeriod} from '../../lib/auth';
import config from '../../config';
const Admin = mongoose.model('Admin');

export default function (req) {

  return new Promise((resolve, reject) => {
    // make async call to database
    const {email, password} = req.body;

    if (email && password) {
      Admin.findOne({email: email})
        .exec((error, doc) => {
          if (error) {
            console.log(error);
            reject({msg: 'Login Failed!'});
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
                reject({msg: 'Password Error'});
              }
            } else {
              reject({msg: 'Email Not Exists!'});
            }
          }
        });
    } else {
      reject({msg: 'Missing Parameters'});
    }
  });
}
