/**
 * Created by isaac on 15/10/28.
 */
import path from 'path';
const uploadFolder = path.join(__dirname, '../../uploads');
module.exports = {
  code: {
    success: 1000
  },
  //db: 'mongodb://lxm:123@192.168.199.135:27017/uhs',
  db: 'mongodb://localhost/uhs',
  testDB: 'mongodb://localhost/uhs_test',
  protocol: 'uhs://',
  uploadFolder,
  meta: {
    installed: 'uhs.installed'
  }
};
