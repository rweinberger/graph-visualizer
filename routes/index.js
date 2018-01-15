var express = require('express');
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var router = express.Router();

/* models */
var Graph = require('../schemas/graphSchema');

/* helpers */
function parseEdge(edge) {
  var first = edge.split('-');
  var source = first[0];
  var second = first[1].split(' ');
  var target = second[0];
  var value = second[1];
  return {source: source, target: target, value: value};
}

function deleteEdge(name, edge){
  if (edge.source && edge.target && edge.value) {
    Graph.updateOne(
    {name: name}, 
    {$pull: {edges: {source: edge.source, target: edge.target, value: edge.value}}},
    function(err, info) {
      if(err) throw err;
      console.log("Edge "+edge.source+"-"+edge.target+" deleted from "+name+": "+info.ok);
    });
  } else if (edge.source) {
    Graph.updateOne(
    {name: name}, 
    {$pull: {edges: {source: edge.source}}},
    {multi: true},
    function(err, info) {
      if(err) throw err;
      console.log("Edges with source "+edge.source+" deleted from "+name+": "+info.ok);
    });
  } else if (edge.target) {
    Graph.updateOne(
    {name: name}, 
    {$pull: {edges: {target: edge.target}}},
    {multi: true},
    function(err, info) {
      if(err) throw err;
      console.log("Edges with target "+edge.target+" deleted from "+name+": "+info.ok);
    });
  }
}

function deleteNode(name, node) {
  console.log(node);
  Graph.updateOne(
  {name: name}, 
  {$pull: {nodes: {id: node}}},
  function(err, info) {
    if(err) throw err;
    console.log("Node "+node+" deleted from "+name+": "+info.ok);
  });
}


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

router.post('/edit-graph', function(req, res, next) {
  var deletedNodes = req.body.deletedNodes;
  var deletedEdges = req.body.deletedEdges;
  var addedNodes = req.body.addedNodes;
  var addedEdges = req.body.addedEdges;
  var name = req.body.name;
  // delete specified edges
  if (deletedEdges != null) {
    if (typeof deletedEdges == "string") {
      var parsedEdge = parseEdge(deletedEdges);
      deleteEdge(name, parsedEdge);
    } else {
      for (var i = 0; i < deletedEdges.length; i++) {
        var toDelete = deletedEdges[i];
        var parsedEdge = parseEdge(toDelete);
        deleteEdge(name, parsedEdge);
      }
    }
  }
  // delete specified nodes & associated edges
  if (deletedNodes != null) {
    if (typeof deletedNodes == "string") {
      deleteNode(name, deletedNodes);
      deleteEdge(name, {source: deletedNodes});
      deleteEdge(name, {target: deletedNodes});
    } else {
      for (var i = 0; i < deletedNodes.length; i++) {
        var toDelete = deletedNodes[i];
        deleteNode(name, toDelete);
        deleteEdge(name, {source: toDelete});
        deleteEdge(name, {target: toDelete});
      }
    }
  }
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
