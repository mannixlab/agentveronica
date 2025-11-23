import express from "express";
import Busboy from "busboy";
import crypto from "crypto";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();

// A robust CORS middleware for Google Cloud Functions (gen2)
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
    } else {
      next();
    }
});

app.post("/", (req, res) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    let audioBuffer = Buffer.alloc(0);

    busboy.on("file", (fieldname, file) => {
      file.on("data", (data) => {
        audioBuffer = Buffer.concat([audioBuffer, data]);
      });
    });

    busboy.on("finish", async () => {
      if (!audioBuffer.length) {
        return res
          .status(400)
          .json({ success: false, error: "No audio file received" });
      }

      const host = process.env.ACR_HOST;
      const accessKey = process.env.ACR_ACCESS_KEY;
      const accessSecret = process.env.ACR_ACCESS_SECRET;

      if (!host || !accessKey || !accessSecret) {
        console.error("ACRCloud environment variables are not set on the server.");
        return res.status(500).json({ success: false, error: "Backend recognition service is not configured." });
      }

      const httpMethod = "POST";
      const httpUri = "/v1/identify";
      const dataType = "audio";
      const signatureVersion = "1";
      const timestamp = Math.floor(Date.now() / 1000);

      const stringToSign = `${httpMethod}\n${httpUri}\n${accessKey}\n${dataType}\n${signatureVersion}\n${timestamp}`;

      const signature = crypto
        .createHmac("sha1", accessSecret)
        .update(Buffer.from(stringToSign, "utf8"))
        .digest("base64");

      const form = new FormData();
      form.append("sample", audioBuffer, { filename: "sample.webm" });
      form.append("access_key", accessKey);
      form.append("data_type", dataType);
      form.append("signature_version", signatureVersion);
      form.append("signature", signature);
      form.append("sample_bytes", audioBuffer.length);
      form.append("timestamp", timestamp);

      try {
        const response = await fetch(`https://${host}/v1/identify`, {
          method: "POST",
          body: form,
          headers: form.getHeaders(),
        });

        const result = await response.json();

        if (result?.status?.code !== 0 || !result?.metadata?.music?.length) {
          return res.json({
            success: false,
            error: "No match found",
          });
        }

        const song = result.metadata.music[0];

        return res.json({
          success: true,
          title: song.title || "",
          artist: song.artists?.[0]?.name || "",
          acrid: song.acrid || "",
          timestamp: song.play_offset_ms
            ? Math.floor(song.play_offset_ms / 1000)
            : 0,
        });
      } catch (apiError) {
         console.error("ACRCloud API Error:", apiError);
         return res.status(500).json({ success: false, error: "Error communicating with recognition service." });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error("Overall backend error:", err);
    return res.json({
      success: false,
      error: err.message || "Unknown backend error",
    });
  }
});

export const recognizeSong = app;