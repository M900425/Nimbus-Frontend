export default async function handler(req, res) {
  const { q, lat, lon } = req.query;

  let url;
  if (q) {
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10&addressdetails=1`;
  } else if (lat && lon) {
    url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  } else {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "NimbusWeatherApp/1.0 (your-email@example.com)",
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
