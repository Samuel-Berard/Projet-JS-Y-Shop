
const express = require('express');
const cors = require('cors');
const produitsRouter = require('./router/produits');
const panierRouter = require('./router/panier');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/produits', produitsRouter);

const contactRouter = require('./router/contact');
app.use('/api/contact', contactRouter);

app.use('/api/panier', panierRouter);

// Gestion des routes API inexistantes
app.use((req, res) => {
    res.status(404).json({ message: "Route API introuvable." });
});

app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});