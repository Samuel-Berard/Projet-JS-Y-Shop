const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/contacts.json');

const envoyerMessage = (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });
    }

    fs.readFile(dataPath, 'utf8', (err, data) => {
        let contacts = [];
        if (!err && data) {
            try {
                contacts = JSON.parse(data);
            } catch(e) {
                console.error("Erreur de parsing contacts.json", e);
            }
        }
        
        const nouveauMessage = {
            id: Date.now().toString(),
            name,
            email,
            message,
            date: new Date().toISOString()
        };
        
        contacts.push(nouveauMessage);
        
        fs.writeFile(dataPath, JSON.stringify(contacts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ erreur: "Erreur lors de l'enregistrement du message." });
            }
            res.status(201).json({ succes: true, message: "Message envoyé avec succès." });
        });
    });
};

module.exports = {
    envoyerMessage
};
