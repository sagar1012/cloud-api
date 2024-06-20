const mongoose = require('mongoose');

const jobApplySchema = new mongoose.Schema({
    title: { type: String },
    code: { type: String, unique: true },
    fullName: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    resume: { type: String }
});

module.exports = mongoose.model('jobApply', jobApplySchema);  