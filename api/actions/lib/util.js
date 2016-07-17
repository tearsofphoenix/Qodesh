/**
 * Created by isaac on 16/3/3.
 */
import config from '../config';
import moment from 'moment';
import {jwtDecode} from './auth';

export function gather(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    const value = obj[key];
    console.log(key, value);
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

export function rangeFromString(str) {
  var range;
  if (str && str.length > 0) {
    var idx = str.indexOf('<');
    if (idx != -1) {
      range = str.split('<');
      range.splice(0, 0, '0');
    } else {
      idx = str.indexOf('>');
      if (idx != -1) {
        range = str.split('>');
        range.push(Number.MAX_VALUE + '');
      } else {
        idx = str.indexOf('-');
        if (idx != -1) {
          range = str.split('-');
        } else {
          range = [str, str];
        }
      }
    }
  } else {
    range = ['', ''];
  }

  return range;
}

export function orderFromDate(time, exact = true) {
  const time2 = moment(time).startOf('month').toDate();
  time2.setDate(1);
  let offset = 0;
  if (time2.getDay() > 1) {
    offset = -1;
  }

  const month = time.getMonth();
  const year = time.getFullYear();
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const offsetDate = time.getDate() + firstWeekday - 1;
  const index = 1; // start index at 0 or 1, your choice
  const weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7);
  const week = index + Math.floor(offsetDate / 7);

  let result = 0;
  if (exact || week < 2 + index) {
    result = week + offset;
  } else {
    result = (week === weeksInMonth ? index + 5 : week) + offset;
  }
  return result;
}

export function dateToWeekString(time) {
  const date = time.getDate();
  const day = time.getDay();
  let month = time.getMonth();
  let order = orderFromDate(time);
  if (day > date) {
    // fix for month which has 5 weeks, it's last week of last month
  } else {
    ++month;
  }
  if (order === 0) {
    order = 4;
  }
  const result = `${time.getFullYear()}_${month}_${order}`;
  return result;
}

export function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

export function randomString() {
  let time = new Date().getTime();
  let suffix = Math.random().toString(36).substring(5);
  return `${time}-${suffix}`;
}

export function listGenerator(req, Model, extraArgs, {populate, deepPopulate, sort} = {}) {
  return new Promise((resolve, reject) => {
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 20;
    let hospital = req.headers["x-hospital"];
    let args = {};
    if (extraArgs) {
      extraArgs.forEach((looper) => {
        if (typeof looper === 'string') {
          let value = req.query[looper];
          if (typeof value !== 'undefined') {
            args[looper] = value;
          }
        } else if (typeof looper === 'object') {
          Object.assign(args, looper);
        } else if (typeof looper === 'function') {
          Object.assign(args, looper(req));
        }
      });
    } else {
      args.deleted = false;
      args.hospital = hospital;
    }
    Model.count(args, (error, count) => {
      if (error) {
        reject({msg: error.message});
      } else {
        if (count === 0) {
          resolve({
            code: config.code.success,
            data: {
              total: 0,
              data: []
            }
          });
        } else {
          var middle = Model.find(args)
            .select('-__v')
            .skip(skip)
            .limit(limit);
          if (deepPopulate && deepPopulate.length > 0) {
            middle = middle.deepPopulate(deepPopulate);
          }
          if (populate) {
            middle = middle.populate(populate);
          }
          if (sort) {
            middle = middle.sort(sort);
          }
          middle.exec((err, docs) => {
            if (err) {
              console.log(err);
              reject({msg: '查找失败！'});
            } else {
              resolve({
                code: config.code.success,
                data: {
                  total: count,
                  data: docs
                }
              });
            }
          });
        }
      }
    });
  });
}

export function addDoctor(req, args) {
  const {user} = req.session;
  if (user) {
    const {role} = user;
    if (role === 'superadmin' || role === 'admin') {
      // no limits
    } else {
      args.doctor = user.doctor;
    }
  }
}

export function getUID(request) {
  let result = null;
  if (request) {
    const {user} = request.session;
    if (user) {
      result = user._id;
    } else {
      const token = request.headers["x-access-token"];
      result = jwtDecode(token).iss;
    }
  }
  return result;
}

export function addAdminID(req, args) {
  const {user} = req.session;
  if (user) {
    const {role} = user;
    if (role === 'superadmin' || role === 'admin') {
      // no limits
    } else {
      args.creator = getUID(req);
    }
  }
}

export function minutesToString(minutes) {
  let result = null;
  if (minutes > 60) {
    result = `${parseInt(minutes / 60, 10)}小时${minutes % 60}分钟`;
  } else {
    result = `${minutes}分钟`;
  }
  return result;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function isEmpty(obj) {
// null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}
