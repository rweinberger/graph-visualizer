var express = require('express');
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var router = express.Router();

/* models */
var Graph = require('../schemas/graphSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:"~"});
});

router.get('/home', function(req, res, next) {
  res.render('home', {title:"home"});
});

router.get('/graph', function(req, res, next) {
  var name = req.query.name;
  Graph.findOne({name:name}, function(err, graph) {
    if (err) {
      res.redirect('/error')
    } else {
      res.render('graph', {name:name, title:name, encrypted:graph.encrypted});
    }
  });
});

router.get('/edit', function(req, res, next) {
  var name = req.query.name;
  Graph.findOne({name:name}, function(err, graph) {
    if (err) {
      res.redirect('/error')
    } else {
      res.render('edit', {nodes: graph.nodes, edges:graph.edges, title:name, name:name, encrypted:graph.encrypted});
    }
  });
});

router.get('/delete', function(req, res, next) {
  var name = req.query.name;
  Graph.findOne({name:name}, function(err, graph) {
    if (err) {
      res.redirect('/error')
    } else {
      res.render('delete', {title:name, name:name});
    }
  });
});

router.get('/json', function(req, res, next) {
  var name = req.query.name;
  Graph.find({name:name}, function(err, graph) {
    if (err) {
      res.redirect('/error')
    } else if (!graph.length>0) {
      res.redirect('/error')
    } else {
      res.send(graph)
    }
  });
})

router.get('/saved', function(req, res, next) {
  Graph.find({}, function(err, graphs) {
    if (err) {
      res.redirect('/error')
    } else {
      res.render('saved', {graphs: graphs, title:"saved"})
    }
  });
});

router.get('/new', function(req, res, next) {
  res.render('new', {title:"new graph"});
});

router.get('/success', function(req, res, next) {
  res.render('success', {title:"success"});
});

router.post('/delete-graph', function (req, res, next) {
  var gName = req.body.name;
  console.log("deleting "+gName);
  Graph.deleteOne({name:gName}, function(err, graph) {
    if (err) {
      res.redirect('/error')
    } else {
      res.redirect('/success')
    }
  })
})

router.post('/new-graph', function (req, res, next) {
  var gName = req.body.name;
  var n = req.body.nodes;
  var e = req.body.edges;
  var encrypt = (req.body.encrypt == "on") ? true : false;
  nodes = n.split(',');
  edges = e.split('\r\n');
  var nodesJSON = [];
  var edgesJSON = [];
  for (var i=0; i < nodes.length; i++) {
    if (nodes[i].trim().length > 0) {
      var nodeID = encrypt ? SHA256(nodes[i].trim()).toString(CryptoJS.enc.Base32) : nodes[i].trim();
      nodesJSON.push({id:nodeID});
    }
  }
  for (var i=0; i < edges.length; i++) {
    var edge = edges[i].trim();
    if (edge.length > 0) {
      var prelim = edge.split('-');
      var src = encrypt ? SHA256(prelim[0].trim()).toString(CryptoJS.enc.Base32) : prelim[0].trim();
      var targ = encrypt ? SHA256(prelim[1].split(' ')[0].trim()).toString(CryptoJS.enc.Base32) : prelim[1].split(' ')[0].trim();
      var val = prelim[1].split(' ')[1].trim();
      edgesJSON.push({source:src, target:targ, value:val});
    }
  }
  var graph = new Graph({
    name: gName,
    encrypted: encrypt,
    nodes: nodesJSON,
    edges: edgesJSON
  });
  graph.save(function(err, product) {
    if (err) {
      res.redirect('/error')
    } else {
      res.redirect('/success')
    }
  });
});

module.exports = router;
