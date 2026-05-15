const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const TOKEN = 'dad63931f69f3192e813f16291b859d66bab26ed2245ee3bf375a9def048cd2c';
  const pad = n => String(n).padStart(2,'0');
  
  // Buscar los últimos 5 días y tomar el penúltimo dato disponible
  // (el DOF publica hoy el FIX de ayer)
  const today = new Date();
  const hace7 = new Date(today); hace7.setDate(hace7.getDate()-7);
  const fechaHoy = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const fechaDesde = `${hace7.getFullYear()}-${pad(hace7.getMonth()+1)}-${pad(hace7.getDate())}`;
  const path = `/SieAPIRest/service/v1/series/SF43718/datos/${fechaDesde}/${fechaHoy}?token=${TOKEN}`;

  return new Promise((resolve) => {
    https.get({ hostname: 'www.banxico.org.mx', path, headers: { 'Bmx-Token': TOKEN } }, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => {
        try {
          const d = JSON.parse(data);
          const datos = d?.bmx?.series?.[0]?.datos?.filter(x => x.dato !== 'N/E');
          if (datos && datos.length >= 2) {
            // Tomar el PENÚLTIMO — ese es el que el DOF publica hoy
            const dof = datos[datos.length - 2];
            const val = parseFloat(dof.dato);
            if (!isNaN(val) && val > 5) {
              res.status(200).json({ val, fecha: dof.fecha });
              return resolve();
            }
          }
          res.status(500).json({ error: 'No data' });
          resolve();
        } catch(e) {
          res.status(500).json({ error: e.message });
          resolve();
        }
      });
    }).on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
  });
};
