/**
 * @type {Map<string, {secret: string, timeoutHandle: number, queue: {port: MessagePort, timeout: number, secret: string}[]>}
 */
const locks = new Map()

function acquireNext(lockName) {
  if (locks.get(lockName).queue.length === 0) {
    locks.delete(lockName)
  }
  else {
    const port = locks.get(lockName).queue[0].port
    const lockTimeout = locks.get(lockName).queue[0].timeout
    const lockSecret = locks.get(lockName).queue[0].secret

    locks.get(lockName).queue.shift()
    locks.get(lockName).secret = lockSecret
    locks.get(lockName).timeoutHandle = setTimeout(acquireNext, lockTimeout, lockName)

    port.postMessage({kind: 'acquired', name: lockName, secret: lockSecret})
  }
}

onconnect = function(e) {
  const port = e.ports[0];

  port.onmessage = function(e) {
    const msg = e.data
    if (msg.kind === 'acquire') {
      const lockName = msg.name
      const lockTimeout = msg.timeout
      const lockSecret = msg.secret

      if (!(typeof lockName === "string" && typeof lockTimeout === "number" && typeof lockSecret === "string"))
        throw Error("At least one of lockName's, lockTimeout's, and lockSecret's types is invalid. Should never happen.")

      if (locks.has(lockName)) {
        locks.set(lockName, {queue: [{port: port, timeout: lockTimeout, secret: lockSecret}]})
        acquireNext(lockName)
      }
      else {
        locks.get(lockName).queue.push({port: port, timeout: lockTimeout, secret: lockSecret})
      }
    }
    else if (msg.kind === 'release') {
      const lockName = msg.name
      const lockSecret = msg.secret

      if (!(typeof lockName === "string" && typeof lockSecret === "string"))
        throw Error("At least one of lockName's and lockSecret's types is invalid. Should never happen.")

      if (!locks.has(lockName))
        throw Error('Releasing a non-existing locks. Should never happen.')

      if (locks.get(lockName).secret !== lockSecret)
        throw Error('Releasing a lock with a wrong secret. Should never happen.')

      clearTimeout(locks.get(lockName).timeoutHandle)
      acquireNext(lockName)
    }
    else {
      throw Error('msg.kind neither acquire nor release')
    }
  }
}
