import { UtilService } from 'src/app/services/util.service';

/**
 * Typically, your In & Out would be union types. They don't need to have one-to-one mapping. Then, `innerReceive()`
 * would be one big switch-case:
 * 
 * innerReceive(r) {
 *   switch(r) {
 *     case(in1) => outSomething
 *     case(in2) => outSomethingOrSomethingElse
 *     ... 
 *   }
 * }
 * 
 * However, you could be returning some specific responses to some specific messages. Unfortunately, couldn't get a
 * compile-time check for that. The best I could get, at a loss described below, is to add corresponding functions:
 * async addSalary(r: ExactInType): ExactOutType {
 *   return ((await super.receive(r)) as ExactOutType)
 * }
 * ...
 * The loss, of course, is that you could forget to call receive in addSalary. Also, note that this doesn't add more
 * type safety; it merely makes the casting in one place in the code, where one is most sure.
 * 
 * 
 * For the general structure of the code: You'd probably have a main (or several main?) actor in a singleton service
 * used in all.
 */
abstract class Actor<In, Visible, Out> {
  public visible: Visible;
  async receive(r: In) : Promise<Out> {
    try {
      return await this.innerReceive(r);
    }
    catch(e) {
      // do something. Log, for example.
      throw e;
    }
  }
  async abstract innerReceive(r: In) : Promise<Out>;
}

class SalaryActor extends Actor<SalaryIn, never, SalaryOut> {
  async innerReceive(r: SalaryIn): Promise<SalaryOut> {
    return new AddSalaryOut();
  }
  async addSalary(r: AddSalaryIn): Promise<AddSalaryOut> {
    return ((await super.receive(r)) as AddSalaryOut)
  }
}

type SalaryIn = AddSalaryIn | RemoveSalaryIn;
type SalaryOut = AddSalaryOut | RemoveSalaryOut;

enum SalaryInKind { AddSalaryIn, RemoveSalaryIn }
enum SalaryOutKind { AddSalaryOut, RemoveSalaryOut }

class AddSalaryIn {
  constructor(
    readonly kind: SalaryInKind.AddSalaryIn = SalaryInKind.AddSalaryIn
  ) {}
}

class RemoveSalaryIn {
  constructor(
    readonly kind: SalaryInKind.RemoveSalaryIn = SalaryInKind.RemoveSalaryIn
  ) {}
}

class AddSalaryOut {
  constructor(
    readonly kOutd: SalaryOutKind.AddSalaryOut = SalaryOutKind.AddSalaryOut
  ) {}
}

class RemoveSalaryOut {
  constructor(
    readonly kOutd: SalaryOutKind.RemoveSalaryOut = SalaryOutKind.RemoveSalaryOut
  ) {}
}
