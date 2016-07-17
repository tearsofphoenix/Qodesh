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
  roles: ['superadmin', 'admin', 'director', 'doctor', 'nurse'],
  permissions: {
    message: ['read', 'list'],
    admin: ['create', 'update', 'search', 'logout', 'delete'],
    disease: ['create', 'search', 'delete'],
    doctor: ['create', 'update', 'search', 'delete'],
    drug: ['create', 'update', 'search', 'delete'],
    hospital: ['create', 'update', 'search', 'delete'],
    labor: ['create', 'search', 'delete'],
    medicare: ['create', 'search', 'delete'],
    order: ['create', 'search', 'delete'],
    patient: ['create', 'update', 'search', 'delete'],
    prescription: ['create', 'search', 'delete'],
    record: ['create', 'search', 'delete'],
    sheet: ['create', 'search', 'delete'],
    sheetresult: ['create', 'search', 'delete'],
    schedule: ['create', 'search', 'delete']
  },
  grants: {
    nurse: [
      'list_message', 'read_message',
      'create_medicare', 'search_medicare',
      'create_patient', 'update_patient', 'search_patient',
      'create_sheet', 'search_sheet',
      'create_sheetresult', 'search_sheetresult',
      'search_doctor'
    ],
    doctor: [
      'nurse',
      'create_disease', 'search_disease', 'delete_disease',
      'update_doctor',
      'create_order', 'search_order', 'delete_order',
      'create_prescription', 'search_prescription', 'delete_prescription',
      'create_record', 'search_record', 'delete_record'
    ],
    director: ['doctor',
      'create_doctor', 'search_doctor', 'delete_doctor', 'search_hospital',
      'create_schedule', 'search_schedule', 'delete_schedule'
    ],
    admin: ['director',
      'create_hospital', 'update_hospital', 'delete_hospital',
      'create_labor', 'search_labor', 'delete_labor',
      'update_admin', 'logout_admin', 'search_admin'
    ],
    superadmin: ['admin', 'create_admin', 'delete_admin',
      'create_drug', 'update_drug', 'search_drug', 'delete_drug'
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
        reject({msg: '会话已过期!', redirect: '/login', status: 410});
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
      reject({msg: '请登陆!', redirect: '/login', status: 301});
    }
  }
}

export function roleAuthPromise(req, action, resource, next) {
  return new Promise(roleAuth(req, action, resource, next));
}

var addRoleFilter = function (req, args, field) {
  const user = req.user;
  if (user) {
    if (user.role === 'director') {
      if (!field) {
        field = 'hospital';
      }
      args[field] = user.hospital;
    }
  }
};

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
  getIP: getIP,
  addRoleFilter: addRoleFilter
};