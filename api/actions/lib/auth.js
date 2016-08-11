/**
 * Created by isaac on 15/10/29.
 */
import url from 'url';
import moment from 'moment';
import jwt from 'jwt-simple';
const token_secret = 'omk-136f7caa-3067-43ad-9861-a09e37caa6af-veritas';
const pathWhiteList = ['/logout'];

export const kExpirePeriod = 30 * 60 * 1000; // half an hour

import RBAC from 'rbac';
const rbac = new RBAC({
  roles: ['superadmin', 'admin'],
  permissions: {
    message: ['read', 'list'],
    admin: ['create', 'update', 'search', 'logout', 'delete']
  },
  grants: {
    admin: [
      'update_admin', 'logout_admin', 'search_admin'
    ],
    superadmin: ['admin',
      'create_admin', 'delete_admin'
    ]
  }
}, function (err, rbac) {
  if (err) {
    throw err;
  }
  console.log('rbac init ok!');
});


var jwtEncode = function (data) {
  return jwt.encode(data, token_secret);
};

export function jwtDecode(data) {
  return jwt.decode(data, token_secret);
}

export function roleAuth(req, action, resource, next) {

  return (resolve, reject) => {
    const {user, exp} = req.session;
    const parsed_url = url.parse(req.url, true);
    if (pathWhiteList.indexOf(parsed_url.path) !== -1) {
      next(resolve, reject);
    } else if (user) {
      const now = Date.now();
      console.log('will check', exp, now);
      if (exp < now) {
        reject({msg: 'Session Expired!', redirect: '/login', status: 410});
      } else {
        req.session.exp = now + kExpirePeriod; // add half an hour
        console.log('will update', req.session.exp, now);
        if (action && resource) {
          rbac.can(user.role, action, resource, (error, can) => {
            if (error) {
              console.log(error);
              reject({msg: 'Internal Error!'});
            } else if (can) {
              next(resolve, reject);
            } else {
              reject({msg: 'Permission Denied!'});
            }
          });
        } else {
          //ignore rbac check
          next(resolve, reject);
        }
      }
    } else {
      reject({msg: 'Please Login!', redirect: '/login', status: 301});
    }
  }
}

export function genToken(userID, ext) {
  const expires = moment().add(4, 'hours').valueOf();
  return jwtEncode({
    iss: userID,
    exp: expires,
    ext: ext
  });
}

export function getIP(req) {
  const ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return ip;
}

export default {
  genToken: genToken,
  getIP: getIP
};