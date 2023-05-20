const express = require('express')
const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require('./config/config');

const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL)
    .then(()=> {
        console.log("Successfully connected to database")
    })
    .catch((e)=>{
        console.log(e)
        // wait 5 sec then retry
        setTimeout(connectWithRetry, 5000) 
    })
}

connectWithRetry()

app.get("/" ,(req, res) => {
    res.send("hi1 aworld!!!")
})



const port = process.env.port || 3000

app.listen(port, ()=> console.log(`Listening on port ${port}`))