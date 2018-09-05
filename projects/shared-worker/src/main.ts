// TODO: Note: you need to have at least one import. Check: https://github.com/Microsoft/TypeScript/issues/14877
//             Add `import { } from '@angular/core';` if you have no imports.
import { ActorRef, ActorSystem } from './app/actor-model';
import { MainActor } from './app/main-actor';
import { WMRequest, OutgoingMessage, createWmResponse, createWmResponseInternalError } from 'worker-message';

// Note: If you have no `import`s and don't want to add a dummy one, you'll need to wrap this in an immediately-invoked function or something.
// Check: https://github.com/Microsoft/TypeScript/issues/14877
declare const self: SharedWorker.SharedWorkerGlobalScope;

const actorSystem = new ActorSystem()

const mainActor: ActorRef = actorSystem.createActor(MainActor)

self.onconnect = (connectEvent: MessageEvent) => {
  // TODO: I have no idea why it's an array
  const messagePort: MessagePort = connectEvent.ports[0]
  messagePort.onmessage = async (msgEvt: MessageEvent) => {
    const wmRequest = msgEvt.data as WMRequest  // TODO: Should I make a check here or just let it fail later on?
    
    try {
      const outgoingMessage = await actorSystem.send(mainActor, wmRequest.payload) as OutgoingMessage
      const wmResponse = createWmResponse(wmRequest.requestUuid, outgoingMessage)
      messagePort.postMessage(wmResponse)
    }
    catch(e) {
      // Credits on the error part: https://stackoverflow.com/a/26199752/6690391
      // TODO: Assume e is of type Error & doesn't handle any special case of inheritance or whatever
      const wmResponse = createWmResponseInternalError(wmRequest.requestUuid, JSON.stringify(e, Object.getOwnPropertyNames(e)))
      messagePort.postMessage(wmResponse)
    }
  }
  // Note: onmessage has started the port. Otherwise, you'd have needed to call `port.start()`
}
