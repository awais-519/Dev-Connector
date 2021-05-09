const express = require('express');
const connectDb = require('./config/db');

const app = express();
//CONENCTING THE DATABASE
connectDb();


app.get('/', (req,res)=>res.send('API RUNNING NOW...')); 

const port = process.env.PORT || 5000;

app.listen(port, ()=> console.log (`Server Started on Port ${port}`));
