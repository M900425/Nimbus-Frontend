import https from "https";

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
    const data = await new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              "User-Agent": "NimbusWeatherApp/1.0 (your-email@example.com)",
            },
          },
          (response) => {
            let body = "";
            response.on("data", (chunk) => (body += chunk));
            response.on("end", () => {
              if (response.statusCode !== 200) {
                reject(
                  new Error(`Nominatim responded with ${response.statusCode}`),
                );
              } else {
                try {
                  resolve(JSON.parse(body));
                } catch (e) {
                  reject(new Error("Invalid JSON from Nominatim"));
                }
              }
            });
          },
        )
        .on("error", reject);
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Geocode error:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
