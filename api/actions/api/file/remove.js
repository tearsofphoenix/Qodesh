/**
 * Created by isaac on 16/5/9.
 */
import mongoose from 'mongoose';
import config from '../../config';
import fs from 'fs';
const File = mongoose.model('File');

export default function remove(req) {

  return new Promise((resolve, reject) => {
    const {id} = req.body;
    File.findOne({_id: id})
      .exec((error, doc) => {
        if (error) {
          console.log(error);
          reject({msg: '查找失败!'});
        } else {
          if (doc) {
            fs.unlinkSync(doc.path);
            doc.remove((error) => {
              if (error) {
                console.log(error);
                reject({msg: '删除失败!'});
              } else {
                resolve({code: config.code.success});
              }
            });
          } else {
            resolve({
              code: config.code.success
            });
          }
        }
      });
  });
}
