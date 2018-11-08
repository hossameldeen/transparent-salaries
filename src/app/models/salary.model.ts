export class Salary {
  constructor(
    readonly month: string,
    readonly company: string,
    readonly job: string,
    readonly netSalary: string,
    readonly currency: string,
    readonly otherInfo: string,
    readonly createdAt: string
  ) { }
}

export function encode(salary: Salary): string {
  const json: any = salary
  json.version = '0'
  return JSON.stringify(json)
}

/**
 * - You create a function for each version.
 * - In the big decode, you if-condition on all past versions.
 * - IMPORTANT: You write current version's code WITHOUT an if-condition, to be able to write salaries published using newer backward-
 *   compatible versions. That case should never happen though, because if you're online & can see someone's more recent posts, why can't
 *   you see the more recent version of the website's code?
 * @param jsonString
 */
export function decode(jsonString: string): Salary {
  const json = JSON.parse(jsonString)
  if (!json.hasOwnProperty('version')) {
    const oldSalary = decodeNoVersion(json)
    // The timestamp selected is 2018-11-01. Any date before the publish of this product.
    return new Salary(oldSalary.month, oldSalary.company, oldSalary.job, oldSalary.netSalary, oldSalary.currency, oldSalary.otherInfo, "1541030400000")
  }
  const salary = decodeVersion0(json)
  return new Salary(salary.month, salary.company, salary.job, salary.netSalary, salary.currency, salary.otherInfo, salary.createdAt)
}

function decodeNoVersion(json: any): {month:string, company:string, job:string, netSalary:string, currency:string, otherInfo:string} {
  return {month:json.month, company:json.company, job:json.job, netSalary:json.netSalary, currency:json.currency, otherInfo:json.otherInfo}
}

function decodeVersion0(json: any): {month:string, company:string, job:string, netSalary:string, currency:string, otherInfo:string, createdAt: string} {
  return {month:json.month, company:json.company, job:json.job, netSalary:json.netSalary, currency:json.currency, otherInfo:json.otherInfo, createdAt:json.createdAt}
}
