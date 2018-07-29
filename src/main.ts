import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

const sharedWorker = new SharedWorker('assets/shared-worker/main.js')
sharedWorker.port.onmessage = (msgEvt: MessageEvent) => console.log('Received from worker:', msgEvt.data)

const packets = ['Hi', {abc: 'def'}]
for (const p of packets)
  sharedWorker.port.postMessage(p) // Note: onmessage has started the port. Otherwise, you'd have needed to call `port.start()`
