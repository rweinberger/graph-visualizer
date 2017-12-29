var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");

$(document).ready(function() {

  $("#getSHA").click(function(event) {
    var msg = $("#sha-ify").val();
    var sha = SHA256(msg).toString(CryptoJS.enc.Base32);
    $("#sha").text(sha);
  });

});