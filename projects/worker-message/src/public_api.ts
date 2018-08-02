/*
 * Public API Surface of worker-message
 */

export type IncomingMessage = string

export type OutgoingMessage = string

//  /**
//   * TODO: The generic part is not very designed.
//   * 
//   * Prefixing with `WM` because of name conflict with built-ins.
//   */
// export type WorkerMessage<Payload> = WMRequest<Payload> | WMReply<Payload> | WMMessage<Payload>

// export enum WorkerMessageKind { Request, Reply, Message }

// /**
//  * TODO: Probably better than id creation is creating a worker. That's what akka does in ask pattern
//  */
// export class WMRequest<Payload> {
//   constructor(
//     readonly id: string,
//     readonly payload: Payload,
//     readonly kind: WorkerMessageKind.Request
//   ) { }
// }

// export class WMReply<Payload> {
//   constructor(
//     readonly id: string,
//     readonly payload: Payload,
//     readonly kind: WorkerMessageKind.Reply
//   ) { }
// }

// export class WMMessage<Payload> {
//   constructor(
//     readonly payload: Payload,
//     readonly kind: WorkerMessageKind.Message
//   ) { }
// }
