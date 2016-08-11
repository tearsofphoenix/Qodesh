/**
 * Created by yons on 16/3/15.
 */
import mongoose from 'mongoose';
import config from '../../config';
const File = mongoose.model('File');

export default function (req) {

  return new Promise((resolve, reject) => {
    const {file} = req;
    const obj = new File();
    obj.name = file.filename;
    obj.path = file.path;
    obj.size = file.size;
    obj.type = file.mimetype;
    obj.original_name = file.originalname;
    obj.deleted = false;
    obj.save((error) => {
      console.log(error);
      if (error) {
        reject({msg: error.message});
      } else {
        resolve({
          code: config.code.success,
          data: obj
        });
      }
    });
  });
}
