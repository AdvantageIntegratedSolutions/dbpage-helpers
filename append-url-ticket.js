function GetURLParameter(sParam){
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) return sParameterName[1];
  }
}
function setPageReady() {
  (typeof window.pageIsReady === 'function') ?
    window.pageIsReady("Form Loaded") :
    window.pageIsReady = true;
}
var paramTicket = GetURLParameter('ticket')
var overlayEl = document.querySelector('#overlay');

if (paramTicket) {
  console.log('appending ticket to SRCs');
  Array.from(document.querySelectorAll('img[src*="rci"]')).forEach(function(el) {
    console.log('updating img src', el.src);
    var orig = el.src;
    var delim = orig.includes('?') ? ':' : '?';
    el.src = orig + delim + 'ticket=' + paramTicket;
    console.log('new src', el.src);
    
  })
}
if (overlayEl) {
  console.log('has overlay');
  setInterval(() => {
    console.log('vis:', overlayEl.style.visibility);
    if (overlayEl.style.display === 'none') {
      console.log('overlay now hidden');
      setPageReady();
    }
  }, 100);
} else {
  setPageReady();
}