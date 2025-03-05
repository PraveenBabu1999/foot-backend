const mongoose = require ('mongoose')
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URI
const url= MONGO_URL

mongoose.connect(url)
.then(()=>{
    console.log('Mongodb is connected...');
}).catch((error)=>{
    console.log('Mongodb in not connected...');
    
})