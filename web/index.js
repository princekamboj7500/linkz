// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import axios from 'axios';
import qs from 'qs';

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
app.get('/api/meta', async(req, res)=>{
  const websiteUrl = req.query.url;

  var data = qs.stringify({
    'token': 'xoxc-2057278219841-2068467992128-4426923932900-6c29c20076cad3380efafcaf897945e95d20bcf1a8e65fbf9de598fec48baa62',
    'url': websiteUrl,
    'channel': 'D04TNCHSREG',
    'client_msg_id': 'daaaf483-624f-4193-989b-7fa779950f7c',
    '_x_reason': 'fetch-unfurl-preview',
    '_x_mode': 'online',
    '_x_sonic': 'true',
    '_x_app_name': 'client' 
  });
  var config = {
    method: 'post',
    url: 'https://squadifypro.slack.com/api/chat.unfurlLink?_x_id=d87abec7-1687174240.331&_x_csid=736pEJsuVno&slack_route=T021P866FQR&_x_version_ts=1687166844&_x_frontend_build_type=current&_x_gantry=true&fp=d3',
    headers: { 
      'Cookie': '_cs_c=1; _rdt_uuid=1665638065769.4fee7874-cfa3-425b-89be-64c12dfbbb54; __qca=P0-384703422-1665638066049; _lc2_fpi=e00b11ac9c9b--01gf7w99m6a26gz07dqdm9d6nk; __adroll_fpc=ba0c425dc45b794cdf51252c25561caa-1665638130554; _fbp=fb.1.1665638130954.29629324; b=.413a06d5545e66f5b84e63861b2ccd36; shown_ssb_redirect_page=1; shown_download_ssb_modal=1; show_download_ssb_banner=1; no_download_ssb_banner=1; ssb_instance_id=dccfd13f-ca28-54ac-9678-2c6435999b1e; _gcl_au=1.1.112375193.1684399232; d=xoxd-hG%2BnmYtsdFCqUepDNZ5cuobiGfCFxutPk2mEPwekgtIwwuTHR4d8nqS5y600lPU3g20ZBgcAdfIssNBQjMGKrwEOT3RCt7Wq3Xnt9oW1GJZU91nnkgt90ykLmThYWSZSt6nKS6PyFL%2BWnKsIaKnGtcJqyeVTLrWRjaG1mUvlm%2FcU4O97UnJltxaTNA%3D%3D; d-s=1687174156; DriftPlaybook=A; _gid=GA1.2.1375837975.1687174168; _li_dcdm_c=.slack.com; _ga=GA1.1.997304085.1665638066; __ar_v4=K2HN2U4VSJGOVKC2WJLQNH%3A20230529%3A3%7C4UHU5P4P3FESHLUMNBLWAU%3A20230619%3A1%7CQCM34G7NBZEHHATIFDIUBJ%3A20230619%3A1; x=413a06d5545e66f5b84e63861b2ccd36.1687177198; _cs_mk_ga=0.3902415783765907_1687177208465; PageCount=1; _ga=GA1.3.997304085.1665638066; _gid=GA1.3.1375837975.1687174168; __pdst=a2c2e79e47f3442388cba55edc2daffb; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Jun+19+2023+17%3A52%3A42+GMT%2B0530+(India+Standard+Time)&version=202211.1.0&isIABGlobal=false&hosts=&consentId=0a0798ca-a027-4506-afe3-6d510a06e221&interactionCount=0&landingPath=NotLandingPage&groups=1%3A1%2C3%3A1%2C2%3A1%2C4%3A1&AwaitingReconsent=false; _cs_id=5c32651e-4179-a104-fcab-2b7b49b3fec0.1665638065.25.1687177365.1687177184.1.1699802065714; _cs_s=3.0.0.1687179165237; _ga_QTJQME5M5D=GS1.1.1687177200.27.1.1687177365.60.0.0', 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  })
  .catch(function (error) {
    console.log(error);
    res.send(error)
  });
  


  // await unfurl(websiteUrl)
  // .then((re) => console.log(re))
  // .catch(console.error)

  // const result = await unfurl(websiteUrl);
  // console.log(result);
  // getMetaTags(websiteUrl)
// .then((metaTags) => {
//   res.send(metaTags)
//   console.log('Meta tags:', metaTags);
// })
// .catch((error) => {
//   console.error('Error:', error);
// });
  
});
app.use("/api/*", shopify.validateAuthenticatedSession());


app.use(express.json());

const getMetaTags = async (url) => {
  try {

    const result = await unfurl(url);
    console.log(result);

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const link = new URL(url);
    const baseURI = link.protocol + '//' + link.hostname;
    const metaTags = [];
    $('meta').each((index, element) => {
      const tag = $(element);
      const tagName = tag.attr('name') || tag.attr('property') || tag.attr('itemprop');
      const tagContent = tag.attr('content');
      if (tagName && tagContent) {
        metaTags.push({ name: tagName, content: tagContent });
      }
    });
    var icon = false;
    if($('[rel="shortcut icon"]').attr('href')){
      icon = $('[rel="shortcut icon"]').attr('href');
      icon = new URL(icon, baseURI).href;
    }else if($('[rel="icon"]').attr('href')){
      icon = $('[rel="icon"]').attr('href');
      icon = new URL(icon, baseURI).href;
    }
    if(icon){
      metaTags.push({name: 'icon', content: icon});
    }
    
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
