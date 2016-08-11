/**
 * Created by isaac on 16/3/3.
 */
import config from '../config';

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
