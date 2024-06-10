const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  title2: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('PageContent', PageContentSchema);