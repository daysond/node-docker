

const express = require('express')
const mongoose = require('mongoose')
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_PORT, REDIS_URL, SESSION_SECRET } = require('./config/config');

const cors = require("cors")

const session = require("express-session")
const redis = require('redis')
const RedisStore = require('connect-redis').default
const redisClient = redis.createClient({ url: `redis://${REDIS_URL}:${REDIS_PORT}` })
redisClient.connect().catch(console.error)

const app = express()

app.enable("trust proxy")

app.use(express.json())
app.use(session({
    proxy: true,
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30000 //1000*60*60*24*14      // 14 days in ms
    }
}))
app.use(cors())
const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

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

app.get("/api/v1" ,(req, res) => {
    res.send("hi1 aworld!!!")
    console.log("running......")
})


app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)
const port = process.env.port || 3000

app.listen(port, ()=> console.log(`Listening on port ${port}`))