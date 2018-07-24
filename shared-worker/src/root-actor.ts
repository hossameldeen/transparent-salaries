/*
 * This file is used as entrypoint for a shared-worker. However, seems like angular expects it to be a module. So, I'm
 * adding a dummy export statement in the end.
 * 
 * NOTE: DO NOT NAME THIS FILE `shared-worker.ts`. An error is thrown during build if you do so.
 * 
 * Note: You can't use code from `app` project, which actually makes sense, or there would be a circular dependency.
 * Something I haven't checked though is whether `app` can use code from this project.
 */

(<any>self).onconnect = (connectEvent: MessageEvent) => {
  const messagePort: MessagePort = (connectEvent.ports as MessagePort[])[0]

  messagePort.postMessage("You're connected to worker!")
  console.log('hi')

  const y = new DatArchive('deet')
  const z = new SharedWorker('abc')
}


/**
 * A
 */
export class A { }
