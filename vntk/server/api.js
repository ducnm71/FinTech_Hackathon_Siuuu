'use strict';
const { log } = require('async');
const vntk = require('../lib/vntk');

const CSVToJSON = require("csvtojson");
//const JSONToCSV = require("josn2csv").parse;
const FileSystem = require("fs");
const { forEach } = require('lodash');

const tokenizer = vntk.wordTokenizer();
const posTag = vntk.posTag();
const chunking = vntk.chunking();
const ner = vntk.ner();
let classifier = new vntk.BayesClassifier();

const getData = async () =>{
  const data = await CSVToJSON().fromFile("./data.csv");
  data.forEach(item => classifier.addDocument((item.text), (item.label)))
  classifier.train();
}

getData()


// kites extension definition
module.exports = function (kites) {
  kites.on('express:config', (app) => {

    /**
     * API Homepage
     */
    app.get('/', (req, res) => {
      res.send('This is an example Vntk Server!')
    })

    /*
    api tự viết
    */

    //get so sanh
    app.get('/api/findclassifier/:text', (req, res) => {
      var text = req.param('text')
      var result = classifier.classify(text)
      res.ok(result)
    })

    //post so sanh
    app.get('/api/setclassifier/:text/:format', (req, res) => {
      var text = req.param('text')
      var format = req.param('format')
      
      var result = classifier.addDocument(text, format)
      if(result == true)
      {
        res.ok(200)
      }else{
        res.ok(404)
      }
    })

    /**
     * Word Tokenizer
     */
    app.get('/api/tok/:text/:format', (req, res) => {
      var text = req.param('text')
      var format = req.param('format')
      var result = tokenizer.tag(text, format)
      res.ok(result)
    });

    /**
     * POS Tagging
     */
    app.get('/api/pos/:text', (req, res) => {
      var text = req.param('text')
      var format = req.param('format')
      var result = posTag.tag(text, format)
      res.ok(result)
    })

    /**
     * Chunking
     */
    app.get('/api/chunking/:text', (req, res) => {
      var text = req.param('text')
      var format = req.param('format')
      var result = chunking.tag(text, format)
      res.ok(result)
    })

    /**
     * Named Entity Recognition
     */
    app.get('/api/ner/:text', (req, res) => {
      var text = req.param('text')
      var format = req.param('format')
      var result = ner.tag(text, format)
      res.ok(result)
    })

  })
}
