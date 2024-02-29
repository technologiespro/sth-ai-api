const express = require('express');
const router = express.Router();
const jsonFile = require('jsonfile');
const config = jsonFile.readFileSync('./config.json');

const axios = require('axios');
let history = [
  {"role": "system", "content": config['defaultRole']},
  {"role": "user", "content": ""},
]

async function start(prompt) {

  //const info = await axios.get('http://127.0.0.1:7860/info');
  // console.log(info.data['named_endpoints']['/start'])
  let new_message = {"role": "assistant", "content": ""};
  let user_message =  {"role": "user", "content": prompt}

  let res = null;
  try {
    axios.post('http://192.168.31.110:6060/v1/chat/completions', {
      "messages": [
        {
          "role": "system",
          "content": config['defaultRole']
        },
        new_message,
        user_message
      ],
      "temperature": 0.7,
      "max_tokens": -1,
      top_p: 1, //1,
      frequency_penalty: 0,
      presence_penalty: 0,
      "stream": true
    }, {
      responseType: 'stream'
    }).then(response => {

      response.data.on('data', (chunk) => {

        const chunkStr = chunk.toString();


        try {
          let jsonData = JSON.parse( chunkStr.substr(6,chunkStr.length))
          if (jsonData.choices[0].delta.content) {
            new_message["content"] += jsonData.choices[0].delta.content
          }

          console.log(new_message);
        } catch(e) {

        }


        // logic to process stream data
      });

      response.data.on('end', () => {
        // logic for stream complete
        console.log('...end...')
      });

    });
    //console.log(res.data) ///.data.choices
  } catch (e) {
    console.log(e)
  }

  history.push()
  return new_message;

}

router.get('/test', async function (req, res, next) {
  const result = await start("чем занимаешься сегодня?")
  res.json(result);
});

router.post('/', async function (req, res, next) {
  const data = await start(req.body.text.trim());
  res.json(true);
});



module.exports = router;
