// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import axios from 'axios';

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import cheerio from "cheerio";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
app.get('/api/meta', (req, res)=>{
  const websiteUrl = req.query.url;
  getMetaTags(websiteUrl)
.then((metaTags) => {
  res.send(metaTags)
  console.log('Meta tags:', metaTags);
})
.catch((error) => {
  console.error('Error:', error);
});
  
});
app.use("/api/*", shopify.validateAuthenticatedSession());


app.use(express.json());

const getMetaTags = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const metaTags = [];
    $('meta').each((index, element) => {
      const tag = $(element);
      const tagName = tag.attr('name') || tag.attr('property') || tag.attr('itemprop');
      const tagContent = tag.attr('content');
      if (tagName && tagContent) {
        metaTags.push({ name: tagName, content: tagContent });
      }
    });
    var icon = $('[rel="shortcut icon"]').attr('href');
    metaTags.push({name: 'icon', content: icon});
    return metaTags;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
