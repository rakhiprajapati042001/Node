const express = require('express');
const router=require("express").Router();

const app = express();
const config=require('./configuration/config.js');
const PORT= process.env.PORT ||9000;
const path=require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// const rout=require('./Router/router.js')
const { I18n }=require('i18n')
//cluster

const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
// const process = require('node:process');
//

//use build in middleware which is define by express(globally use for all application all routes)
app.use(express.urlencoded())

//use build in middleware which is define by express(globally use for all application all routes)
app.use(express.json())

//mounted the router
app.use(require('./Router/router.js'))

/* URL of Swagger use
http://localhost:9990/api-docs/ */


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
      termsOfService: "http://example.com/terms/",
      contact: {
        name: "API Support",
        url: "http://www.exmaple.com/support",
        email: "support@example.com",
      },
    },

    servers: [
      {
        url: "http://localhost:9990",
        description: "My API Documentation",
      },
    ],
  },
  apis: ["./Router/*.js"],
};

const swaggerDocument = swaggerJsdoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/route',router)
// router.use('/api-docs', swaggerUi.serve);
// router.get('/api-docs', swaggerUi.setup(swaggerDocument));



const i18n = new I18n({
    locales: ['en', 'hi','de'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale:'hi'
})
// app.use(i18n.init)
app.use((req, res, next) => {
    i18n.init(req, res);
    next();
  });

  //Direct route 
app.get("/language", (req, res) => {
    const lang = req.query.lang; // Assuming the language parameter is passed as a query parameter
    res.setLocale(lang); // Set the locale to the requested language
    res.send({
      "Message": res.__('Hello') // Translate "Hello" message to the requested language
    });
  });
  
// run website frontend

app.get("/examp",(req,res) => {
  res.send(`eample  ${process.pid} `)
  res.send({
    "Message": res.__(`Hello  ${process.pid} `) // Translate "Hello" message to the requested language
  });
});

console.log(numCPUs+"numCPUs")



if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // cluster.on('exit', (worker, code, signal) => {
  //   console.log(`worker ${worker.process.pid} died`);
  // });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app.listen(PORT, (req, res) =>{
 
    console.log('http://' + config.DB_HOST + ':' + PORT);
});

  console.log(`Worker ${process.pid} started`);
}
