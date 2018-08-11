import { v4 as uuid } from 'uuid';

/*
 * Public API Surface of worker-message.
 * 
 * For now, it's an RPC interface.
 * 
 * TODO: Not consistent in the way union types are used here with elsewhere
 * 
 * As a convention: using `t` when the inner type is a discriminated union itself
 */

export class CorrelatedMessage<Payload> {
  readonly correlationId: string;

  constructor(
    readonly payload: Payload
  ) {
    this.correlationId = uuid();
  }
}

//==============================================================================
// IncomingMessage & OutgoingMessage

export type IncomingMessage
  = { kind: IncomingMessageKind.SelectProfile, archiveUrl: string }
  | { kind: IncomingMessageKind.UnselectProfile }

export type OutgoingMessage
  = { kind: OutgoingMessageKind.SelectProfileReply, t: SelectProfileReply }
  | { kind: OutgoingMessageKind.UnselectProfileReply, t: UnselectProfileReply }

export enum IncomingMessageKind { SelectProfile, UnselectProfile }

export enum OutgoingMessageKind { SelectProfileReply, UnselectProfileReply }

//==============================================================================
// SelectProfile

export type SelectProfileReply
  = { kind: SelectProfileReplyKind.Succeeded }
  | { kind: SelectProfileReplyKind.AlreadyAProfileIsSelected, archiveUrl: string }

export enum SelectProfileReplyKind { Succeeded, AlreadyAProfileIsSelected }

//==============================================================================
// UnselectProfile

export type UnselectProfileReply
  = { kind: UnselectProfileReplyKind.Succeeded }
  | { kind: UnselectProfileReplyKind.NoProfileIsSelected }

export enum UnselectProfileReplyKind { Succeeded, NoProfileIsSelected }
