$(document).ready(function() {
  $(window).click(function() {
    $("#folder").attr("src", "/images/nonhighlight.png");
  });

  $("#folder").mousedown(function(event) {
    $(this).attr("src", "/images/highlighted.png");
  });

  $("#folder").click(function(event) {
    $(this).attr("src", "/images/highlighted.png");
    event.stopPropagation();
  });

  $( "#folder" ).dblclick(function() {
    window.location.href = "/home";
  });

});