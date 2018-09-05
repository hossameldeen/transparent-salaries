import { v4 as uuid } from 'uuid';

/*
 * Public API Surface of worker-message.
 * 
 * For now, it's an RPC interface.
 * 
 * (1) NOTE: Do NOT put member functions in types or in their prototypes (i.e., don't use classes).
 *     Check: https://stackoverflow.com/a/52023478/6690391
 * 
 * (2) When you want to use nested union types, see this: https://stackoverflow.com/a/51758043/6690391
 *     Because it's an imperfect situation, you can use an imperfect convention like making the inner type property
 *     always called `t`.
 * 
 * TODO: Some inconsistency here & there. E.g., createWMResponse is not createWMResponseResponse like all union-type cases. Wharever
 */

//Top-level==========================================================================

export type WMRequest
  = { kind: WMRequestKind.Request, requestUuid: Uuid, payload: IncomingMessage }

export type WMResponse
  = { kind: WMResponseKind.Response, requestUuid: Uuid, payload: OutgoingMessage }
  | { kind: WMResponseKind.InternalError, requestUuid: Uuid, err: any }

export type IncomingMessage
  = { kind: IncomingMessageKind.GetSelectedProfile }
  | { kind: IncomingMessageKind.SelectProfile, archiveUrl: string }
  | { kind: IncomingMessageKind.UnselectProfile }

export type OutgoingMessage
  = { kind: OutgoingMessageKind.GetSelectedProfileReply, archiveUrl: string | null }
  | { kind: OutgoingMessageKind.SelectProfileReply, t: SelectProfileReply }
  | { kind: OutgoingMessageKind.UnselectProfileReply, t: UnselectProfileReply }

//===================================================================================
// GetSelectedProfile

// Nothing needed

//===================================================================================
// SelectProfile

export type SelectProfileReply
  = { kind: SelectProfileReplyKind.Succeeded }
  | { kind: SelectProfileReplyKind.AlreadyAProfileIsSelected, archiveUrl: string }

//===================================================================================
// UnselectProfile

export type UnselectProfileReply
  = { kind: UnselectProfileReplyKind.Succeeded }
  | { kind: UnselectProfileReplyKind.NoProfileIsSelected }

//===================================================================================
// Helpers

export type Uuid
  = { kind: UuidKind.Uuid, uuid: string }

//Kinds==============================================================================

export enum WMRequestKind { Request }

export enum WMResponseKind { Response, InternalError }

export enum IncomingMessageKind { GetSelectedProfile, SelectProfile, UnselectProfile }

export enum OutgoingMessageKind { GetSelectedProfileReply, SelectProfileReply, UnselectProfileReply }

export enum SelectProfileKind { SelectProfile }

export enum GetSelectedProfileReplyKind { GetSelectedProfileReply }

export enum SelectProfileReplyKind { Succeeded, AlreadyAProfileIsSelected }

export enum UnselectProfileReplyKind { Succeeded, NoProfileIsSelected }

export enum UuidKind { Uuid }

//Constructors=======================================================================
// TODO: Should these be arrow functions?

export function createWmRequest(payload: IncomingMessage): WMRequest {
  return { kind: WMRequestKind.Request, requestUuid: createUuid(), payload: payload }
}

export function createWmResponse(requestUuid: Uuid, payload: OutgoingMessage): { kind: WMResponseKind.Response } & WMResponse {
  return { kind: WMResponseKind.Response, requestUuid: requestUuid, payload: payload }
}

export function createWmResponseInternalError(requestUuid: Uuid, err: any): { kind: WMResponseKind.InternalError } & WMResponse {
  return { kind: WMResponseKind.InternalError, requestUuid: requestUuid, err: err }
}

// See: https://stackoverflow.com/a/52181609/6690391 - Proud, thanks to Allah :-)
export function createGetSelectProfile(): { kind: IncomingMessageKind.GetSelectedProfile } & IncomingMessage {
  return { kind: IncomingMessageKind.GetSelectedProfile }
}

export function createSelectProfile(archiveUrl: string): { kind: IncomingMessageKind.SelectProfile } & IncomingMessage {
  return { kind: IncomingMessageKind.SelectProfile, archiveUrl: archiveUrl }
}

export function createUnselectProfile(): { kind: IncomingMessageKind.UnselectProfile } & IncomingMessage {
  return { kind: IncomingMessageKind.UnselectProfile }
}

export function createGetSelectedProfileReply(archiveUrl: string | null): { kind: OutgoingMessageKind.GetSelectedProfileReply } & OutgoingMessage {
  return { kind: OutgoingMessageKind.GetSelectedProfileReply, archiveUrl: archiveUrl }
}

export function createSelectProfileReply(selectProfileReply: SelectProfileReply): { kind: OutgoingMessageKind.SelectProfileReply } & OutgoingMessage {
  return { kind: OutgoingMessageKind.SelectProfileReply, t: selectProfileReply }
}

export function createUnselectProfileReply(unselectProfileReply: UnselectProfileReply): { kind: OutgoingMessageKind.UnselectProfileReply } & OutgoingMessage {
  return { kind: OutgoingMessageKind.UnselectProfileReply, t: unselectProfileReply }
}

export function createSelectProfileReplySucceeded(): { kind: SelectProfileReplyKind.Succeeded } & SelectProfileReply {
  return { kind: SelectProfileReplyKind.Succeeded }
}

export function createSelectProfileReplyAlreadyAProfileIsSelected(archiveUrl: string): { kind: SelectProfileReplyKind.AlreadyAProfileIsSelected } & SelectProfileReply {
  return { kind: SelectProfileReplyKind.AlreadyAProfileIsSelected, archiveUrl: archiveUrl }
}

export function createUnselectProfileReplySucceeded(): { kind: UnselectProfileReplyKind.Succeeded } & UnselectProfileReply {
  return { kind: UnselectProfileReplyKind.Succeeded }
}

export function createUnselectProfileReplyNoProfileIsSelected(): { kind: UnselectProfileReplyKind.NoProfileIsSelected } & UnselectProfileReply {
  return { kind: UnselectProfileReplyKind.NoProfileIsSelected }
}

export function createUuid(): Uuid {
  return { kind: UuidKind.Uuid, uuid: uuid() }
}
