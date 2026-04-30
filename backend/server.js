
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');


const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(express.json()); 

// on branche la route des produits sur /api/produits
app.use('/api/produits', productRoutes);

// on branche la route du panier sur /api/panier
app.use('/api/panier', cartRoutes);

app.get('/', (req, res) => {
    res.send("Le serveur est en ligne !");
});


app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});