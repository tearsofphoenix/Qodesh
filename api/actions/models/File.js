/**
 * Created by yons on 16/3/15.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
//附件
var FileSchema = mongoose.Schema({

  name         : String, //名称
  original_name : String,
  path         : String, //路径
  size         : Number,
  type         : String,
  creator      : {type: ObjectId, ref: 'Admin'},
  deleted      : {type: Boolean, default: false},
  create_time  : {type: Date, default: Date.now}
});

module.exports = mongoose.model('File', FileSchema);
