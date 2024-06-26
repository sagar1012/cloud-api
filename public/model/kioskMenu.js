const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    children: [{ type: mongoose.Schema.Types.Mixed }]
});

module.exports = mongoose.model('Item', itemSchema);