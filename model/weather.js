const mongoose = require('mongoose');

const weatherSchema = mongoose.Schema({
    latitude: { type: Number },
    longitude: { type: Number },
    altitude: { type: Number },
    maxTemperature: { type: Number },
    minTemperature: { type: Number },
    relHumidityMorning: { type: Number },
    relHumidityAfternoon: { type: Number },
    windSpeed: { type: Number },
    brightSunshineHours: { type: Number },
    evaporation: { type: Number },
    rainFall: { type: Number },
    rainyDays: { type: Number },
    cumulativeRain: { type: Number },
});

module.exports = mongoose.model('weather', weatherSchema);