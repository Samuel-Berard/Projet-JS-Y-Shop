const express = require('express');
//cree un routeur
const router = express.Router();
//importe le controller de contact
const contactController = require('../controller/contact');

//route pour envoyer un message
router.post('/', contactController.envoyerMessage);

//exporter le router
module.exports = router;
