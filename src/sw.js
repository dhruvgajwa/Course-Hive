importScripts('./ngsw-worker.js');
self.addEventListener('notificationclick', (event) => {
  //do something here
  client.navigate('https://developers.google.com/web/fundamentals/push-notifications/');
})