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

app.use(express.urlencoded())
app.use(express.json())

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
app.get("/language", (req, res) => {
    const lang = req.query.lang; // Assuming the language parameter is passed as a query parameter
    res.setLocale(lang); // Set the locale to the requested language
    res.send({
      "Message": res.__('Hello') // Translate "Hello" message to the requested language
    });
  });
  
// run website frontend
app.listen(PORT, (req, res) =>{
    console.log('http://' + config.DB_HOST + ':' + PORT);
});



