const axios = require('axios');
const { authenticate, generateToken } = require('../auth/authenticate');
const bcrypt = require('bcryptjs')
const knex = require('knex')


const knexConfig = require('../knexfile')
const db = knex(knexConfig.development)
module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
    const body = req.body
    const hash = bcrypt.hashSync(body.password, 12);
    body.password = hash; 
    db('users').insert(body)
    .then(result=> res.status(201).json(result))
    .catch(err => res.status(500).json({errorMessage: 'error adding user'}))
}

function login(req, res) {
  // implement user login
  const creds = req.body;
  if(!req.body.password){
    res.status(400).json({message: 'please add a password'})
  }
  if (!req.body.username) {
  res.status (400).json ({message: 'please add a username'});
}

  db('users').where({username: creds.username}).first()
  .then(user=>{
    if(user && bcrypt.compareSync(creds.password, user.password)){
      const token = generateToken(user);
      res.status(200).json({message: 'welcome to the show', token})
    }
    else{
      res.status(401).json({message: 'Bad token'})
    }})
    .catch(err => res.status(500).json({message:'sorry'}))
  
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
