const express = require("express");
const axios = require("axios");
const app = express();

app.get("/api", async (req, res) => {
  const { airport } = req.query;

  if (!airport) {
    return res.status(400).json({ error: "please provide the 'airport' parameter in GET" });
  }

  try {
    const { data } = await axios.get(
      `https://www.decolar.com/suggestions?locale=pt_BR&profile=sbox-flights&hint=${encodeURIComponent(airport)}`
    );

    const results = [];

    if (data?.items) {
      data.items.forEach(item => {
        item.items.forEach(local => {
          results.push(local.display);
        });
      });
    } else {
      return res.status(502).json({ error: "invalid response or missing items" });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "something went wrong", detail: err.message });
  }
});

app.listen(3000, () => console.log("🔥 API INFERNAL RODANDO NA PORTA 3000 🔥"));
