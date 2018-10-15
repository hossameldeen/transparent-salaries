import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import {UtilService} from './util.service';

export enum Lock { MigrateDB }

@Injectable({
  providedIn: 'root'
})
export class LockerService {

  private readonly locker: SharedWorker.SharedWorker;
  private readonly outstanding: Array<{ name: string, secret: string, resolve: ResolveFunction<string> }>;

  constructor(private readonly utilService: UtilService) {
    this.locker = new SharedWorker('/assets/locker.js')
    this.locker.port.onmessage = (e: MessageEvent) => this.handleMessage(e)
  }

  acquireLock(lock: Lock, lockTimeout: number): Promise<string> {
    return new Promise(resolve => {
      const lockName = this.lockToString(lock)
      const lockSecret = uuid()
      this.outstanding.push({name: lockName, secret: lockSecret, resolve: resolve})
      this.locker.port.postMessage({kind: 'acquire', name: lockName, timeout: lockTimeout, secret: lockSecret})
    })
  }

  releaseLock(lock: Lock, lockSecret: string): void {
    const lockName = this.lockToString(lock)
    this.locker.port.postMessage({kind: 'release', name: lockName, secret: lockSecret})
  }

  private lockToString(lock: Lock): string {
    switch (lock) {
      case Lock.MigrateDB: return "MigrateDB"
      default: return this.utilService.assertNever(lock)
    }
  }

  private handleMessage(e: MessageEvent): void {
    const msg = e.data
    if (msg.kind !== 'acquired')
      throw Error("Unexpected message. Expected message whose kind is 'acquired'. Should never happen.")

    const lockName = msg.name
    const lockSecret = msg.secret

    if (!(typeof lockName === "string" && typeof lockSecret === "string"))
      throw Error("At least one of lockName's and lockSecret's types is invalid. Should never happen.")

    const outstandingIndex = this.outstanding.findIndex(v => v.name === lockName && v.secret === lockSecret)
    if (outstandingIndex === -1)
      throw Error('Acquired lock not found. Should never happen.')

    this.outstanding[outstandingIndex].resolve(lockSecret)
    this.outstanding.splice(outstandingIndex, 1)
  }
}

// Helpers

type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void
type RejectFunction = (reason?: any) => void
