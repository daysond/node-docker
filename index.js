const express = require('express')
const mongoose = require('mongoose');

const app = express()

mongoose.connect('mongodb://dayson:123456@mongo:27017/?authSource=admin').then(()=> {
    console.log("Successfully connected to database")
}).catch((e)=>console.log(e))

app.get("/" ,(req, res) => {
    res.send("hi1 world!!!")
})



const port = process.env.port || 3000

app.listen(port, ()=> console.log(`Listening on port ${port}`))