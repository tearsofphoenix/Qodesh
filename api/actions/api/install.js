/**
 * Created by isaac on 16/4/16.
 */
import mongoose from 'mongoose';
import { getIP, genToken } from '../lib/auth';
import config from '../config';
const Admin = mongoose.model('Admin');
const Hospital = mongoose.model('Hospital');
const Meta = mongoose.model('Meta');

export default function install(req) {

  return new Promise((resolve, reject) => {
    Meta.findOne({name: config.meta.installed}, (error, metaInfo) => {
      if (error) {
        console.log(error);
        reject({msg: error.message});
      } else {
        if (metaInfo && metaInfo.value) {
          reject({msg: '系统已安装!'});
        } else {
          const {admin, hospital} = req.body;
          const info = {
            ...hospital,
            deleted: false
          };
          const newHospital = new Hospital(info);
          newHospital.save((error) => {
            if (error) {
              reject({msg: '医院创建失败!'});
            } else {
              const {email, password, name, role, nick_name} = admin;
              if (email && password) {

                Admin.findOne({email}, (error, doc) => {
                  if (doc) {
                    reject({
                      msg: '邮箱已被注册!'
                    });
                  } else {
                    const user = new Admin();
                    user.email = email;
                    user.password = user.generateHash(password);
                    user.name = name;
                    user.role = role;
                    user.hospital = newHospital;
                    user.nick_name = nick_name;
                    user.deleted = false;
                    user.save((error) => {
                      if (error) {
                        console.log(error);
                        reject({msg: '注册失败!'});
                      } else {
                        delete user.password;

                        const meta = new Meta({name: config.meta.installed, value: 'true', hidden: true});
                        meta.save((error) => {
                          if (error) {
                            console.log(error.message);
                            reject({msg: '添加失败！'});
                          } else {
                            resolve({
                              code: config.code.success,
                              user: user,
                              access_token: genToken(user.id, getIP(req))
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                reject({msg: '缺少参数!'});
              }
            }
          });
        }
      }
    });
  });
}
