const mongoose = require('mongoose');

const jobApplySchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    resume: { type: String }
});

module.exports = mongoose.model('jobApply', jobApplySchema);  