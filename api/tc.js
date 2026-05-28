const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'open.er-api.com',
      path: '/v6/latest/USD',
      method: 'GET'
    };
    
    https.get(options, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => {
        try {
          const d = JSON.parse(data);
          const val = d?.rates?.MXN;
          if (val && val > 5) {
            const fecha = new Date(d.time_last_update_utc)
              .toISOString().split('T')[0];
            res.status(200).json({ val, fecha });
          } else {
            res.status(500).json({ error: 'No se obtuvo TC' });
          }
          resolve();
        } catch(e) {
          res.status(500).json({ error: e.message });
          resolve();
        }
      });
    }).on('error', e => {
      res.status(500).json({ error: e.message });
      resolve();
    });
  });
};
