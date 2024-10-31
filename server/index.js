const express = require('express')
const mongoose = require('mongoose');
const {connect} =require('mongoose'); // !
require('dotenv').config(); // !
const jwt = require('jsonwebtoken')
const cors = require('cors')
const User = require('./Models/User');
const Message = require('./Models/Message')
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

  async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token;
      if (token) {
        jwt.verify(token, secret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('no token');
      }
    });
  
  }

app.get('/msjs/:userId' , async (req,res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  console.log(userId,userData)
  const messages = await Message.find({
    sender:{$in:[userId,ourUserId]},
    destinataire:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);

})

app.get('/users' , async (req,res) => {
  const users = await User.find({},{_id:1,username:1});
  res.json(users);
})


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

       //console.log([...wss.clients].length)
      //console.log([...wss.clients].map(c => c.username))

      function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
          client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
          }));
        });
      }
    
      connection.isAlive = true;
    
      connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
          connection.isAlive = false;
          clearInterval(connection.timer);
          connection.terminate();
          notifyAboutOnlinePeople();
          console.log('dead');
        }, 1000);
      }, 5000);
    
      connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
      });
    
      
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

      connection.on('message' , async (message) => {
        const messageData = JSON.parse(message.toString());
        const {destinataire,messageEnvoyee} = messageData;
        //console.log(messageEnvoyee);
        if(destinataire,messageEnvoyee){
          const messageDoc = await Message.create({
            sender:connection.userId,
            destinataire,
            messageEnvoyee,  

          });
          [...wss.clients].filter(c => c.userId === destinataire).forEach(c => c.send(JSON.stringify({messageEnvoyee,sender:connection.userId,destinataire,_id:messageDoc._id})))
        }
      })
        
      }


      
     

     notifyAboutOnlinePeople();
    })

  
  
  