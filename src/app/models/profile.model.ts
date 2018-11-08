export class Profile {
  constructor(
    readonly displayName: string
  ) { }
}

export function encode(profile: Profile): string {
  return JSON.stringify(profile)
}

export function decode(jsonString: string): Profile {
  return JSON.parse(jsonString)
}
