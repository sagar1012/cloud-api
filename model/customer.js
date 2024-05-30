const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  contact: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  company: String,
  message: String
});

module.exports = mongoose.model('Customer', customerSchema);