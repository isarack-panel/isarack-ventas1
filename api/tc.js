const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const today = new Date();
  const pad = n => String(n).padStart(2,'0');
  const fechaHoy = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  return new Promise((resolve) => {
    const path = `/indicadores/${fechaHoy}`;
    https.get({ hostname: 'sidof.segob.gob.mx', path }, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => {
        try {
          const d = JSON.parse(data);
          // Buscar el indicador DÓLAR
          const dolar = (d.indicadores || d).find(x =>
            x.tipo === 'DÓLAR' || x.nombre === 'DÓLAR' || x.clave === 'DOLAR'
          );
          if (dolar && dolar.valor) {
            const val = parseFloat(String(dolar.valor).replace(',','.'));
            if (!isNaN(val) && val > 5) {
              res.status(200).json({ val, fecha: fechaHoy });
              return resolve();
            }
          }
          res.status(500).json({ error: 'No encontrado', data: d });
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
