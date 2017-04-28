$(document).ready(function() {
  hsp.init({
      useTheme: true
  });
});
function enablekillswitch() {
  $.get( "/api/stopall", function( data ) {
    $( ".results" ).html( data );
  });
}
