import express from 'express'
import next from 'next'
import cors from 'cors'
import helmet from 'helmet'
import {createProxyMiddleware} from 'http-proxy-middleware'

const canvasProxy = require('html2canvas-proxy');

const dev = process.env.NODE_ENV === 'development'
const port = 3001;
const hostn = "localhost";

const app = next({ dev })
const handle = app.getRequestHandler()


app.prepare().then(()=>{
  const server = express();
  server.use('/canvas-proxy', canvasProxy());
  //server.options('*', cors({origin:corsOrigin}))
  //server.use(cors({origin:corsOrigin}))

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