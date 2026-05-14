export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const TOKEN = 'dad63931f69f3192e813f16291b859d66bab26ed2245ee3bf375a9def048cd2c';
  const today = new Date();
  const ayer = new Date(today); ayer.setDate(ayer.getDate() - 1);
  const pad = n => String(n).padStart(2, '0');
  const fechaAyer = `${ayer.getFullYear()}-${pad(ayer.getMonth()+1)}-${pad(ayer.getDate())}`;
  const hace10 = new Date(today); hace10.setDate(hace10.getDate() - 10);
  const fechaDesde = `${hace10.getFullYear()}-${pad(hace10.getMonth()+1)}-${pad(hace10.getDate())}`;
  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${fechaDesde}/${fechaAyer}?token=${TOKEN}`;
    const r = await fetch(url);
    const d = await r.json();
    const datos = d?.bmx?.series?.[0]?.datos?.filter(x => x.dato !== 'N/E');
    if (datos && datos.length > 0) {
      const ultimo = datos[datos.length - 1];
      const val = parseFloat(ultimo.dato);
      if (!isNaN(val) && val > 5) {
        return res.status(200).json({ val, fecha: ultimo.fecha });
      }
    }
    return res.status(500).json({ error: 'No data' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
