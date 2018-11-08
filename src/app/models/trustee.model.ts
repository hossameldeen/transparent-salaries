export class Trustee {
  constructor(
    readonly datUrl: string
  ) { }
}

export function encode(trustee: Trustee): string {
  return JSON.stringify(trustee)
}

export function decode(jsonString: string): Trustee {
  return JSON.parse(jsonString)
}
