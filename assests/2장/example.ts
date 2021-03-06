{
  const x: never = 12;

  // type AB = 'A' | 'B';
  // const e: AB = 'A';
  // const c: AB = 'C';

  // interface Person {
  //   name: string;
  // }
  interface Lifespan {
    birth: Date;
    death?: Date;
  }
  type PersonSpan = Person & Lifespan;

  const ps: PersonSpan = {
    name: 'Lu',
    birth: new Date('2022/05/27'),
    death: new Date('9999/12/12'),
  };

  function getKey<K extends string>(val: any, key: K) {
    // ...
  }

  getKey({}, 'x');
  getKey({}, Math.random() < 0.5 ? 'a' : 'b');
  getKey({}, document.title);
  getKey({}, 12); // Argument of type 'number' is not assignable to parameter of type 'string'.

  interface Point {
    x: number;
    y: number;
  }

  type PointKeys = keyof Point; // 타입은 'x' | 'y'
  function sortBy<K extends keyof T, T>(vals: T[], key: K): T[] {
    /// ...
  }
  const pts: Point[] = [
    { x: 1, y: 1 },
    { x: 2, y: 0 },
  ];
  sortBy(pts, 'x'); // 정상, 'x'는 'x'|'y'를 상속 (즉, keyof T)
  sortBy(pts, 'y'); // 정상, 'y'는 'x'|'y'를 상속
  sortBy(pts, Math.random() < 0.5 ? 'x' : 'y'); // 정상, 'x'|'y' 는 'x'|'y'를 상속
  sortBy(pts, 'z'); // error: Argument of type '"z"' is not assignable to parameter of type 'keyof Point'.

  interface Person {
    first: string;
    last: string;
  }
  const p: Person = { first: 'Leo', last: 'Jankos' };
  function email(p: Person, subject: string, body: string): Response {
    // ...
  }
  type T1 = typeof p; // 타입은 Person
  type T2 = typeof email; // (p: Person, subject: string, body: string) => Response
  const v1 = typeof p; // 값은 'object'
  const v2 = typeof email; // 값은 function

  interface Person {
    name: string;
  }

  const alice: Person = {}; // 타입은 Person
  const bob = {} as Person; // 타입은 Person

  function isGreeting(phrase: String) {
    return ['hello', 'good day'].indexOf(phrase);
  }

  interface Room {
    numDoors: number;
    ceilingHeightFt: number;
  }
  const r: Room = {
    numDoors: 1,
    ceilingHeightFt: 10,
    elephant: 'present',
  };
  // Type '{ numDoors: number; ceilingHeightFt: number; elephant: string; }' is not assignable to type 'Room'. Object literal may only specify known properties, and 'elephant' does not exist in type 'Room'

  interface Options {
    title: string;
    darkMode?: boolean;
  }
  function createWindow(options: Options) {
    if (options.darkMode) {
      setDarkMode();
    }
    // ...
  }
  createWindow({ title: 'Spider Solitaire', darkmode: true });
  // Object literal may only specify known properties, but 'darkmode' does not exist in type 'Options'. Did you mean to write 'darkMode'?

  const intermediate = { darkmode: true, title: 'Ski Free' };
  const o: Options = intermediate; // 정상
  const k = { darkmode: true, title: 'Ski Free' } as Options; // 정상

  function add(a: number, b: number) {
    return a + b;
  }
  function sub(a: number, b: number) {
    return a - b;
  }
  function mul(a: number, b: number) {
    return a * b;
  }
  function div(a: number, b: number) {
    return a / b;
  }

  type BinaryFn = (a: number, b: number) => number;
  const add: BinaryFn = (a, b) => a + b;
  const sub: BinaryFn = (a, b) => a - b;
  const mul: BinaryFn = (a, b) => a * b;
  const div: BinaryFn = (a, b) => a / b;

  type TState = {
    name: string;
    capital: string;
  };
  // 인터페이스
  interface IState {
    name: string;
    capital: string;
  }

  interface IStateWithPop extends TState {
    population: number;
  }
  type TStateWithPop = IState & { population: number };

  console.log();

  const surfaceArea = (r, h) => 2 * Math.PI * r * (r + h);
  const volume = (r, h) => Math.PI * r * r * h;
  for (const [r, h] of [
    [
      [1, 1],
      [1, 2],
      [2, 1],
    ],
  ]) {
    console.log(
      `Cylinder ${r} * ${h}`,
      `Surface area: ${surfaceArea(r, h)}`,
      `Volume: ${volume(r, h)}`
    );
  }

  interface Person {
    firstName: string;
    lastName: string;
  }

  interface PersonWithBirthDate {
    firstName: string;
    lastName: string;
    birth: Date;
  }

  interface PersonWithBirthDate extends Person {
    birth: Date;
  }

  interface SaveAction {
    type: 'save';
    // ...
  }
  interface LoadAction {
    type: 'load';
    // ...
  }
  type Action = SaveAction | LoadAction;

  type ActionType = Action['type']; // 타입은 "save" | "load"

  type ActionRec = Pick<Action, 'type'>; // {type: "save" | "load"}

  interface Name {
    first: string;
    last: string;
  }
  type DancingDuo<T extends Name> = [T, T];

  const couple1: DancingDuo<Name> = [
    { first: 'Fred', last: 'Astaire' },
    { first: 'Ginger', last: 'Rogers' },
  ]; // OK
  const couple2: DancingDuo<{ first: string }> = [
    // Type '{ first: string; }' does not satisfy the constraint 'Name'.
    // Property 'last' is missing in type '{ first: string; }' but required in type 'Name'.
    { first: 'Sonny' },
    { first: 'Cher' },
  ];

  // type Rocket = {[property: string]: string};
  // const rocket: Rocket = {
  //   name: 'Falcon 9',
  //   variant: 'v1.0',
  //   thrust: '4,940 kN'
  // } // 정상

  interface Rocket {
    name: string;
    variant: string;
    thrust_kN: number;
  }
  const falconHeavy: Rocket = {
    name: 'Falcon Heavy',
    variant: 'v1',
    thrust_kN: 15_200,
  };

  const xs = [1, 2, 3];
  const x0 = xs[0]; // OK
  const x1 = xs['1'];
  // ~~~ Element implicitly has an 'any' type
  //      because index expression is not of type 'number'

  function get<T>(array: T[], k: string): T {
    return array[k];
    // Element implicitly has an 'any' type because index expression is not of type 'number'.
  }

  const a: number[] = [1, 2, 3];
  const b: readonly number[] = a;
  const c: number[] = b;
  //The type 'readonly number[]' is 'readonly' and cannot be assigned to the mutable type 'number[]'.

  // ~ Type 'readonly number[]' is 'readonly' and cannot be
  //   assigned to the mutable type 'number[]'
}
