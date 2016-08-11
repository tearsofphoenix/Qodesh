/**
 * Created by isaac on 16/5/9.
 */
import mongoose from 'mongoose';
import config from '../../config';
import fs from 'fs';
const File = mongoose.model('File');

export default function (req) {

  return new Promise((resolve, reject) => {
    const {id} = req.body;
    File.findOne({_id: id})
      .exec((error, doc) => {
        if (error) {
          console.log(error);
          reject({msg: 'Fail!'});
        } else {
          if (doc) {
            fs.unlinkSync(doc.path);
            doc.remove((error) => {
              if (error) {
                console.log(error);
                reject({msg: 'Fail!'});
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
