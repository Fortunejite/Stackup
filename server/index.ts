const { affinidiProvider } = require("@affinidi/passport-affinidi");

const express = require("express");
import { ProviderOptionsType } from "@affinidi/passport-affinidi";
import { Response, Request } from "express";
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const initializeServer = async () => {
  // ...

  app.get("/", function (req: Request, res: Response) {
    res.json({ success: "Express" });
  });

  // ...

  const providerOptions: ProviderOptionsType = {
    id: "affinidi",
    issuer: process.env.AFFINIDI_ISSUER || "",
    client_id: process.env.AFFINIDI_CLIENT_ID || "",
    client_secret: process.env.AFFINIDI_CLIENT_SECRET || "",
    redirect_uris: ["http://localhost:3000/auth/callback"] || "",
  };

  await affinidiProvider(app, providerOptions);

  // ...
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
};
initializeServer();