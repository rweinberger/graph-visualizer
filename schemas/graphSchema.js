var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Graph = new Schema({
  name: String,
  encrypted: Boolean,
  nodes: [
    {id: String}
  ],
  edges: [
    {source: String, target: String, value: Number}
  ]
});


module.exports = mongoose.model('Graph', Graph);