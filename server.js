require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const koaBody = require('koa-body');
var bodyParser = require('koa-bodyparser');
const multer = require('@koa/multer');
const cors = require('@koa/cors');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
dotenv.config();
const fs = require('fs');
const path = require ('path');
var express = require('express');
//const bodyParser = require('body-parser')

const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('@koa/router');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');
//const getSubscriptionUrl = require('./server/getSubscriptionUrl');
//const connection = require('./server/connection');
//const shopifyScript = require('./shopify/script');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  HOST,
} = process.env;
//
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shippingbar"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  return "Connected!";
});
//
 //connection();
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(bodyParser());
  server.use(koaBody());
  server.use(cors());
  //const upload = multer();
  //server.use(multer());
  // var apps = express();
  // apps.use(bodyParser.urlencoded({ extended: true }))
  // apps.use(bodyParser.json())
  //
  server.use(session({ secure: true, sameSite: 'none' }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'read_orders', 'write_products','write_script_tags'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set('shopOrigin', shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
        });
        //create product webhook
        const registration = await registerWebhook({
           address: `${HOST}/webhooks/products/create`,
           topic: 'PRODUCTS_CREATE',
           accessToken,
           shop,
           apiVersion: ApiVersion.October19
         });
          const  registration2 = await registerWebhook({
           address: `${HOST}/webhooks/app/uninstalled`,
           topic: 'APP_UNINSTALLED',
           accessToken,
           shop,
           apiVersion: ApiVersion.October19
         });
          if (registration2.success) {
           console.log('Successfully registered unistall webhook!');
         } else {
           console.log('Failed to register unistall webhook', registration2.result);
         }
         if (registration.success) {
           console.log('Successfully registered webhook!');
         } else {
           console.log('Failed to register webhook', registration.result);
         }
         //
         this.scriptTagJsonUrl = `https://${shop}/admin/api/2020-01/script_tags.json`;
         const response = await fetch(this.scriptTagJsonUrl, {
          method: 'post'
          , headers : {
            "X-Shopify-Access-Token" : accessToken
            , "Accept" : "application/json"
            , "Content-Type" : "application/json"
          }
          , body : JSON.stringify({
            "script_tag" : {
              "event" : 'onload'
              , "src" : `${HOST}/script`
            }
          })
        })
         //
        //billing
        await saveShopdata(ctx, accessToken, shop);
       // await getSubscriptionUrl(ctx, accessToken, shop);
        ctx.redirect('/');
      },
    }),
  );

  const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

  router.post('/webhooks/products/create', webhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook);
  });
  router.post('/webhooks/app/uninstalled', webhook, (ctx) => {
    console.log('received uninstall webhook: ', ctx.state.webhook);
    console.log(ctx.state.webhook);
  });

  router.use('/script', async (ctx) => {
    try {
      var shop = ctx.query.shop;
      console.log(shop);
      var query = 'SELECT * FROM `users` WHERE name ="'+shop+'"';
      const data = await getdata(query);
      var id = data[0].id;
      var query2 = 'SELECT * FROM `shippingbars` WHERE user_id ="'+id+'"';
      var shpng_datas = await getdata(query2);
      var shpng_datas2 = JSON.stringify(shpng_datas);
      var stream;
      stream = fs.createWriteStream(path.join(__dirname, 'shopify', 'script.js'));
      stream.on('error', function(err) { /* error handling */ });
      stream.write("if(typeof jQuery == 'undefined'){document.write('<script type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js\"></script>');}")
      stream.write("var shpng_datss ="+shpng_datas2+"; var style_data ='';var html_data=''; var cartContents = fetch('/cart.js').then(response => response.json()).then(data => {var price=data.total_price/100; console.log(price);shpng_datss.forEach(function(shpng_data) {var opacity = '';if(shpng_data.opacity > 9){opacity = '1'; }else{ opacity = '0.'+shpng_data.opacity;} var message=''; if(price >= shpng_data.goal){message =shpng_data.achive_msg;}else if(price < shpng_data.goal && price > 0){var avail_price =shpng_data.goal - price; message =shpng_data.progress_msg+\"<span id='freeshipping-goal\"+shpng_data.id+\"'> \"+avail_price+\"</span>\";}else{message =shpng_data.intial_msg+\"<span id='freeshipping-goal\"+shpng_data.id+\"'> \"+shpng_data.goal+\"</span>\";} html_data +=\"<p id='freeshipping-p\"+shpng_data.id+\"'>\"+message+\"</p>\"; style_data+='div#freeShippingBar #freeshipping-goal'+shpng_data.id+'{ color:'+shpng_data.spt_color+' !important;} div#freeShippingBar #freeshipping-p'+shpng_data.id+' {background-color: '+shpng_data.bg_color+' !important; color: '+shpng_data.txt_color+' !important; margin-bottom: 0px !important; padding: '+shpng_data.padding+'px !important; font-size: '+shpng_data.font_size+'px !important; opacity: '+opacity+' !important;}'; }); $('head').append('<style>#freeShippingBar{ text-align: center !important; color: #ffffff !important; z-index: 9999; width: 100%; } \'+style_data+\' </style>'); $('body').prepend(\"<div id='freeShippingBar'>\"+html_data+\"</div>\");});");
      stream.end();
      var readStream = await fs.createReadStream(path.join(__dirname, 'shopify', 'script.js')); 
      console.log(readStream);
      ctx.body = await readStream;
      //ctx.res.statusCode = 200;
    } catch (err) { }
  });

  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, path.join(__dirname ,'/'))
      },
      filename: function (req, file, cb) {
          let type = file.originalname.split('.')[1]
          cb(null, `${file.fieldname}-${Date.now().toString(16)}.${type}`)
      }
  })
  //File upload restrictions
  const limits = {
      fields: 10,//Number of non-file fields
      fileSize: 500 * 1024,//File Size Unit b
      files: 1//Number of documents
  }
  const upload = multer({storage,limits});
  const type = upload.single('file');

  router.get('/allbars', async (ctx) => {
    var query = 'SELECT * FROM `shippingbars`';
    try {
      const data = await getdata(query);
      ctx.body = data;
    } catch (err) {
        // handle exception
    }
  });
  router.post('/createbar', koaBody({ multipart: true }),async (ctx) => {
    console.log(ctx.request.body.id);
    var id = ctx.request.body.id;
    var query ='';
    if(id){
      query = 'UPDATE `shippingbars` SET `bg_color`="'+ctx.request.body.bg_color+'",`txt_color`="'+ctx.request.body.txt_color+'",`spt_color`="'+ctx.request.body.spt_color+'",`opacity`="'+ctx.request.body.opacity+'",`bg_img`="",`name`="'+ctx.request.body.name+'",`goal`="'+ctx.request.body.goal+'",`intial_msg`="'+ctx.request.body.intial_msg+'",`progress_msg`="'+ctx.request.body.progress_msg+'",`achive_msg`="'+ctx.request.body.achive_msg+'",`padding`="'+ctx.request.body.padding+'",`font_size`="'+ctx.request.body.font_size+'",`close_button`="'+ctx.request.body.close_button+'" WHERE `id`="'+id+'"';
    }else{
      query = 'INSERT into `shippingbars`(`user_id`,`bg_color`,`txt_color`,`spt_color`,`opacity`,`padding`,`font_size`,`bg_img`,`name`,`goal`,`intial_msg`,`progress_msg`,`achive_msg`,`close_button`) VALUES("1","'+ctx.request.body.bg_color+'","'+ctx.request.body.txt_color+'","'+ctx.request.body.spt_color+'","'+ctx.request.body.opacity+'","'+ctx.request.body.padding+'","'+ctx.request.body.font_size+'","","'+ctx.request.body.name+'","'+ctx.request.body.goal+'","'+ctx.request.body.intial_msg+'","'+ctx.request.body.progress_msg+'","'+ctx.request.body.achive_msg+'","'+ctx.request.body.close_button+'")';
    }
    try {
      const data = await getdata(query);
      ctx.body = 'Done';
    } catch (err) {
        // handle exception
    }
  });
  router.use('/getonebar', async (ctx, next) => {
    var query = 'SELECT * FROM `shippingbars` WHERE `id`="'+ctx.query.id+'"';
    try {
      const data = await getdata(query);
      ctx.body = data;
    } catch (err) {
        // handle exception
    }
  });
  
 function getdata(query){
  return new Promise((resolve, reject) => {
    con.query(query, function (error, results, fields) {
    if (error) throw error;
      resolve(results);
    });
  });
 }
 function saveShopdata(ctx,accessToken,shop){
  var querys = 'SELECT COUNT(*) FROM `users` WHERE name = "'+shop+'"';
  con.query(querys, function (error, results, fields) {
      if (error) throw error;
      console.log(results.count);
     // var query="INSERT INTO `users`(`name`,`password`) VALUES ('"+shop+"','"+accessToken+"')";
    //  con.query(query, function (error, results, fields) {
  //     if (error) throw error;
  //       resolve(results);
  //     });
       
    //resolve(results);
      })

  // var query="INSERT INTO `users`(`name`,`password`) VALUES ('"+shop+"','"+accessToken+"')";
  //   return new Promise((resolve, reject) => {
  //     con.query(query, function (error, results, fields) {
  //     if (error) throw error;
  //       resolve(results);
  //     });
  //   });
   }
   function getShopdata(ctx,accessToken,shop){
  var query="SELECT * FROM `users`";
    return new Promise((resolve, reject) => {
      con.query(query, function (error, results, fields) {
      if (error) throw error;
        resolve(results);
      });
    });
   }
  server.use(graphQLProxy({version: ApiVersion.July20}));
  // router.get('/', async (ctx, next) => {
  //   const { shop, accessToken } = ctx.session;
  //   console.log(ctx.session);
  //   ctx.respond = false;
  //     ctx.res.statusCode = 200;
  // });
  router.all('/(.*)', async (ctx, next) => {
    try { 
     //  var origin = ctx.cookies.get("shopOrigin");
    //  const { shop, accessToken } = ctx.session;
     // console.log(origin);
     //  if(origin == 'undefined' || origin == undefined || origin == ''){
     //    break;
     //  }
    // ctx.cookies.set('shopOrigin', 'test-sample-app.myshopify.com');
   //  saveShopdata(ctx,accessToken,shop);
     await handle(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    } catch (err) {
      console.log('err');
      console.log(err);
  }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});