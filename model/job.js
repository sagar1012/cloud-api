const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    experienceLevel: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Job', jobSchema);