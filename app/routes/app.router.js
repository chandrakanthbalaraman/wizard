module.exports = function(app) {

    var appController = require('../controllers/app.controller.js');
    

    // Create a new Note
    app.post('/api/v1/generate', appController.generateCode);
    app.post('/api/v1/generate-layout', appController.generateLayout);
}