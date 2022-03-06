// Import the functions you need from the SDKs you need
var { initializeApp } = require("firebase/app");
var { getDatabase, ref, set, get, push } = require("firebase/database");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://esp8266-led-onoff-firebase1.vercel.app'],
}));
app.use(bodyParser.json())
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "XX",
  authDomain: "XX",
  projectId: "XX",
  storageBucket: "XX",
  messagingSenderId: "XX",
  appId: "XX"
};

// Initialize Firebase
initializeApp(firebaseConfig);

var db = getDatabase();

app.get('/logs', (req, res) => {
  get(ref(db, 'led')).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      res.send(data)
    } else {
      res.send({})
    }
  }).catch((error) => {
    console.error("Failed with error: " + error);
    res.status(500).send('Server Error')
  })
});

app.post('/ledOp', (req, res) => {
  let path = '';
  const payload = req.body;
  if (payload.led === 'red') {
    path = "/led/red";
  } else if (payload.led === 'green') {
    path = "/led/green";
  } else {
    res.status(400).send('Bad request');
  }
  const message = `${payload.user || 'Dummy'} turned ${payload.on ? 'ON' : 'OFF'} ${payload.led} led at ${new Date().toLocaleString()}`;
  const promises = [];
  promises.push(set(ref(db, `${path}/on`), payload.on));
  promises.push(push(ref(db, `${path}/logs`), message));

  Promise.all(promises).catch((error) => {
    console.error("Failed with error: " + error)
  }).then(() => {
    res.send({
      message: 'Led Status updated successfully'
    });
  });
});


app.listen(3002, () => console.log('Server listening on 3002'));
