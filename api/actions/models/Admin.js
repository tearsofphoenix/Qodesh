var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var ObjectId = mongoose.Schema.Types.ObjectId;

var AdminSchema = mongoose.Schema({

  name         : String,
  nick_name    : String,
  department   : String,
  position     : String,
  password     : { type: String, required: true},
  //contact
  mobile       : String,
  email        : { type: String, required: true, unique: true},
  wechat       : String,
  qq           : String,
  //personal
  gender       : {type: String, enum: ['Male', 'Female'], default: 'Male'},  //0: male, 1: female
  avatar       : {type: ObjectId, ref: 'File'},
  avatar_url   : String,
  birthday     : Date,
  comment      : String,

  //address parts
  area         : String,
  address_detail : String,
  zipcode      : String,

  // permission control
  role         : {type: String, enum: ['superadmin', 'admin', 'director', 'doctor', 'nurse'], default: 'doctor'},
  permission   : [String],
  create_time  : {type: Date, default: Date.now},
  update_time  : Date
});

// generating a hash
AdminSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
AdminSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
