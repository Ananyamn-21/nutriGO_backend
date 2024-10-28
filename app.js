const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const auth = require('./routes/auth')
const food = require('./routes/food')
const cors = require('cors');
dotenv.config()

const PORT = process.env.PORT || 5000
const url = process.env.MONGO_URI

const app = express()


app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,DELETE',  
    credentials: true                
  }));

app.use(express.json())


app.use('/auth', auth)
app.use('/food',food)


mongoose.connect(url)
.then(() => console.log('connected to mongodb'))
.catch(err => console.error(err))



app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
