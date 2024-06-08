const express = require('express');
const fetch = require('node-fetch');
const EventEmitter = require('events').EventEmitter;
const path = require('path');

const EVENT_NAME = "Execute";
const REQUEST_TIMEOUT = 30000;

const app = express();
const executeEvent = new EventEmitter();

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/executeRequest', (req, res) => {
  const code = req.body.code;

  if (!code) {
    return res.sendStatus(400); 
  }

  executeEvent.emit(EVENT_NAME, code);
  res.sendStatus(200);
});

app.get('/fetchexecuteRequest', (req, res) => {
  let timeout;
  const listener = (code) => {
    clearTimeout(timeout);
    res.json({ code: code });
  };

  executeEvent.once(EVENT_NAME, listener);

  timeout = setTimeout(() => {
    executeEvent.removeListener(EVENT_NAME, listener);
    res.sendStatus(500);
  }, REQUEST_TIMEOUT);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
