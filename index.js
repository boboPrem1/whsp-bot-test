// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Vérification du webhook (Meta appelle ça une fois à la config)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Réception des messages
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;      // numéro de l'expéditeur
  const text = message.text?.body?.toLowerCase();

  let reply = 'Je ne comprends pas encore cette commande.';
  if (text === 'ping') reply = 'pong 🏓';
  if (text === 'bonjour') reply = 'Bonjour ! Comment puis-je t\'aider ? 👋';

  await axios.post(
    `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: from,
      text: { body: reply }
    },
    { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
  );

  res.sendStatus(200);
});

app.listen(3001, () => console.log('✅ Webhook en écoute sur :3001'));