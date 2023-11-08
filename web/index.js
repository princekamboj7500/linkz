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
    'client_msg_id': '8880c239-41d5-4963-84f2-cbfbc6c095d0',
    '_x_reason': 'fetch-unfurl-preview',
    '_x_mode': 'online',
    '_x_sonic': 'true',
    '_x_app_name': 'client' 
  });
  var config = {
    method: 'post',
    url: 'https://squadifypro.slack.com/api/chat.unfurlLink?_x_id=2f1695db-1699352144.306&_x_csid=iFxV91H4HoA&slack_route=T021P866FQR&_x_version_ts=1699340254&_x_frontend_build_type=current&_x_desktop_ia=3&_x_gantry=true&fp=a1',
    headers: { 
      'Cookie': '_rdt_uuid=1665638065769.4fee7874-cfa3-425b-89be-64c12dfbbb54; __qca=P0-384703422-1665638066049; _lc2_fpi=e00b11ac9c9b--01gf7w99m6a26gz07dqdm9d6nk; __adroll_fpc=ba0c425dc45b794cdf51252c25561caa-1665638130554; _fbp=fb.1.1665638130954.29629324; b=.413a06d5545e66f5b84e63861b2ccd36; shown_ssb_redirect_page=1; shown_download_ssb_modal=1; show_download_ssb_banner=1; no_download_ssb_banner=1; ssb_instance_id=dccfd13f-ca28-54ac-9678-2c6435999b1e; tz=330; _gcl_au=1.1.727902760.1696395823; _lc2_fpi_meta={%22w%22:1696395823931}; _li_dcdm_c=.slack.com; __li_idexc=1; __li_idexc_meta={%22w%22:1698905193068%2C%22e%22:1699509993068}; cjConsent=MHxOfDB8Tnww; cjUser=511ed90a-6973-4033-b8a3-850c4818a4ad; _cs_c=0; _gid=GA1.2.2093111049.1699345020; lc=1699345033; x=413a06d5545e66f5b84e63861b2ccd36.1699352083; _cs_mk_ga=0.5862473719552557_1699352088606; DriftPlaybook=B; _gat_UA-56978219-1=1; _ga_QTJQME5M5D=GS1.1.1699352089.32.0.1699352089.60.0.0; _ga=GA1.1.997304085.1665638066; _cs_cvars=%7B%221%22%3A%5B%22Visitor%20ID%22%2C%22.413a06d5545e66f5b84e63861b2ccd36%22%5D%2C%222%22%3A%5B%22Is%20Signed%20In%22%2C%22true%22%5D%2C%223%22%3A%5B%22URL%20Path%22%2C%22%2Fintl%2Fen-in%2F%22%5D%2C%224%22%3A%5B%22Visitor%20Type%22%2C%22customer%22%5D%7D; _cs_id=5c32651e-4179-a104-fcab-2b7b49b3fec0.1665638065.30.1699352089.1699352089.1.1699802065714; _cs_s=1.0.0.1699353889868; __ar_v4=KDMBLDIYHFHI5NUNKGJ4LV%3A20231107%3A1%7CQCM34G7NBZEHHATIFDIUBJ%3A20231107%3A2%7C4UHU5P4P3FESHLUMNBLWAU%3A20231107%3A2%7CK2HN2U4VSJGOVKC2WJLQNH%3A20231107%3A1; _li_ss=CjkKBQgKELgWCgYI3QEQuBYKBQgMEMIWCgYIogEQuBYKCQj_____BxC9FgoGCIsBELgWCgYI0gEQuBYSPw2Jmk1XEjgKBgjKARC4FgoGCJMBELYWCgYIxQEQuBYKBgiUARC1FgoGCMcBELgWCgYIqwEQtRYKBgjIARC4FhI3DQLmSF8SMAoGCMoBELgWCgYIkwEQthYKBgjFARC4FgoGCMcBELgWCgYIqwEQthYKBgjIARC4FhIvDb_v3VgSKAoGCJMBELYWCgYIxQEQuBYKBgjHARC4FgoGCKsBELYWCgYIyAEQuBY; _li_ss_meta={%22w%22:1699352091926%2C%22e%22:1701944091926}; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Nov+07+2023+15%3A45%3A03+GMT%2B0530+(India+Standard+Time)&version=202211.1.0&isIABGlobal=false&hosts=&consentId=0a0798ca-a027-4506-afe3-6d510a06e221&interactionCount=0&landingPath=NotLandingPage&groups=1%3A1%2C3%3A1%2C2%3A1%2C4%3A1&AwaitingReconsent=false; d=xoxd-1CLYamaCsObYimwAZXYjoTPOueZJF7uqTyTI89EjFjsCZPo2UnWb%2F%2FRRjeuPQL3GRbUY%2FcbLzfWywoidMgEyLPFm%2FSSzvYZ4heqvl0YoXn%2Fmh%2F1wYU68%2B5W0huWGXWrPOUdmBd5dUYj1jpIrWUYEgi9a%2BD0ZkxPaK7QgN5ONdwCDa%2FSUtPsJeBx%2Be3SsKCxEDRbp4rvkYv4%3D; d-s=1699352111', 
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
