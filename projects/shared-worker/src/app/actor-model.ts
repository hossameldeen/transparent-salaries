import { v4 as uuid } from 'uuid';

export interface Actor {
  receive(msg: any): Promise<any>;

  preStart(): Promise<void>;
}

/**
 * TODO: enhance the type safety. Shouldn't expose ref even for the ActorSystem
 */
export class ActorRef {
  private readonly ref: string
  constructor() {
    this.ref = uuid();
  }
  public refOnlyIntentedToBeUsedByActorSystem(): string {
    return this.ref;
  }
}

export class ActorSystem {
  /**
   * Note: If you make the map key actorRef instead of key, you'll need to think about equality comparison of ActorRef.
   */
  private actors: Map<string, ActorWrapper> = new Map();

  /**
   * TODO: enhance the type safety of args.
   */
  createActor(clazz: new (...args: any[]) => Actor, ...args: any[]): ActorRef {
    const actorRef = new ActorRef()
    this.actors.set(actorRef.refOnlyIntentedToBeUsedByActorSystem(), new ActorWrapper(new clazz(args)))
    return actorRef
  }

  /**
   * If an async exception is thrown, that means it's a failure of ActorSystem, but a rejection is a failure of Actor.
   */
  send(actorRef: ActorRef, msg: any): Promise<any> {
    const actorWrapper = this.actors.get(actorRef.refOnlyIntentedToBeUsedByActorSystem())
    if (actorWrapper === undefined)
      throw new Error("ActorRef not found!")
    return actorWrapper.send(msg)
  }
}

class ActorWrapper {
  private state: ActorState;

  constructor(
    private readonly actor: Actor
  ) {
    // TODO: Ugly code. Kind-of breaks the state machine. But correct when written
    this.state = new Processing([]);
    actor.preStart().then(() => this.runLoopInBackground()).catch(() => this.runLoopInBackground())
  }

  send(msg: any): Promise<any> {
    return new Promise((resolve, reject) => {
      switch(this.state.kind) {
        case ActorStateKind.Idle:
          this.state = new Processing([{ msg: msg, resolve: resolve, reject: reject }])
          this.runLoopInBackground()  // TODO: Could also write Promise.resolve().then(runLoopInBackground) to make sure it's async
          break;

        case ActorStateKind.Processing:
          this.state.queue.push({ msg: msg, resolve: resolve, reject: reject })
          break;
        default: return assertNever(this.state)
      }
    })
  }

  /**
   * Precondition: state is Processing
   */
  private async runLoopInBackground(): Promise<void> {
    while((this.state as Processing).queue.length > 0) {
      const { msg, resolve, reject } = (this.state as Processing).queue.shift()!
      try {
        resolve(await this.actor.receive(msg))
      }
      catch(e) {
        reject(e) // TODO: Should it be `new Error(e)`?
      }
    }
    this.state = new Idle();
  }
}

type ActorState = Idle | Processing

enum ActorStateKind { Idle, Processing }

class Idle {
  constructor(
    readonly kind: ActorStateKind.Idle = ActorStateKind.Idle
  ) { }
}

class Processing {
  constructor(
    readonly queue: Array<{ msg: any, resolve: ResolveFunction<any>, reject: RejectFunction }>,
    readonly kind: ActorStateKind.Processing = ActorStateKind.Processing
  ) { }
}

//======================================================================================================================
// Helpers

export type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void
export type RejectFunction = (reason?: any) => void

export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
