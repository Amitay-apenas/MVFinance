const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos (HTML, CSS, JS) de dentro da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Modelo de Dados (Schema)
const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    description: String,
    value: Number,
    type: String, // 'income' ou 'expense'
    date: { type: String, default: () => new Date().toLocaleDateString('pt-BR') },
    timestamp: { type: Number, default: () => Date.now() }
}));

// Rotas da API
app.get('/api/transactions', async (req, res) => {
    try {
        const list = await Transaction.find().sort({ timestamp: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar transações" });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const newTx = new Transaction(req.body);
        await newTx.save();
        res.status(201).json(newTx);
    } catch (err) {
        res.status(400).json({ error: "Erro ao salvar transação" });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Excluído com sucesso" });
    } catch (err) {
        res.status(400).json({ error: "Erro ao deletar transação" });
    }
});

// Rota coringa: qualquer outra rota entrega o index.html da pasta public
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));