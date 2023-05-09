const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const data = JSON.parse(event.body);
  const response = await fetch('https://www.trybaseplate.io/api/endpoints/8fc09cbb-aba8-409d-862a-cb2a523fb2e5/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BASEPLATE_API_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } else {
    return {
      statusCode: response.status,
      body: await response.text()
    };
  }
};
