const express = require('express')
const mongoose = require('mongoose');
const {connect} =require('mongoose'); // !
require('dotenv').config(); // !
const jwt = require('jsonwebtoken')
const cors = require('cors')
const User = require('./Models/User')
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const ws = require('ws')
const http = require('http');





const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));


const PORT =  4040;
const secret = process.env.secret_key;
const bcryptSalt = bcrypt.genSaltSync(10);

app.get('/test', (req,res) => {
    res.json('test ok');
  });

app.get('/profile', (req,res) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, secret, {}, (err, userData) => {
        if (err) throw err;
        res.json(userData);
      });
    } else {
      res.status(401).json('no token');
    }
  });


  app.post('/logout', (req,res) => {
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
  });

  app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const checkUser = await User.findOne({username});
    if (checkUser) {
      const checkPassword = bcrypt.compareSync(password, checkUser.password);
      if (checkPassword) {
        jwt.sign({userId:checkUser._id,username}, secret, {}, (err, token) => {
          res.cookie('token', token, {sameSite:'none', secure:true}).json({
            id: checkUser._id,
          });
        });
      }
    }
  });

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received data:', { username, password });  
    
    try {
      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
      const createdUser = await User.create({
        username: username,
        password: hashedPassword,
      });
  
      jwt.sign({ userId: createdUser._id, username }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { sameSite: 'none', secure: true })
          .status(201)
          .json({ id: createdUser._id , username });
      });
    } catch (err) {
      res.status(500).json('Error: ' + err.message);
    }
  });


connect(process.env.MONGO)
    .then(() => {
        server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
        console.log('Connected to MongoDB successfully!');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });


    const wss = new ws.WebSocketServer({server}) ;
    wss.on('connection' , (connection , req) => {
      
      const cookies = req.headers.cookie;
      if(cookies){
      const tokenString = cookies.split(';').find(str => str.trim().startsWith('token='))
      if(tokenString){
        const token = tokenString.split('=')[1]
        jwt.verify(token,secret, {} ,(error , userData) => {
          if(error) throw error;
          const {userId , username} = userData;
          connection.userId = userId;
          connection.username = username;

        })
      }
        
      }

      //console.log([...wss.clients].length)
      //console.log([...wss.clients].map(c => c.username))

      [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
          online: [...wss.clients].map(c => ({userId:c.userId, username:c.username}))
        }))
      })
    })

  
  
  