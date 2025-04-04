// Fix for iOS 100vh issue
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVH);
setVH();

// Hide loading screen after app loads
window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('initial-loading').classList.add('hidden');
    setTimeout(function() {
      document.getElementById('initial-loading').remove();
    }, 500);
  }, 500);
});
