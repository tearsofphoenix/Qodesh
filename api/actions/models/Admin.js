var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var ObjectId = mongoose.Schema.Types.ObjectId;

var AdminSchema = mongoose.Schema({

  name         : String,
  password     : { type: String, required: true},
  //contact
  email        : { type: String, required: true, unique: true},
  //personal
  gender       : {type: String, enum: ['Male', 'Female'], default: 'Male'},  //0: male, 1: female
  avatar       : {type: ObjectId, ref: 'File'},
  birthday     : Date,

  // permission control
  role         : {type: String, enum: ['superadmin', 'admin', 'director', 'doctor', 'nurse'], default: 'doctor'},
  permission   : [String],
  create_time  : {type: Date, default: Date.now},
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
