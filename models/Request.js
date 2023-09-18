// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: String,
  email: String,
  documentName: String,
});

module.exports = mongoose.model('Request', requestSchema);
