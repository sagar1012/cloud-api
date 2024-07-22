const mongoose = require('mongoose');

const weatherSchema = mongoose.Schema({
    latitude: { type: String },
    longitude: { type: String },
    altitude: { type: String },
    maxTemperature: { type: String },
    minTemperature: { type: String },
    relHumidityMorning: { type: String },
    relHumidityAfternoon: { type: String },
    windSpeed: { type: String },
    brightSunshineHours: { type: String },
    evaporation: { type: String },
    rainFall: { type: String },
    rainyDays: { type: String },
    cumulativeRain: { type: String },
});

module.exports = mongoose.model('weather', weatherSchema);