
const express = require('express');
const cors = require('cors');


const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(express.json()); 


app.get('/', (req, res) => {
    res.send("Le serveur est en ligne !");
});


app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});