
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');


const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(express.json()); 

// on branche la route des produits sur /api/produits
app.use('/api/produits', productRoutes);

app.get('/', (req, res) => {
    res.send("Le serveur est en ligne !");
});


app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});