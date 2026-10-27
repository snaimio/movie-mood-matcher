// netlify/functions/tmdb.js
// Secure serverless gateway to proxy TMDB requests without exposing API credentials to the browser.

exports.handler = async function(event, context) {
  // Only permit GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'TMDB_API_KEY is not configured on the server. Please configure it in your Netlify Environment Variables.'
      })
    };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const endpoint = params.get('endpoint');

    if (!endpoint) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required "endpoint" parameter' })
      };
    }

    // Securely inject API key on the backend
    params.set('api_key', apiKey);
    params.delete('endpoint');

    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;
    const response = await fetch(tmdbUrl);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 5-minute cache for fast response times
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to communicate with TMDB API',
        message: error.message
      })
    };
  }
};
