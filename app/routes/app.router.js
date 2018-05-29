module.exports = function(app) {

    var appController = require('../controllers/app.controller.js');

    // Create a new Note
    app.post('/generate', appController.generateCode);
}