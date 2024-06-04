const mongoose = require('mongoose');

const jobApplySchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    resume: { type: String },
    resumeMimeType: String
});

module.exports = mongoose.model('jobApply', jobApplySchema);  