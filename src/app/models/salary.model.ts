export class Salary {
  constructor(
    readonly month: string,
    readonly company: string,
    readonly job: string,
    readonly netSalary: string,
    readonly currency: string,
    readonly otherInfo: string
  ) { }
}

export function encode(salary: Salary): string {
  return JSON.stringify(salary)
}

export function decode(json: string): Salary {
  return JSON.parse(json)
}
