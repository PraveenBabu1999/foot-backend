const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require ('cors');
require ('./models/db')
const Authrouter = require ('./routes/router')
const userRouter = require ('./routes/userRoute')
// const UserSchema = require ('./models/users')

const app = express();
const PORT = process.env.PORT || 5000 

app.use(bodyParser.json())
app.use(cors({
    origin: "http://localhost:4000", // Allow requests only from frontend
    credentials: true, // Allow cookies & authentication headers
}));

app.get('/',(req, res) =>{
    res.send(`<h1>Hello welcome to home page <h1/>`);
});

app.use('/auth',Authrouter);
app.use('/user',userRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
    
});