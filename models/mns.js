var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var MnsSchema = new Schema({
  rank: {type: Number},
  network: {type: String},
  ip: {type: String, index: true},
  txhash: {type: String, index: true},
  status: {type: String},
  addr: {type: String, index: true},
  version: {type: String},
  lastseen: { type: Date, expires: 28800},
  lastpaid: { type: Date},
  country: { type: String, default: "" },
  country_code: { type: String, default: "" }
});

module.exports = mongoose.model('Mns', MnsSchema);
