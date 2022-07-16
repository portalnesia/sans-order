import express,{Request,Response,NextFunction} from 'express'
import next from 'next'
import helmet from 'helmet'
import {createProxyMiddleware} from 'http-proxy-middleware'
import config from './web.config.json'

const canvasProxy = require('html2canvas-proxy');

const dev = process.env.NODE_ENV === 'development'
const port = process.env.NODE_ENV === 'production' ? 3001 : 3503;
const hostn = "localhost";

const app = next({ dev })
const handle = app.getRequestHandler()

const useApiProxy=(req: Request,res: Response,next: NextFunction)=>{
  const apiProxy=createProxyMiddleware({
    target: `http://localhost:${process.env.API_PORT}`,
    changeOrigin: true,
    headers:{
      host:`http://localhost:${process.env.API_PORT}`
    }
  });
  return apiProxy(req,res,next);
}

app.prepare().then(()=>{
  const server = express();

  server.use('/uploads', useApiProxy);
  server.use('/sansorder-admin', useApiProxy);

  server.get('/wa',(_,res)=>res.redirect(`https://wa.me/${config.contact.whatsapp}`))
  server.get('/ig',(_,res)=>res.redirect(`https://instagram.com/${config.contact.instagram}`))
  server.get('/tw',(_,res)=>res.redirect(`https://twitter.com/${config.contact.twitter}`))
  server.get('/fb',(_,res)=>res.redirect(`https://facebook.com/${config.contact.facebook.slug}`))

  server.use('/canvas-proxy', canvasProxy());
  //server.options('*', cors)
  //server.use(cors)

  server.use(helmet.dnsPrefetchControl());
  server.use(helmet.expectCt());
  server.use(helmet.frameguard());
  server.use(helmet.hidePoweredBy());
  server.use(helmet.hsts());
  server.use(helmet.ieNoOpen());
  server.use(helmet.noSniff());
  server.use(helmet.permittedCrossDomainPolicies());
  server.use(helmet.referrerPolicy({
    policy: "strict-origin-when-cross-origin"
  }));
  server.use(helmet.xssFilter());

  /*if(process.env.NODE_ENV !== 'production') {
    server.get("/stagging/data/*",(req,res,next)=>{
      const path = req.path.replace("/stagging/","");
      res.sendFile(nodePath.resolve(`./${path}`),()=>{
        next();
      });
    })
  }*/

  server.use(express.json());
  server.use(express.urlencoded({extended:true}));

  server.all("*",(req,res)=>{
    return handle(req,res)
  });

  server.listen(port,hostn, () => {
    console.log(`>> Ready on http://${hostn}:${port}`)
    if(process.send) process.send('ready')
  })
})