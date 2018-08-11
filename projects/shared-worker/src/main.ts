// TODO: Note: you need to have at least one import. Check: https://github.com/Microsoft/TypeScript/issues/14877
import { ActorRef, ActorSystem } from './app/actor-model';

// Note: If you have no `import`s, you'll need to wrap this in an immediately-invoked function or something.
// Check: https://github.com/Microsoft/TypeScript/issues/14877
// I don't want to wrap in a function, in order to easily remove the webpack lines from the artifacts
declare const self: SharedWorker.SharedWorkerGlobalScope;

const actorSystem = new ActorSystem()

const mainActor: ActorRef = actorSystem.createActor(MainActor)

self.onconnect = (connectEvent: MessageEvent) => {
  // TODO: I have no idea why it's an array
  const messagePort: MessagePort = connectEvent.ports[0]
  // TODO: Not necessary good to JSON.stringify stuff without thinking.
  messagePort.onmessage = async (msgEvt: MessageEvent) => {

    try {
      actorSystem.send
    }
    catch(e) {
      
    }

    messagePort.postMessage(`Worker received ${JSON.stringify(msgEvt.data)}`)
  }
  // Note: onmessage has started the port. Otherwise, you'd have needed to call `port.start()`
}
