const x: never = 12;

type AB = 'A' | 'B';
const e: AB = 'A';
const c: AB = 'C';

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
