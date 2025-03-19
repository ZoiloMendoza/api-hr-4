var request = require('request');
const parameterService = require("./parameter-service");

let options = null;
let from = null;

async function init() {
    options = {
        'method': 'POST',
        'url': 'https://api.sms.to/sms/send',
        'headers': {
          'Authorization': 'Bearer ' + await parameterService.getParameter("sms_api_key"),
          'Content-Type': 'application/json'
        }};
  from = await parameterService.getParameter("vonage_from");
}
async function sendSMS(to, text) {
  // Check if the vonage object is initialized
  if (!options) {
    await init();
  }
  options.body = JSON.stringify({
    "message": text,
    "to": to,
    "bypass_optout": true,
    "sender_id": from
  })
  return new Promise((resolve, reject) => {
    request(options, function (error, response) {
      if (error) {
        reject(error);
      }
      resolve(response.body);
    });
  });
}

module.exports = { name: 'sms-service', sendSMS };
