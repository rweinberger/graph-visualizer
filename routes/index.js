var express = require('express');
var router = express.Router();

/* models */
var Graph = require('../schemas/graphSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { });
});

router.get('/home', function(req, res, next) {
  res.render('home', { });
});

router.get('/graph', function(req, res, next) {
  res.render('graph', { });
});

router.get('/saved', function(req, res, next) {
  res.render('saved', { });
});

router.get('/new', function(req, res, next) {
  res.render('new', { });
});

router.get('/success', function(req, res, next) {
  res.render('success', { });
});

router.post('/new-graph', function (req, res, next) {
  var gName = req.body.name;
  var n = req.body.nodes;
  var e = req.body.edges;
  nodes = n.split(',');
  edges = e.split('\r\n');
  var nodesJSON = [];
  var edgesJSON = [];
  for (var i=0; i < nodes.length; i++) {
    var nodeID = nodes[i].trim();
    if (nodeID.length > 0) {
      nodesJSON.push({id:nodeID});
    }
  }
  for (var i=0; i < edges.length; i++) {
    var edge = edges[i].trim();
    if (edge.length > 0) {
      var prelim = edge.split('-');
      var src = prelim[0].trim();
      var targ = prelim[1].split(' ')[0].trim();
      var val = prelim[1].split(' ')[1].trim();
      edgesJSON.push({source:src, target:targ, value:val});
    }
  }
  console.log(nodesJSON);
  console.log(edgesJSON);
  var graph = new Graph({
    name: gName,
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
