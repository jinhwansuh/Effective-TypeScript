# Effective TypeScript

> 책: https://effectivetypescript.com/ 
> 
> Github: https://github.com/danvk/effective-typescript

## 목차
1. [타입스크립트 알아보기](#1-타입스크립트-알아보기)
2. [타입스크립트의 타입 시스템](#2-타입스크립트의-타입-시스템)
3. [타입 추론](#3-타입-추론)
4. [타입 설계](#4-타입-설계)
5. [any 다루기](#5-any-다루기)
6. [타입 선언과 @types](#6-타입-선언과-types)

<br>

## 1. 타입스크립트 알아보기

### 아이템 1. 타입스크립트와 자바스크립트 관계 이해하기

> 타입스크립트는 자바스크립트의 상위 집합(superset)이다. - 자바스크립트는 타입스크립트의 부분 집합(subset)이다.

<p align='center'>
<img src="https://blog.kakaocdn.net/dn/pfMvk/btqSDvgVbI6/s3SiO35LyRIACNtJ2jRXB1/img.jpg" alt="모든 자바스크립트는 타입스크립트이지만, 모든 타입스크립트가 자바스크립트는 아니다." width="200" />
</p>

- 즉, 자바스크립트 프로그램이 타입스크립트라는 명제는 참이지만, 그 반대는 성립하지 않는다.

```javascript
// 타입스크립트에선 유효
function greet(who: string) {
  console.log('Hello', who);
} 

// 자바스크립트에선 오류
function greet(who: string) {}
// SyntaxError: Unexpected token :
```

**타입스크립트에서 타입 체커는 문제점을 찾아낸다. (오타, 연산 오류, 타입오류 등)**
```typescript
let city = 'new york city';
console.log(city.toUppercase()); // error:
// Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
const a = null + 7; // error:
// Operator '+' cannot be applied to types 'null' and '7'.
const b = [] + 12; // error:
// Operator '+' cannot be applied to types 'undefined[]' and 'number'.
alert('Hello', 'TypeScript'); // error:
// Expected 0-1 arguments, but got 2.
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 2. 타입스크립트 설정 이해하기
- 타입 체커의 설정은 거의 100개에 이릅니다.
- 기본 설정 파일은 `tsc --init`을 이용하여 tsconfig.json을 만들 수 있습니다.
- 대표적으로 noImplicitAny와 strictNullChecks를 이해해야 합니다.

> noImplicitAny는 변수들이 미리 정의된 타입을 가져야 하는지 여부를 제어합니다.

**noImplicitAny가 해제되어 있을 때에는 유효**
```typescript
function add(a, b) {
  return a + b;
}
// 타입이 추론되어 function add(a: any, b: any): any; 이렇게 된다. 
// 암시적 any
```
**noImplicitAny가 설정되어 있을 때**
```typescript
function add(a, b) { // error:
  return a + b; 
} // error:
// Parameter 'a' implicitly has an 'any' type. 
// Parameter 'b' implicitly has an 'any' type.
```

**strictNullChecks가 해제되었을 때에는 유효**
```typescript
const x: number = null;
```
**strictNullChecks가 설정되었을 때**
```typescript
const x: number = null; // error:
// Type 'null' is not assignable to type 'number'.
```

> 타입스크립트는 타입을 명시하는 것이 좋고, 엄격한 체크를 하고 싶다면 strict 설정을 고려해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 3. 코드 생성과 타입이 관계없음을 이해하기

큰 그림에서 보면, 타입스크립트 컴파일러는 두 가지 역할을 수행합니다.

1. 최신 타입스크립트/자바스크립트를 브라우저에서 동작할 수 있도록 구버전의 자바스크립트로 트랜스파일(transpile)합니다.
2. 코드의 타입 오류를 체크합니다.

이 두가지가 서로 완벽히 독립적
- 타입스크립트가 자바스크립트로 변환될 때 코드 내의 타입에는 영향을 주지 않습니다.
- 그 자바스크립트의 실행 시점에도 타입은 영향을 미치지 않습니다.

#### 타입 오류가 있는 코드도 컴파일이 가능합니다
```typescript
$ cat test.ts
let x = 'hello';
x = 1234;
$ tsc test.ts
// error: Type 'number' is not assignable to type 'string'.

$ cat test.js
var x = 'hello';
x = 1234;

// 경고가 있다고 빌드를 멈추지 않습니다.
// '컴파일에 문제가 있다'보단 '타입 체크에 문제가 있다'고 말하는 것이 더 정확한 표현입니다.
```
- 오류가 있을 때 컴파일하지 않으려면, tsconfig.json에 noEmitOnError를 설정하거나 빌드 도구에 동일하게 적용하면 됩니다.

#### 런타임에는 타입 체크가 불가능합니다

#### 타입 연산은 런타임에 영향을 주지 않습니다

```typescript
function asNumber(val: number | string): number {
  return val as number;
}
// 위 코드는 타입 체커를 통과하지만 잘못된 방법을 썼습니다.
// 변환된 자바스크립트 코드
function asNumber(val) {
  return val;
}
```
```typescript
// 값을 정제하기 위해서는 런타임의 타입을 체크해야 하고 자바스크립트 연산을 통해 변환을 수행해야 합니다.
function asNumber(val: number | string): number {
  return typeof(val) === 'string' ? Number(val) : val;
}
```

#### 런타임 타입은 선언된 타입과 다를 수 있습니다
```typescript
interface LightApiResponse {
  lightSwitchValue: boolean;
}
async function setLight() {
  const response = await fetch('/light');
  const result: LightApiResponse = await response.json();
  setLightSwitch(result.lightSwitchValue);
}
// result의 타입이 API의 타입이 다를수도 있습니다.
```

#### 타입스크립트 타입으로는 함수를 오버로드할 수 없습니다

#### 타입스크립트 타입은 런타임 성능에 영향을 주지 않습니다

타입과 타입 연산자는 자바스크립트 변환 시점에 제거되기 때문에, 런타임의 성능에 아무런 영향을 주지 않습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 4. 구조적 타이핑에 익숙해지기

자바스크립트는 본질적으로 덕 타이핑(duck typing - 객체가 어떤 타입에 부합하는 변수와 메서드를 가질 경우 객체를 해당 타입에 속하는 것으로 간주하는 방식) 기반입니다.

만약 어떤 함수의 매개변수 값이 모두 제대로 주어진다면, 그 값이 어떻게 만들어졌는지 신경 쓰지 않고 사용합니다. 

타입스크립트도 매개변수 값이 요구사항을 만족한다면 신경 쓰지 않는 동작을 그대로 모델링합니다.

```typescript
interface Vector2D {
  x: number;
  y: number;
}
function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
interface NamedVector {
  name: string;
  x: number;
  y: number;
}
const v: NamedVector = {x: 3, y: 4, name: 'Zee'}
calculateLength(v); // 정상 return 5;
// Vector2D와 NamedVector의 관계를 전혀 선언하지 않았습니다.

// 3D 벡터 추가
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function normalize(v: Vector3D) {
  const length = calculateLength(v);
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}

normalize({ x: 3, y: 3, z: 5 }); // return 1.41
// 오류를 잡지 못합니다.
```

calculateLength는 2D 벡터를 기반으로 연산하는데, 버그로 인해 normalize가 3D 벡터로 연산되었습니다. z가 정규화에서 무시된 것입니다.

Vector3D와 호환되는 {x, y, z} 객체로 calculateLength를 호출하면, 구조적 타이핑 관점에서 x와 y가 있어서 Vector2D와 호환됩니다. 따라서 오류가 발생하지 않았고, 타입 체커가 문제로 인식하지 않았습니다. (이런 경우를 오류로 처리하기 위한 설정 [아이템 37](#아이템-37-공식-명칭에는-상표를-붙이기)에서 다룹니다.)

**[⬆ 상단으로](#목차)**

<br>

### 아이템 5. any 타입 지양하기

타입스크립트의 타입 시스템은 점진적(gradual)이고 선택적(optional)입니다.

#### any 타입에는 타입 안전성이 없습니다

```typescript
let age: number;
age = '12' // error: Type 'string' is not assignable to type 'number'.

age = '12' as any; // 정상
age += 1; // 정상 age = '121'
```

#### any는 함수 시그니처(contract)를 무시해 버립니다
함수를 작성할 때는 시그니처(contract)를 명시해야 합니다.

호출하는 쪽은 약속된 타입의 입력을 제공하고, 함수는 약속된 타입의 출력을 반환합니다.

그러나 any 타입을 사용하면 이런 약속을 어길 수 있습니다.

```typescript
function calculateAge(birthDate: Date): number {
  // ...
}
let birthDate: any = '1990-01-19';
calculateAge(birthDate) // 정상
```
#### any 타입에는 언어 서비스가 적용되지 않습니다
any타입을 이용하면 자동완성과 오타 체크를 이용할 수 없습니다.

> 타입스크립트의 모토는 '확장 가능한 자바스크립트'입니다.

#### any 타입은 코드 리팩터링 때 버그를 감춥니다
```typescript
// 선책하려는 아이템의 타입이 무엇인지 알기 어려워 any를 우선 사용해봅니다.
interface ComponentProps {
  onSelectItem: (item: any) => void;
}
function renderSelector(props: ComponentProps) {
  /* ... */
}
let selectedId: number = 0;
function handleSelectItem(item: any) {
  selectedId = item.id;
}
renderSelector({ onSelectItem: handleSelectItem });

// 위 id만 필요해 ComponentProps를 변경하면
interface ComponentProps {
  onSelectItem: (item: number) => void;
}
// 타입 체커를 통과함에도 불구하고 런타임에는 오류가 발생할 것입니다.
```

#### any는 타입 설계를 감춰버립니다
상태 객체 안에 있는 수많은 속성의 타입을 일일이 작성해야 하는데, any 타입을 사용하면 간단히 끝내버릴 수 있습니다.

**하지만, 이때 any를 사용하면 안됩니다.**

상태 객체의 설계를 감춰버리기 때문입니다. 
> 깔끔하고 정확하고 명료한 코드 작성을 위해 제대로 된 타입 설계는 필수입니다.

#### any는 타입시스템의 신뢰도를 떨어뜨립니다
사람은 항상 실수를 합니다. 보통은 타입 체커가 실수를 잡아주고 코드의 신뢰도가 높아집니다.

그러나 런타임에 타입 오류를 발견하게 된다면 타입 체커를 신뢰할 수 없을 겁니다.

> any 타입을 쓰지 않으면 런타임에 발견될 오류를 미리 잡을 수 있고 신뢰도를 높일 수 있습니다.

**[⬆ 상단으로](#목차)**

<br>

## 2. 타입스크립트의 타입 시스템

타입스크립트는 코드를 자바스크립트로 변환하는 [역할](#아이템-3-코드-생성과-타입이-관계없음을-이해하기)도 하지만 가장 중요한 역할은 타입 시스템에 있습니다. 이것이 타입스크립트를 사용하는 진정한 이유이기도 합니다.

### 아이템 6. 편집기를 사용하여 타입 시스템 탐색하기
편집기에서 타입스크립트 언어 서비스를 적극 활용해야 합니다.

편집기를 사용하면 어떻게 타입 시스템이 동작하는지, 그리고 타입스크립트가 어떻게 타입을 추론하는지 개념을 잡을 수 있습니다.

타입스크립트가 동작을 어떻게 모델링하는지 알기 위해 타입 선언 파일을 찾아보는 방법을 터득해야 합니다.

### 아이템 7. 타입이 값들의 집합이라고 생각하기
```typescript
const x: never = 12; // error: Type 'number' is not assignable to type 'never'.
```
**유니온 타입 ( | )**
```typescript
type AB = 'A' | 'B';
const e: AB = 'A';
const c: AB = 'C'; // error: Type '"C"' is not assignable to type 'AB'.
```
**인터섹션 타입 ( & )**
```typescript
interface Person {
  name: string;
}
interface Lifespan {
  birth: Date;
  death?: Date;
}
type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
  name: 'Lu',
  birth: new Date('2022/05/27'),
  death: new Date('9999/12/12'),
}; // 정상
// 모든 속성을 포함합니다.
```
**일반적으로 속성을 가져오는 것은 extends를 사용**
```typescript
interface Person {
  name: string;
}
interface PersonSpan extends Person {
  birth: Date;
  death?: Date;
}
```
extends 키워드는 제너릭 타입에서 한정자로도 쓰이며, 이 문맥에서는 '**~의 부분 집합**'을 의미하기도 합니다.
```typescript
function getKey<K extends string>(val: any, key: K) {
  // ...
}
getKey({}, 'x'); // 정상
getKey({}, Math.random() < 0.5 ? 'a' : 'b'); // 정상
getKey({}, document.title); // 정상
getKey({}, 12); // error: Argument of type 'number' is not assignable to parameter of type 'string'.
```
```typescript
interface Point {
  x: number;
  y: number;
}
type PointKeys = keyof Point; // 타입은 'x' | 'y'
function sortBy<K extends keyof T, T>(vals: T[], key: K): T[] {
  /// ...
}
const pts: Point[] = [{x: 1, y: 1}, {x: 2, y: 0}]
sortBy(pts, 'x') // 정상, 'x'는 'x'|'y'를 상속 (즉, keyof T)
sortBy(pts, 'y') // 정상, 'y'는 'x'|'y'를 상속
sortBy(pts, Math.random() < 0.5 ? 'x' : 'y'); // 정상, 'x'|'y' 는 'x'|'y'를 상속
sortBy(pts, 'z') // error: Argument of type '"z"' is not assignable to parameter of type 'keyof Point'.
```
<p align='center'>
<img src="https://user-images.githubusercontent.com/39963468/75360762-a06fbd80-58f9-11ea-82d8-e7d2a3d43143.png" width=500>
</p>

**[⬆ 상단으로](#목차)**

<br>

### 아이템 8. 타입 공간과 값 공간의 심벌 구분하기
타입스크립트 코드를 읽을 때 타입인지 값인지 구분하는 방법을 터득해야 합니다.

```typescript
interface Person {
  first: string;
  last: string;
}
const p: Person = { first: 'Leo', last: 'Jankos' };
function email(p: Person, subject: string, body: string): Response {
  // ...
}
type T1 = typeof p; // 타입은 Person
type T2 = typeof email; // 타입은 (p: Person, subject: string, body: string) => Response
const v1 = typeof p; // 값은 'object'
const v2 = typeof email; // 값은 function
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 9. 타입 단언보다는 타입 선언을 사용하기

```typescript
interface Person { name: string };

const alice: Person = { name: 'Alice' }; // 타입은 Person
const bob = { name: 'Bob' } as Person; // 타입은 Person
```

- 첫 번째 `alice: Person`은 변수에 '타입 선언'을 붙여서 그 값이 선언된 타입임을 명시합니다.

- 두 번째 `as Person`은 '타입 단언'을 수행합니다. 그러면 타입스크립트가 추론한 타입이 있더라도 Person 타입으로 간주합니다.

> 타입 단언보다 타입 선언을 사용하는 게 낫습니다.

```typescript
const alice: Person = {}; // error: Type '{}' is missing the following properties from type 'Person': name
const bob = {} as Person; // 오류 없음
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 10. 객체 래퍼 타입 피하기
기본형 값에 메서드를 제공하기 위해 객체 래퍼 타입이 어떻게 쓰이는지 이해해야 합니다. 직접 사용하거나 인스턴스를 생성하는 것은 피해야 합니다.

타입스크립트 객체 래퍼 타입은 지양하고, 대신 기본형 타입을 사용해야 합니다.

String대신 string, Number 대신 number, Boolean 대신 boolean, Symbol대신 symbol, BigInt대신 bigint를 사용해야 합니다.

```typescript
function isGreeting(phrase: String) {
  return ['hello', 'good day'].indexOf(phrase); // error:
} // Argument of type 'string'. 'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' when possible.
// string을 사용하도록 메세지가 나옵니다.
```
string은 String에 할당할 수 있지만 String은 string에 할당할 수 없습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 11. 잉여 속성 체크의 한계 인지하기
타입이 명시된 변수에 객체 리터럴을 할당할 때 타입스크립트는 해당 타입의 속성이 있는지, 그리고 '그 외의 속성은 없는지' 확인합니다.

**잉여 속성 체크**
```typescript
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}
const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: 'present', // error:
};
// Type '{ numDoors: number; ceilingHeightFt: number; elephant: string; }' is not assignable to type 'Room'.
// Object literal may only specify known properties, and 'elephant' does not exist in type 'Room'
```
```typescript
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
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 12 함수 표현식에 타입 적용하기
자바스크립트(그리고 타입스크립트)에서는 함수 '문장(statement)'과 함수 '표현식(expression)'을 다르게 인식합니다.

```typescript
function rollDice1(sides: number): number { /* ... */ } // 문장
const rollDice2 = function(sides: number): number { /* ... */ } // 표현식
const rollDice3 = (sides: number): number => { /* ... */ } // 표현식
```
타입스크립트에서는 함수 표현식을 사용하는 것이 좋습니다.

함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 함수 표현식에 재사용할 수 있다는 장점이 있기 때문입니다.

**함수 타입의 선언은 불필요한 코드의 반복을 줄입니다.**
```typescript
function add(a: number, b: number) { return a + b }
function sub(a: number, b: number) { return a - b }
function mul(a: number, b: number) { return a * b }
function div(a: number, b: number) { return a / b }

type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

만약 같은 타입 시그니처를 반복적으로 작성한 코드가 있다면 함수 타입을 분리해 내거나 이미 존재하는 타입을 찾아보도록 합니다.

라이브러리를 직접 만든다면 공통 콜백에 타입을 제공해야 합니다.

다른 함수의 시그니처를 참조하려면 typeof fn을 사용하면 됩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 13. 타입과 인터페이스의 차이점 알기
```typescript
// 타입
type TState = {
  name: string;
  capital: string;
}
// 인터페이스
interface IState {
  name: string;
  capital: string;
}
```
인터페이스는 타입을 확장할 수 있으며, 타입은 인터페이스를 확장할 수 있습니다.
```typescript
interface IStateWithPop extends TState {
  population: number;
}
type TStateWithPop = IState & { population: number };
```
#### 차이점
유니온 타입은 있지만 유니온 인터페이스라는 개념은 없습니다.

인터페이스는 타입을 확장할 수 있지만, 유니온은 할 수 없습니다.

```typescript
type Input = { /* ... */ };
type Output = { /* ... */ };
interface VariableMap {
  [name: string]: Input | Output;
}
type NamedVariable = (Input | Output) & { name: string };
```
위 NamedVariable 타입은 인터페이스로 표현할 수 없습니다.

type 키워드는 일반적으로 interface보다 쓰임새가 많습니다.

type 키워드는 유니온이 될 수도 있고, 매핑된 타입 또는 조건부 타입 같은 고급 기능에 활용되기도 합니다.

튜플과 배열 타입도 type 키워드를 이용해 더 간결하게 표현할 수 있습니다.
```typescript
type Pair = [number, number];
// 인터페이스로도 표현할 수 있다.
interface Tuple {
  0: number;
  1: number;
  length: 2;
}
type StringList = string[];
type NamedNums = [string, ...number[]];
```
인터페이스는 타입에 없는 몇 가지 기능이 있습니다. 

그중 하나는 바로 **보강(augment)** 이 가능하다는 것입니다.
```typescript
interface IState {
  name: string;
  capital: string;
}
interface IState {
  population: number;
}
const wyoming: IState = {
  name: 'Wyoming',
  capital: 'Seoul',
  population: 50000
} // 정상
```
이 예제처럼 속성을 확장하는 것을 '선언 병합(declaration merging)'이라고 합니다.

선업 병합은 주로 타입 선언 파일(6장)에서 사용됩니다.

따라서 타입 선언 파일을 작성 할 때는 선언 병합을 지원하기 위해 반드시 인터페이스를 사용해야 하며 표준을 따라야 합니다.

타입 선언에는 사용자가 채워야 하는 빈틈이 있을 수 있는데, 바로 이 선언 병합이 그렇습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 14. 타입 연산과 제너릭 사용으로 반복 줄이기

#### 원기둥(cylinder)의 반지름과 높이, 표면적, 부피를 출력하는 코드

**잘못된 예**
```javascript
console.log('Cylinder 1 x 1 ',
  'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 1 * 1,
  'Volume:', 3.14159 * 1 * 1 * 1);
console.log('Cylinder 1 x 2 ',
  'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 2 * 1,
  'Volume:', 3.14159 * 1 * 2 * 1);
console.log('Cylinder 2 x 1 ',
  'Surface area:', 6.283185 * 2 * 1 + 6.283185 * 2 * 1,
  'Volume:', 3.14159 * 2 * 2 * 1);
```

**개선한 코드**
```javascript
const surfaceArea = (r, h) => 2 * Math.PI * r * (r + h);
const volume = (r, h) => Math.PI * r * r * h;
for (const [r, h] of [[[1, 1], [1, 2], [2, 1]]]) {
  console.log(
    `Cylinder ${r} * ${h}`,
    `Surface area: ${surfaceArea(r, h)}`,
    `Volume: ${volume(r, h)}`
  );
}
```
> 이게 바로 같은 코드를 반복하지 말라는 DRY(Don't Repeat Yourself) 원칙입니다.

그런데 반복된 코드를 열심히 제거하며 DRY 원칙을 지켜왔던 개발자라도 타입에 대해서는 간과했을지 모릅니다.

**잘못된 예**
```typescript
interface Person {
  firstName: string;
  lastName: string;
}
interface PersonWithBirthDate {
  firstName: string;
  lastName: string;
  birth: Date;
}
// 이경우 middleName을 Person에 추가한다고 가정해 보면 Person과 BirthDate는 아예 다른 타입을 가지게 됩니다.
```

**좋은 예**
```typescript
interface Person {
  firstName: string;
  lastName: string;
}
interface PersonWithBirthDate extends Person{
  birth: Date;
}
// 이제 추가적인 필드만 작성하면 됩니다.

// 일반적이지는 않지만 인터섹션 연산자 (&)를 쓸 수도 있습니다.
type PersonWithBirthDate = Person & { birth: Date };
```

#### 전체 애플리케이션의 상태를 표현하는 State타입과 단지 부분만 표현하는 TopNavState가 있는 경우
```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}
```
**State의 부분 집합으로 TopNavState를 정의하는 것이 바람직**
```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
type TopNavState = {
  userId: State['userId'];
  pageTitle: State['pageTitle'];
  recentFiles: State['recentFiles'];
};
```
**좋은 예: 매핑된 타입을 사용**
```typescript
type TopNavState = {
  [k in 'userId' | 'pageTitle' | 'recentFiles']: State[k]
};

// Pick을 이용
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>;
```
<br>

**ActionType을 정의하는 법**

```typescript
interface SaveAction {
  type: 'save';
  // ...
}
interface LoadAction {
  type: 'load';
  // ...
}
type Action = SaveAction | LoadAction;
type ActionType = 'save' | 'load';  // 타입의 반복!
```

**유니온 인덱싱을 이용하여 ActionType 정의**
```typescript
// Action 유니온에 타입을 더 추가하면 ActionType은 자동적으로 그 타입을 포함합니다.
type ActionType = Action['type'];  // 타입은 "save" | "load"

// ActionType은 Pick을 사용하여 얻게 되는, type 속성을 가지는 인터페이스와는 다릅니다.
type ActionRec = Pick<Action, 'type'>;  // {type: "save" | "load"}
```

**값의 형태에 해당하는 타입을 정의하고 싶을 때: typeof를 이용**
```typescript
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: '#00FF00',
  label: 'VGA',
};
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}

type Options = typeof INIT_OPTIONS;
```

제너릭 타입은 타입을 위한 함수와 같습니다.

그리고 함수는 코드에 대한 DRY 원칙을 지킬 때 유용하게 사용됩니다.

따라서 타입에 대한 DRY 원칙의 핵심이 제너릭이라는 것은 어쩌면 당연해 보이는데, 간과한 부분이 있습니다.

함수에서 매개변수로 매핑할 수 있는 값을 제한하기 위해 타입 시스템을 사용하는 것처럼 제너릭 타입에서 매개변수를 제한할 수 있는 방법이 필요합니다.

제너릭 타입에서 매개변수를 제한할 수 있는 방법은 extends를 사용하는 것입니다.

extends를 이용하면 제너릭 매개변수를 특정 타입을 확장한다고 선언 할 수 있습니다.

```typescript
interface Name {
  first: string;
  last: string;
}
type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  { first: 'Fred', last: 'Astaire' },
  { first: 'Ginger', last: 'Rogers' },
]; // 정상
const couple2: DancingDuo<{ first: string }> = [
  // Type '{ first: string; }' does not satisfy the constraint 'Name'.
  // Property 'last' is missing in type '{ first: string; }' but required in type 'Name'.
  { first: 'Sonny' },
  { first: 'Cher' },
];
// {first: string}은 Name을 확장하지 않기 때문에 오류가 발생합니다.
```

> [타입](#아이템-7-타입이-값들의-집합이라고-생각하기)이 값의 집합이라는 관점에서 생각하면 extends를 '확장'이 아니라 '부분 집합'이라는 걸 이해하는데 도움이 될 겁니다.

점점 더 추상적인 타입을 다루고 있지만, 원래의 목표를 잊으면 안 됩니다.

원래의 목표는 **유효한 프로그램은 통과시키고 무효한 프로그램에는 오류를 발생**시키는 것입니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 15. 동적 데이터에 인덱스 시그니처 사용하기

자바스크립트의 장점 중 하나는 바로 객체를 생성하는 문법이 간단하다는 것입니다.

타입스크립트에서는 타입에 '인덱스 시그니처'를 명시하여 유연하게 매핑을 표현할 수 있습니다.

```typescript
type Rocket = {[property: string]: string};
const rocket: Rocket = {
  name: 'Falcon 9',
  variant: 'v1.0',
  thrust: '4,940 kN'
} // 정상
```
`[property: string]: string`이 인덱스 시그니처이며, 다음 세 가지 의미를 담고 있습니다.

- 키의 이름: 키의 위치만 표시하는 용도입니다. 타입 체커에서는 사용하지 않습니다.
- 키의 타입: string이나 number 또는 symbol이 조합이어야 하지만, 보통은 string을 사용합니다([아이템 16](#아이템-16-number-인덱스-시그니처보다는-array-튜플-arraylike를-사용하기)).
- 값의 타입: 어떤 것이든 될 수 있습니다.

<br>

이렇게 타입 체크가 수행되면 네 가지 단점이 드러납니다.

- 잘못된 키를 포함해 모든 키를 허용합니다. name대신 Name으로 작성해도 유효한 Rocket 타입이 됩니다.
- 특정 키가 필요하지 않습니다. {}도 유요한 Rocket 타입입니다.
- 키마다 다른 타입을 가질 수 없습니다. 예를 들어, thrust는 string이 아니라 number여야 할 수도 있습니다.
- 타입스크립트 언어 서비스는 다음과 같은 경우에 도움이 되지 못합니다. name:을 입력할 때, 키는 무엇이든 가능하기 때문에 자동 완성 기능이 동작하지 않습니다.

**인덱스 니그니처는 부정확하므로 더 나은 방법을 찾아야 합니다.**

```typescript
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
```

인덱스 시그니처는 동적 데이터를 표현할 때 사용합니다.

예를 들어 CSV 파일처럼 헤더 행(row)에 열(column) 이름이 있고, 데이터 행을 열 이름과 값으로 매핑하는 객체로 나타내고 싶은 경우입니다.
```typescript
function parseCSV(input: string): {[columnName: string]: string}[] {
  const lines = input.split('\n');
  const [header, ...rows] = lines;
  return rows.map(rowStr => {
    const row: {[columnName: string]: string} = {};
    rowStr.split(',').forEach((cell, i) => {
      row[header[i]] = cell;
    });
    return row;
  });
}
```
일반적인 상황에서 열 이름이 무엇인지 미리 알 방법은 없습니다.

이럴 때는 인덱스 시그니처를 사용합니다.

반면에 열 이름을 알고 있는 특정한 상황에 parseCSV가 사용된다면, 미리 선언해 둔 타입으로 단언문을 사용합니다.

```typescript
interface ProductRow {
  productId: string;
  name: string;
  price: string;
}

declare let csvData: string;
const products = parseCSV(csvData) as unknown as ProductRow[];

// 선언 해 둔 열들이 런타임에 실제로 일치한다는 보장은 없습니다.
// 이 부분이 걱정된다면 값 타입에 undefined를 추가할 수 있습니다.
function safeParseCSV(
  input: string
): {[columnName: string]: string | undefined}[] {
  return parseCSV(input);
}
```

어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링하지 말아야 합니다.

예를 들어 데이터에 A, B, C, D 같은 키가 있지만, 얼마나 많이 있는지 모른다면 선택적 필드 또는 유니온 타입으로 모델링하면 됩니다.
```typescript
interface Row1 { [column: string]: number }  // 너무 광범위
interface Row2 { a: number; b?: number; c?: number; d?: number }  // 최선
type Row3 =
    | { a: number; }
    | { a: number; b: number; }
    | { a: number; b: number; c: number;  }
    | { a: number; b: number; c: number; d: number }; // 가장 정확하지만 번거로움
```

마지막 형태가 가장 정확하지만, 사용하기에는 조금 번거롭습니다.

string 타입이 너무 광범위해서 인덱스 시그니처를 사용하는 데 문제가 있다면, 두 가지 다른 대안을 생각해 볼 수 있습니다.

- 첫 번째, Record를 사용하는 방법입니다. Record는 키 타입에 유연성을 제공하는 제너릭 타입입니다. 특히, string의 부분 집합을 사용할 수 있습니다.

```typescript
type Vec3D = Record<'x' | 'y' | 'z', number>;
// Type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }
```
- 두 번째, 매핑된 타입을 사용하는 방법입니다. 매핑된 타입은 키마다 별도의 타입을 사용하게 해 줍니다.

```typescript
type Vec3D = {[k in 'x' | 'y' | 'z']: number};
// Type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }

type ABC = {[k in 'a' | 'b' | 'c']: k extends 'b' ? string : number};
// Type ABC = {
//   a: number;
//   b: string;
//   c: number;
// }
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 16. number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기

자바스크립트는 이상하게 동작하기로 유명한 언어입니다.

그중 가장 악명 높은 것은 암시적 타입 강제와 관계된 부분입니다.

```javascript
'0' == 0
// true
```
다행이도 암시적 타입 강제와 관련된 문제는 대부분 `===`와 `!==`를 사용해서 해결이 가능합니다.

자바스크립트에서 객체란 키/값 쌍의 모음입니다. 키는 보통 문자열입니다.(ES2015 이후로는 심벌일 수 있습니다). 그리고 값은 어떤 것이든 될 수 있습니다.

```javascript
x = {};
x[[1, 2, 3]] = 2;
// toString 메서드가 호출되어 객체가 문자열로 변환됩니다.
x; // { '1,2,3': 2 }

// 숫자는 키로 사용할 수 없습니다. 만약 속성 이름으로 숫자를 사용하려고 하면, 자바스크립트 런타임은 문자열로 변환할 겁니다.
y = { 1: 2, 3: 4 };
// y = { '1': 2, '3': 4 }

typeof []; // 'object'

k = [1, 2, 3];
k[0] // 1
// 문자열 키를 사용해도 역시 배열의 요소에 접근할 수 있습니다.
k['1'] // 2

// 배열의 키를 나열해보면, 키가 문자열로 출력됩니다.
Object.keys(k) // [ '0', '1', '2' ]
```

타입스크립트는 이러한 혼란을 바로잡기 위해 숫자 키를 허용하고, 문자열 키와 다른 것으로 인식합니다.

```typescript
function get<T>(array: T[], k: string): T {
  return array[k];
  // Element implicitly has an 'any' type because index expression is not of type 'number'.
}
```
배열은 객체이므로 키는 숫자가 아니라 문자열입니다.

인덱스 시그니처로 사용된 number 타입은 버그를 잡기 위한 순수 타입스크립트 코드입니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 17. 변경 관련된 오류 방지를 위해 readonly 사용하기

```typescript
const a: number[] = [1, 2, 3];
const b: readonly number[] = a;
const c: number[] = b; // error:
//The type 'readonly number[]' is 'readonly' and cannot be assigned to the mutable type 'number[]'.
```

number[]는 readonly number[]보다 기능이 많기 때문에, readonly number[]의 서브타입이 됩니다 [아이템7](#아이템-7-타입이-값들의-집합이라고-생각하기).

따라서 변경 가능한 배열을 readonly 배열에 할당 할 수 있습니다. 하지만 그 반대는 불가능합니다.

매개변수를 readonly로 선언하면 다음과 같은 일이 생깁니다.

- 타입스크립트는 매개변수가 함수 내에서 변경이 일어나는지 체크합니다.
- 호출하는 쪽에서는 함수가 매개변수를 변경하지 않는다는 보장을 받게 됩니다.
- 호출하는 쪽에서 함수에 readonly 배열을 매개변수로 넣을 수도 있습니다.

> readonly는 얕게(shallow) 동작한다는 것에 유의하며 사용해야 합니다.

```typescript
const dates: readonly Date[] = [new Date()];
dates.push(new Date()); // error: Property 'push' does not exist on type 'readonly Date[]'.
dates[0].setFullYear(2037); // 정상
```
```typescript
interface Outer {
  inner: {
    x: number;
  }
}
const o: Readonly<Outer> = { inner: { x: 0 }};
o.inner = { x: 1 }; // error: Cannot assign to 'inner' because it is a read-only property.
o.inner.x = 1;  // 정상

type T = Readonly<Outer>;
// Type T = {
//   readonly inner: {
//     x: number;
//   };
// }

// readonly 접근제어자는 inner에 적용되는 것이지 x는 아니라는 것입니다.
```

현재 시점에는 깊은(deep) readonly 타입이 기본으로 지원되지 않지만, 제너릭을 만들면 깊은 readonly 타입을 사용할 수 있습니다. 그러나 제너릭은 만들기 까다롭기 때문에 라이브러리를 사용하는 게 낫습니다.

인덱스 시그니처에도 readonly를 쓸 수 있습니다. 읽기는 허용하되 쓰기를 방지하는 효과가 있습니다.
```typescript
let obj: { readonly [k: string]: number } = {};
// 또는 Readonly<{[k: string]: number}
obj.hi = 45; // error: 
//  Index signature in type '{ readonly [k: string]: number; }' only permits reading.
obj = { ...obj, hi: 12 }; // 정상
obj = { ...obj, bye: 34 }; // 정상
```

> 만약 함수가 매개변수를 수정하지 않는 다면 readonly로 선언하는 것이 좋습니다.
> 
> readonly 매개변수는 인터페이스를 명확하게 하며, 매개변수가 변경되는 것을 방지합니다.
> 
> readonly는 얕게 동작한다는 것을 명심해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 18. 매핑된 타입을 사용하여 값을 동기화하기

산점도(scatter plot)을 그리기 위한 UI 컴포넌트를 작성한다고 가정해 보겠습니다.

여기에는 디스플레이와 동작을 제어하기 위한 몇 가지 다른 타입의 속성이 포함됩니다.
```typescript
interface ScatterProps {
  // The data
  xs: number[];
  ys: number[];

  // Display
  xRange: [number, number];
  yRange: [number, number];
  color: string;

  // Events
  onClick: (x: number, y: number, index: number) => void;
}
```

최적화를 두 가지 방법으로 구현해 보겠습니다.

- 첫 번째, 보수적(conservative) 접근법, 실패에 닫힌(fail close) 접근법 - 오류 발생 시에 적극적으로 대처하는 방향
```typescript
function shouldUpdate(
  oldProps: ScatterProps,
  newProps: ScatterProps
) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if (oldProps[k] !== newProps[k]) {
      if (k !== 'onClick') return true;
    }
  }
  return false;
}
```
이 접근법을 이용하면 차트가 정확하지만 너무 자주 그려질 가능성이 있습니다.

- 두 번째, 실패에 열린 접근법
```typescript
function shouldUpdate(
  oldProps: ScatterProps,
  newProps: ScatterProps
) {
  return (
    oldProps.xs !== newProps.xs ||
    oldProps.ys !== newProps.ys ||
    oldProps.xRange !== newProps.xRange ||
    oldProps.yRange !== newProps.yRange ||
    oldProps.color !== newProps.color
    // (no check for onClick)
  );
}
```
이 코드는 차트를 불필요하게 다시 그리는 단점을 해결했습니다.

하지만 실제로 차트를 다시 그려야 할 경우에 누락되는 일이 생길 수 있습니다.

이는 히포크라테스 전집에 나오는 원칙 중 하나인 '우선, 망치지 말 것(first, do no harm)'을 어기기 때문에 일반적인 경우에 쓰이는 방법은 아닙니다.

새로운 속성이 추가될때 직접 shouldUpdate를 고치도록 하는 게 낫습니다.

이때 타입 체커가 대신 할 수 있게 하는 것이 좋습니다.

<br>

**매핑된 타입과 객체를 사용하는 것**
```typescript
const REQUIRES_UPDATE: {[k in keyof ScatterProps]: boolean} = {
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
};

function shouldUpdate(
  oldProps: ScatterProps,
  newProps: ScatterProps
) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if (oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
      return true;
    }
  }
  return false;
}

// 나중에 ScatterProps에 새로운 속성을 추가할 경우 REQUIRES_UPDATE의 정의에 오류가 발생합니다.
```

> 인터페이스에 새로운 속성을 추가할 때, 선택을 강제하도록 매핑된 타입을 고려해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

## 3. 타입 추론

타입스크립트는 타입 추론을 적극적으로 수행합니다.

타입 추론은 수동으로 명시해야 하는 타입 구문의 수를 엄청나게 중여 주기 때문에, 코드의 전체적인 안정성이 향상됩니다.

> 타입스크립트 초보자와 숙련자는 타입 구문의 수에서 차이가 납니다.

숙련된 타입스크립트 개발자는 비교적 적은 수의 구문(그러나 중요한 부분에는 사용)을 사용합니다.

반면, 초보자의 코드는 불필요한 타입 구문으로 도배되어 있을 겁니다.

### 아이템 19. 추론 가능한 타입을 사용해 장황한 코드 방지하기

타입스크립트를 처음 접한 개발자가 자바스크립트 코드를 포팅할 때 가장 먼저 하는 일은 타입 구문을 넣는 것입니다.

타입스크립트가 결국 타입을 위한 언어이기 때문에, 변수를 선언할 때마다 명시해야 한다고 생각하기 때문입니다.

**그러나 타입스크립트의 많은 타입 구문은 사실 불필요합니다.**

모든 변수에 타입을 선언하는 것은 비생산적이며 형편없는 스타일로 여겨집니다.

`let x: number = 12;`는 `let x = 12;`처럼만 해도 충분합니다.

타입스크립트는 입력받아 연산을 하는 함수가 어떤 타입을 반환하는지 정확히 알고 있습니다.
```typescript
function square(nums: number[]) {
  return nums.map(x => x * x);
}
const squares = square([1, 2, 3, 4]); // 타입은 number[]
```
타입스크립트는 여러분이 예상한 것보다 더 정확하게 추론하기도 합니다.
```typescript
const axis1: string = 'x';  // 타입은 string
const axis2 = 'y';  // 타입은 "y"
```

타입이 추론되면 리팩터링 역시 용이해집니다.
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

function logProduct(product: Product) {
  const id: number = product.id;
  const name: string = product.name;
  const price: number = product.price;
  console.log(id, name, price);
}

// id가 string으로 바뀌었을 경우를 생각해
// 비구조화 할당문을 사용해 구현하는 게 낫습니다.

function logProduct(product: Product) {
  const {id, name, price} = product;
  console.log(id, name, price);
}
```

어떤 언어들은 매개변수의 최종 사용처까지 참고하여 타입을 추론하지만, 타입스크립트는 최종 사용처까지 고려하지 않습니다.

> 타입스크립트에서 변수의 타입은 일반적으로 처음 등장할 때 결정됩니다.

함수 매개변수에 타입 구문을 생략하는 경우도 간혹 있습니다. 

**기본값이 있는 경우의 예**
```typescript
function parseNumber(str: string, base=10) {
  // ...
}
// base의 기본값이 10이기 때문에 base의 타입은 number로 추론됩니다.
```

보통 타입 정보가 있는 라이브러리에서, 콜백 함수의 매개변수 타입은 자동으로 추론됩니다.

다음 예제에서 express HTTP 서버 라이브러리를 사용하는 request와 response의 타입 선언은 필요하지 않습니다.
```typescript
// 이렇게 하지 맙시다.
app.get('/health', (request: express.Request, response: express.Response) => {
  response.send('OK');
});

// 이렇게 합시다.
app.get('/health', (request, response) => {
  response.send('OK');
});
```

타입이 추론될 수 있음에도 여전히 타입을 명시하고 싶은 몇 가지 상황이 있습니다. 

그중 하나는 **객체 리터럴을 정의**할 때입니다.

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}

function logProduct(product: Product) {
  const {id, name, price} = product;
  console.log(id, name, price);
}
const furby = {
  name: 'Furby',
  id: 630509430963,
  price: 35,
};
logProduct(furby); // error:
// Argument of type '{ name: string; id: number; price: number; }' is not assignable to parameter of type 'Product'.
// Types of property 'id' are incompatible.
// Type 'number' is not assignable to type 'string'.
```

객체에 타입 구문을 제대로 명시한다면, 실제로 실수가 발생한 부분에 오류를 표시해 줍니다.
```typescript
const furby: Product = {
  name: 'Furby',
  id: 630509430963, // error: Type 'number' is not assignable to type 'string'.
  price: 35,
};
```

마찬가지로 함수의 반환에도 타입을 명시하여 오류를 방지할 수 있습니다.

타입 추론이 가능할지라도 구현상의 오류가 함수를 호출한 곳까지 영향을 미치지 않도록 하기 위해 타입 구문을 명시하는게 좋습니다.

주식 시세를 조회하는 함수를 작성했다고 가정해 보겠습니다.
```typescript
function getQuote(ticker: string) {
  return fetch(`https://quotes.example.com/?q=${ticker}`)
      .then(response => response.json());
}

// 이미 조화한 종목을 다시 요청하지 않도록 캐시를 추가합니다.
const cache: { [ticker: string]: number } = {};
function getQuote(ticker: string) {
  if (ticker in cache) {
    return cache[ticker];
  }
  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote;
      return quote;
    });
}
```
그런데 이 코드에는 오류가 있습니다. 

getQuote는 항상 Promise를 반환하므로 if 구문에는 `cache[ticker]`가 아닌 `Promise.resolve(cache[ticker])`가 반환되도록 해야 합니다.

실행해 보면 오류는 getQuote 내부가 아닌 getQuote를 호출한 코드에서 발생합니다.

```typescript
getQuote('MSFT').then(considerBuying); // error: 
// Property 'then' does not exist on type 'number | Promise<any>'.
// Property 'then' does not exist on type 'number'.
```

이때 의도된 반환 타입 `Promise<number>`을 명시한다면, 정확한 위치에 오류가 표시됩니다.
```typescript
function getQuote(ticker: string): Promise<number> {
  if (ticker in cache) {
    return cache[ticker]; // error:
    // Type 'number' is not assignable to type 'Promise<number>'.
  }
}
```

반환 타입을 명시하면, 구현상의 오류가 사용자 코드의 오류로 표시되지 않습니다. (Promise와 관련된 특정 오류를 피하는 데는 async 함수가 효과적입니다. (아이템25))

오류의 위치를 제대로 표시해 주는 이점 외에도, 반환 타입을 명시해야 하는 이유가 두 가지 더 있습니다.
- 반환 타입을 명시하면 함수에 대해 더욱 명확하게 알 수 있기 때문입니다.
  - 추후에 코드가 조금 변경되어도 그 함수의 시그니처는 쉽게 바뀌지 않습니다.
  - 미리 타입을 명시하는 방법은, 함수를 구현하기 전에 테스트를 먼저 작성하는 테스트 주도 개발(test driven development, TDD)과 비슷합니다.

<br> 

- 명명된 타입을 사용하기 위해서입니다.
  - 함수 반환 타입을 명시하지 않았을 때, 
  ```typescript 
  interface Vector2D { x: number; y: number; }
  function add(a: Vector2D, b: Vector2D) {
    return { x: a.x + b.x, y: a.y + b.y };
  } // 반환 타입을 { x: number; y: number; }로 추론했습니다.
  ```
  반환 타입을 명시하면 더욱 직관적인 표현이 됩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 20. 다른 타입에는 다른 변수 

자바스크립트에서는 한 변수를 다른 목적을 가지는 다른 타입으로 재사용해도 됩니다.

**javascript에서는 정상**
```javascript
function fetchProduct(id) {}
function fetchProductBySerialNumber(id) {}
let id = '12-34-56';
fetchProduct(id);
id = 123456;
fetchProductBySerialNumber(id);
```
**typescript에서는 두 가지 오류 발생**
```typescript
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
let id = '12-34-56';
fetchProduct(id);

id = 123456; // error:
// '123456' is not assignable to type 'string'.
fetchProductBySerialNumber(id); // error:
// Argument of type 'string' is not assignable to
// parameter of type 'number'
```

위의 예시에서 '**변수의 값은 바뀔 수 있지만 그 타입은 보통 바뀌지 않는다**'라는 관점을 알 수 있습니다.

**유니온 타입을 이용한 예 권장 X**
```typescript
let id: string|number = "12-34-56";
fetchProduct(id);

id = 123456;  // 정상
fetchProductBySerialNumber(id);  // 정상
```

**별도의 변수를 도입 권장 O**
```typescript
const id = "12-34-56";
fetchProduct(id);

const serial = 123456;  // 정상
fetchProductBySerialNumber(serial);  // 정상
```

타입이 바뀌는 변수는 되도록 피해야 하며, 목적이 다른 곳에는 별도의 변수명을 사용해야 합니다.

지금까지 이야기한 재사용되는 변수와, 다음 예제에 나오는 '가려지는(shadowed)' 변수를 혼동해서는 안 됩니다.
```typescript
const id = "12-34-56";
fetchProduct(id);

{
  const id = 123456;  // 정상
  fetchProductBySerialNumber(id);  // 정상
}
```

> 변수의 값은 바뀔 수 있지만 타입은 일반적으로 바뀌지 않습니다.
> 
> 혼란을 막기 위해 타입이 다른 값을 다룰 때에는 변수를 재사용하지 않도록 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 21. 타입 넓히기

상수를 사용해서 변수를 초기화할 때 타입을 명시하지 않으면 타입 체커는 타입을 결정해야 합니다.

이 말은 지정된 단일 값을 가지고 할당 가능한 값들의 집합을 유추해야 한다는 뜻입니다.

타입스크립트에서는 이러한 과정을 '**넓히기(widening)**'라고 부릅니다.

넓히기의 과정을 이해한다면 오류의 원인을 파악하고 타입 구문을 더 효과적으로 사용할 수 있을 것입니다.

벡터를 다루는 라이브러리를 작성한다고 가정해 보겠습니다.
```typescript
interface Vector3 { x: number; y: number; z: number; }
function getComponent(vector: Vector3, axis: 'x' | 'y' | 'z') {
  return vector[axis];
}

let x = 'x';
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x); // error:
// Argument of type 'string' is not assignable to parameter of type '"x" | "y" | "z"'.
```

런타임에 오류 없이 실행되지만, 편집기에서는 오류가 표시됩니다.

x의 타입은 할당 시점에 넓히기가 동작해서 string으로 추론되었습니다.

string 타입은 "x" | "y" | "z" 타입에 할당이 불가능하므로 오류가 된 것입니다.

<br>

`const mixed = ['x', 1];`라는 코드의 타입이 추론될수 있는 후보가 상당히 많습니다.

```md
- ('x' | 1)[]
- ['x', 1]
- [string, number]
- readonly [string, number]
- (string|number)[]
- readonly (string|number)[]
- [any, any]
- any[]
```

타입스크립트는 넓히기의 과정을 제어할 수 있도록 몇 가지 방법을 제공합니다.

넓히기 과정을 제어할 수 있는 첫 번째 방법은 const입니다.
```typescript
const x = 'x';  // 타입은 "x"
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x);  // 정상
```

x는 재할당될 수 없으므로 타입스크립트는 의심의 여지 없이 더 좁은 타입("x")으로 추론할 수 있습니다.

그러나 const는 만능이 아닙니다.

다음 코드는 자바스크립트에서 정상입니다.
```javascript
const v = {
  x: 1,
};
v.x = 3;
v.x = '3';
v.y = 4;
v.name = 'Pythagoras';
```

그러나 타입스크립트에서는 세 문장에서 오류가 발생합니다.
```typescript
const v = {
   x: 1,
 };
 v.x = 3;  // 정상
 v.x = '3'; // error: Type '"3"' is not assignable to type 'number'
 v.y = 4; // error: Property 'y' does not exist on type '{ x: number; }'
 v.name = 'Pythagoras'; // error: Property 'name' does not exist on type '{ x: number; }'
```

타입 추론의 강도를 직접 제어하려면 타입스크립트의 기본 동작을 재정의해야 합니다.

타입스크립트의 기본 동작을 재정의하는 세 가지 방법이 있습니다.

- 명시적 타입 구문을 제공하는 것입니다.

```typescript
const v: {x: 1|3|5} = {
  x: 1,
};  // 타입이 { x: 1 | 3 | 5; }
```

- 타입 체커에 추가적인 문맥([아이템 26](#아이템-26-타입-추론에-문맥이-어떻게-사용되는지-이해하기))을 제공하는 것입니다. (예를 들어, 함수의 매개변수로 값을 전달)

- const 단언문을 사용하는 것입니다.

const 단언문과 변수 선언에 쓰이는 let이나 const와 혼동해서는 안 됩니다.

const 단언문은 온전히 타입 공간의 기법입니다.

```typescript
const v1 = {
  x: 1,
  y: 2,
};  // 타입은 { x: number; y: number; }

const v2 = {
  x: 1 as const,
  y: 2,
};  // 타입은 { x: 1; y: number; }

const v3 = {
  x: 1,
  y: 2,
} as const;  // 타입은 { readonly x: 1; readonly y: 2; } - 최대한 좁은 타입으로 추론
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 22. 타입 좁히기

타입 좁히기는 타입스크립트가 넓은 타입으로부터 좁은 타입으로 진행하는 과정을 말합니다.

아마도 가장 일반적인 예시는 null 체크일 겁니다.

```typescript
const el = document.getElementById('foo'); // 타입이 HTMLElement | null
if (el) {
  el // 타입은 HTMLElement
  el.innerHTML = 'Party Time'.blink();
} else {
  el // 타입은 null
  alert('No element #foo');
}
```

만약 el이 null이라면, 분기문의 첫 번째 블록이 실행되지 않습니다. 즉, 첫 번째 블록에서 HTMLElement | null 타입의 null을 제외하므로, 더 좁은 타입이 되어 작업이 훨씬 쉬워집니다.

타입 체커는 일반적으로 이러한 조건문에서 타입좁히기를 잘 해내지만, 타입 별칭이 존재한다면 그러지 못할 수도 있습니다([아이템 24](#아이템-24-일관성-있는-별칭-사용하기)).

타입스크립트는 일반적으로 조건문에서 타입을 좁히는 데 매우 능숙합니다.

그러나 타입을 섣불리 판단하는 실수를 저지르기 쉬우므로 다시 한번 꼼꼼히 따져 봐야 합니다.

예를 들어, 다음 예제는 유니온 타입에서 null을 제외하기 위해 잘못된 방법을 사용했습니다.

```typescript
const el = document.getElementById('foo'); // 타입이 HTMLElement | null
if (typeof el === 'object') {
  el;  // 타입이 HTMLElement | null
}
```

자바스크립트에서 typeof null이 'object'이기 때문에, if구문에서 null이 제외되지 않았습니다.

또한 기본형 값이 잘못되어도 비슷한 사례가 발생합니다.

```typescript
function foo(x?: number | string | null) {
  if (!x) {
    x; // 타입이 string | number | null | undefined
  }
}
```
빈 문자열 ''과 0 모두 false가 되기 때문에, 타입은 전혀 좁혀지지 않았고 x는 여전히 블록 내에서 string 또는 number가 됩니다.

<br>

타입을 좁히는 또 다른 일반적인 방법은 명시적 '태그'를 붙이는 것입니다.

```typescript
interface UploadEvent { type: 'upload'; filename: string; contents: string }
interface DownloadEvent { type: 'download'; filename: string; }
type AppEvent = UploadEvent | DownloadEvent;

function handleEvent(e: AppEvent) {
  switch (e.type) {
    case 'download':
      e  // 타입이 DownloadEvent
      break;
    case 'upload':
      e;  // 타입이 UploadEvent
      break;
  }
}
```
이 패턴은 '태그된 유니온(tagged union)' 또는 '구별된 유니온(discriminated union)'이라고 불리며, 타입스크립트 어디에서나 찾아볼 수 있습니다.

만약 타입스크립트가 타입을 식별하지 못한다면, 식별을 돕기 위해 커스텀 함수를 도입할 수 있습니다.

```typescript
function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return 'value' in el;
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    el; // 타입이 HTMLInputElement
    return el.value;
  }
  el; // 타입이 HTMLElement
  return el.textContent;
}
```

어떤 함수들은 타입 가드를 사용하여 배열과 객체의 타입 좁히기를 할 수 있습니다.

예를 들어, 배열에서 어떤 탐색을 수행할 때 undefined가 될 수 있는 타입을 사용할 수 있습니다.
```typescript
const jackson5 = ['Jackie', 'Tito', 'Jermaine', 'Marlon', 'Michael'];
const members = ['Janet', 'Michael'].map(
  who => jackson5.find(n => n === who)
);  // 타입은 (string | undefined)[]

// filter함수를 사용해 undefined를 걸러 내려고 해도 잘 동작하지 않을 겁니다.
const members = ['Janet', 'Michael'].map(
  who => jackson5.find(n => n === who)
).filter(who => who !== undefined);  // 타입은 (string | undefined)[]
```

이럴 때 타입 가드를 사용하면 타입을 좁힐 수 있습니다.
```typescript
const jackson5 = ['Jackie', 'Tito', 'Jermaine', 'Marlon', 'Michael'];
function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
const members = ['Janet', 'Michael'].map(
  who => jackson5.find(n => n === who)
).filter(isDefined);  // 타입은 string[]
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 23. 한꺼번에 객체 생성하기

[아이템 20](#아이템-20-다른-타입에는-다른-변수)에서 설명했듯이 변수의 값은 변경될 수 있지만, 타입스크립트의 타입은 일반적으로 변경되지 않습니다.

이러한 특성 덕분에 일부 자바스크립트 패턴을 타입스크립트로 모델링하는 게 쉬워집니다.

즉, 객체를 생성할 때는 속성을 하나씩 추가하기보다는 여러 속성을 포함해서 한꺼번에 생성해야 타입 추론에 유리합니다.

다음은 자바스크립트에서는 유효하지만 타입스크립트에서는 오류가 나는 2차원 점을 표현하는 객체를 생성하는 방법입니다.

```typescript
const pt = {};
pt.x = 3; // error:
// Property 'x' does not exist on type '{}'
pt.y = 4; // error:
// Property 'y' does not exist on type '{}'
```

왜냐하면 첫 번째 줄의 pt 타입은 {} 값을 기준으로 추론되기 때문입니다. 존재하지 않는 속성을 추가할 수는 없습니다.

만약 Point 인터페이스를 정의한다면 오류가 다음처럼 바뀝니다.
```typescript
interface Point { x: number; y: number; }
const pt: Point = {}; // error:
   // Type '{}' is missing the following properties from type 'Point': x, y
pt.x = 3;
pt.y = 4;

// 이 문제들은 객체를 한번에 정의하면 해결할 수 있습니다.
const pt = {
  x: 3,
  y: 4,
}; // 정상

// 단언문을 사용해 타입 체커를 통과하게 할 수 있습니다.
interface Point { x: number; y: number; }
const pt = {} as Point;
pt.x = 3;
pt.y = 4;  // 정상

// 물론 객체를 한꺼번에 만드는 게 더 낫습니다(아이템 9).
const pt: Point = {
  x: 3,
  y: 4,
};
```

작은 객체들을 조합해서 큰 객체를 만들어야 하는 경우에도 여러 단계를 거치는 것은 좋지 않은 생각입니다.

```typescript
interface Point { x: number; y: number; }
const pt = {x: 3, y: 4};
const id = {name: 'Pythagoras'};
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name; // error:
// Property 'name' does not exist on type '{}'

// 객체 전개 연산자 (...)를 사용하면 큰 객체를 한꺼번에 만들어 낼수 있습니다.
const namedPoint = {...pt, ...id};
namedPoint.name;  // 정상, 타입이 string
```

객체 전개 연산자를 사용하면 타입 걱정 없이 필드 단위로 객체를 생성할 수도 있습니다.

이때 모든 업데이트마다 새 변수를 사용하여 각각 새로운 타입을 얻도록 하는 게 중요합니다.

```typescript
interface Point { x: number; y: number; }
const pt0 = {};
const pt1 = {...pt0, x: 3};
const pt: Point = {...pt1, y: 4};  // 정상
```

간단한 객체를 만들기 위해 우회하기는 했지만, 객체에 속성을 추가하고 타입스크립트가 새로운 타입을 추론할 수 있게 해 유용합니다.

전개 연산자로 한꺼번에 여러 속성을 추가할 수도 있습니다.
```typescript
declare let hasMiddle: boolean;
const firstLast = {first: 'Harry', last: 'Truman'};
const president = {...firstLast, ...(hasMiddle ? {middle: 'S'} : {})};

// 타입이 선택적 속성을 가진 것으로 추론된다는 것을 확인할 수 있습니다.
// const president: {
//   middle?: string;
//   first: string;
//   last: string;
// }
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 24. 일관성 있는 별칭 사용하기

```javascript
const borough = {name: 'Brooklyn', location: [40.688, -73.979]};
const loc = borough.location;

// 별칭의 값을 변경하면 원래 속성값에서도 변경됩니다.
loc[0] = 0;
borough.location // [0, -73.979]
```
그런데 별칭을 남발해서 사용하면 제어 흐름을 분석하기 어렵습니다.

모든 언어의 컴파일러 개발자들은 무분별한 별칭 사용으로 골치를 썩고 있습니다.

타입스크립트에서도 마찬가지로 별칭을 신중하게 사용해야 합니다.

그래야 코드를 잘 이해할 수 있고, 오류도 쉽게 찾을 수 있습니다.

<br>

다각형을 표현하는 자료구조와 어떤 점이 다각형에 포함되는지 체크하는 예시를 보겠습니다.

```typescript
interface Coordinate {
  x: number;
  y: number;
}
interface BoundingBox {
  x: [number, number];
  y: [number, number];
}
interface Polygon {
  exterior: Coordinate[];
  holes: Coordinate[][];
  bbox?: BoundingBox;
}

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  if (polygon.bbox) {
    if (pt.x < polygon.bbox.x[0] || pt.x > polygon.bbox.x[1] ||
        pt.y < polygon.bbox.y[1] || pt.y > polygon.bbox.y[1]) {
      return false;
    }
  }

  // ... 
}
```
이 코드는 잘 동작하지만(타입 체크도 통과) 반복되는 부분이 존재합니다 특히 polygon.bbox는 3줄에 걸쳐 5번이나 등장합니다.

다음 코드는 중복을 줄이기 위해 임시 변수를 뽑아낸 모습입니다.

```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  polygon.bbox  // 타입이 BoundingBox | undefined
  const box = polygon.bbox;
  box  // 타입이 BoundingBox | undefined
  if (polygon.bbox) {
    polygon.bbox  // 타입이 BoundingBox
    box  // 타입이 BoundingBox | undefined
    if (pt.x < box.x[0] || pt.x > box.x[1] || // error:
        //     ~~~                ~~~  Object is possibly 'undefined'
        pt.y < box.y[1] || pt.y > box.y[1]) { // error:
        //     ~~~                ~~~  Object is possibly 'undefined'
      return false;
    }
  }
  // ...
}
```
그리고 box 와 bbox는 같은 값인데 다른 이름을 사용한 것입니다.

객체 비구조화를 이용하면 보다 간결한 문법으로 일관된 이름을 사용할 수 있습니다.

```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const {bbox} = polygon;
  if (bbox) {
    const {x, y} = bbox;
    if (pt.x < x[0] || pt.x > x[1] ||
        pt.y < x[0] || pt.y > y[1]) {
      return false;
    }
  }
  // ...
}
```

그러나 객체 비구조화를 이용할 때는 두 가지를 주의해야 합니다.
- 전체 bbox 속성이 아니라 x와 y가 선택적 속성일 경우에 속성 체크가 더 필요합니다. 따라서 타입의 경계에 null 값을 추가하는 것이 좋습니다(아이템 31).
- bbox에는 선택적 속성이 적합했지만 holes는 그렇지 않습니다. holes가 선택적이라면, 값이 없거나 빈 배열([])이었을 겁니다. 차이가 없는데 이름을 구별한 것입니다. 빈 배열은 'holes 없음'을 나타내는 좋은 방법입니다.

별칭은 타입 체커뿐만 아니라 런타임에도 혼동을 야기할 수 있습니다.

```typescript
const {bbox} = polygon;
if (!bbox) {
  calculatePolygonBbox(polygon);  // polygon.bbox가 채워집니다.
  // 이제 polygon.bbox와 bbox 는 다른 값을 참조합니다!
}
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 25. 비동기 코드에는 콜백 대신 async 함수 사용하기

과거의 자바스크립트에서는 비동기 동작을 모델링하기 위해 콜백을 사용했습니다.

그렇기 때문에 악명 높은 '콜백 지옥(callback hell)'을 필연적으로 마주할 수 밖에 없었습니다.

```javascript
fetchURL(url1, function(response1) {
  fetchURL(url2, function(response2) {
    fetchURL(url3, function(response3) {
      // ...
      console.log(1);
    });
    console.log(2);
  });
  console.log(3);
});
console.log(4);

// 로그:
// 4
// 3
// 2
// 1
```

로그에서 보면 알 수 있듯이, 실행의 순서는 코드의 순서와 반대입니다. 이러한 콜백이 중첩된 코드는 직관적으로 이해하기 어렵습니다.

ES2015는 콜백 지옥을 극복하기 위해 프로미스(promise) 개념을 도입했습니다.

프로미스를 사용해 앞의 코드를 수정한 것입니다.
```javascript
const page1Promise = fetch(url1);
page1Promise.then(response1 => {
  return fetch(url2);
}).then(response2 => {
  return fetch(url3);
}).then(response3 => {
  // ...
}).catch(error => {
  // ...
});
```
ES2017에서는 async와 await 키워드를 도입하여 콜백 지옥을 더욱 간단하게 처리할 수 있게 되었습니다.

```javascript
async function fetchPages() {
  try {
    const response1 = await fetch(url1);
    const response2 = await fetch(url2);
    const response3 = await fetch(url3);
    // ...
  } catch (e) {
    // ...
  }
}
```

콜백보다는 프로미스나 async/await를 사용해야 하는 이유는 다음과 같습니다.

- 콜백보다는 프로미스가 코드를 작성하기 쉽습니다.
- 콜백보다는 프로미스가 타입을 추론하기 쉽습니다.

예를 들어, 병렬로 페이지를 로드하고 싶다면 Promise.all을 사용해서 프로미스를 조합하면 됩니다.

```javascript
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1), fetch(url2), fetch(url3)
  ]);
  // ...
}
```

이런 경우는 await와 구조 분해 할당이 찰떡궁합입니다.

한편 입력된 프로미스들 중 첫 번째가 처리될 때 완료되는 Promise.race도 타입 추론과 잘 맞습니다. 

Promise.race를 사용하여 프로미스에 타임아웃을 추가하는 방법은 흔하게 사용되는 패턴입니다.

```typescript
function timeout(millis: number): Promise<never> {
  return new Promise((resolve, reject) => {
     setTimeout(() => reject('timeout'), millis);
  });
}

async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}
```

타입 구문이 없어도 fetchWithTimeout의 반환 타입은 Promise\<Response>로 추론됩니다.

가끔 프로미스를 직접 생성해야 할 때, 특히 setTimeout과 같은 콜백 API를 래핑할 경우가 있습니다.

그러나 선택의 여지가 있다면 일반적으로는 프로미스를 생성하기보다는 async/await를 사용해야 합니다.

그 이유는
- 일반적으로 더 간결하고 직관적인 코드가 됩니다.
- async 함수는 항상 프로미스를 반환하도록 강제됩니다.

```typescript
// function getNumber(): Promise<number>
async function getNumber() {
  return 42;
}
const getNumber = async () => 42;  // 타입이 () => Promise<number>
const getNumber = () => Promise.resolve(42);  // 타입이 () => Promise<number>
```

함수는 항상 동기 또는 비동기로 실행되어야 하며 절대 혼용해서는 안 됩니다.

**잘못된 예**

```typescript
const _cache: {[url: string]: string} = {};
function fetchWithCache(url: string, callback: (text: string) => void) {
  if (url in _cache) {
    callback(_cache[url]);
  } else {
    fetchURL(url, text => {
      _cache[url] = text;
      callback(text);
    });
  }
}
```

코드가 최적화된 것처럼 보일지 몰라도, 캐시된 경우 콜백함수가 동기로 호출되기 때문에 fetchWithCache 함수는 이제 사용하기가 무척 어려워집니다.

**일관적인 동작 강제 코드**
```typescript
const _cache: {[url: string]: string} = {};
async function fetchWithCache(url: string) {
  if (url in _cache) {
    return _cache[url];
  }
  const response = await fetch(url);
  const text = await response.text();
  _cache[url] = text;
  return text;
}

let requestStatus: 'loading' | 'success' | 'error';
async function getUser(userId: string) {
  requestStatus = 'loading';
  const profile = await fetchWithCache(`/user/${userId}`);
  requestStatus = 'success';
}
```

콜백이나 프로미스를 사용하면 실수로 반(half)동기 코드를 작성할 수 있지만, async를 사용하면 항상 비동기 코드를 작성하는 셈입니다.

async 함수에서 프로미스를 반환하면 또 다른 프로미스로 래핑되지 않습니다.

반환 타입은 Promise\<Promise\<T>>가 아닌 Promise\<T>가 됩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 26. 타입 추론에 문맥이 어떻게 사용되는지 이해하기

타입스크립트는 타입을 추론할 때 단순히 값만 고려하지는 않습니다.

값이 존재하는 곳의 문맥까지도 살핍니다.

```typescript
function setLanguage(language: string) { /* ... */ }
setLanguage('JavaScript');  // 정상

let language = 'JavaScript';
setLanguage(language);  // 정상

---
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) { /* ... */ }
setLanguage('JavaScript');  // 정상

let language = 'JavaScript';
setLanguage(language); // error :
// Argument of type 'string' is not assignable to parameter of type 'Language'.
```

인라인(inline) 형태에서 타입스크립트는 함수 선언을 통해 매개변수가 Language 타입이어야 한다는 것을 알고 있습니다. 해당 타입에 문자열 리터럴 'JavaScript'는 할당 가능하므로 정상입니다.

그러나 이 값을 변수로 분리해 내면, 타입스크립트는 할당 시점에 타입을 추론합니다.

이번 경우는 string으로 추론했고, Language 타입으로 할당이 불가능하므로 오류가 발생했습니다.

위 문제를 해결하는 두 가지 방법

- 첫 번째 해법은 타입 선언에서 language의 가능한 값을 제한하는 것입니다.
```typescript
let language: Language = 'JavaScript';
setLanguage(language);  // 정상
```
- 두 번째 해법은 language를 상수로 만드는 것입니다.
```typescript
const language = 'JavaScript';
setLanguage(language);  // 정상
```

#### 튜플 사용 시 주의점
문자열 리터럴 타입과 마찬가지로 튜플 타입에서도 문제가 발생합니다.

```typescript
// 매개변수는 (latitude, longitude) 쌍입니다.
function panTo(where: [number, number]) { /* ... */ }
panTo([10, 20]);  // 정상

const loc = [10, 20]; // Type loc = number[]으로 추론됩니다.
panTo(loc); // error:
// Argument of type 'number[]' is not assignable to parameter of type '[number, number]'.
// Target requires 2 element(s) but source may have fewer.
```

타입스크립트가 의도를 정확히 파악할 수 있도록 타입 선언을 제공하는 방법을 시도해 보겠습니다.

```typescript
const loc: [number, number] = [10, 20];
panTo(loc); // 정상
```
```typescript
function panTo(where: [number, number]) { /* ... */ }
const loc = [10, 20] as const;
panTo(loc); // error:
// Readonly [10, 20]' is not assignable to parameter of type '[number, number]'.
// The type 'readonly [10, 20]' is 'readonly' and cannot be assigned to the mutable type '[number, number]'.

// as const는 그 값이 내부까지 상수라는 사실을 타입스크립트에게 알려 줍니다.

function panTo(where: readonly [number, number]) { /* ... */ }
const loc = [10, 20] as const;
panTo(loc);  // 정상
```

as const의 한 가지 단점은, 만약 타입 정의에 실수가 있다면(예를 들어, 튜플에 세 번째 요소를 추가한다면) 오류는 타입 정의가 아니라 호출되는 곳에서 발생한다는 것입니다.

특히 여러 겹 중첩된 객체에서 오류가 발생한다면 근본적인 원인을 파악하기 어렵습니다.

```typescript
function panTo(where: readonly [number, number]) { /* ... */ }
const loc = [10, 20, 30] as const;  // 실제 오류는 여기서 발생합니다.
panTo(loc); // error:
// Argument of type 'readonly [10, 20, 30]' is not assignable to
// parameter of type 'readonly [number, number]'
// Types of property 'length' are incompatible
// Type '3' is not assignable to type '2'
```

#### 객체 사용 시 주의점

```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';
interface GovernedLanguage {
  language: Language;
  organization: string;
}

function complain(language: GovernedLanguage) { /* ... */ }

complain({ language: 'TypeScript', organization: 'Microsoft' });  // OK

const ts = {
  language: 'TypeScript', // string으로 추론됩니다.
  organization: 'Microsoft',
};
complain(ts); // error:
// Argument of type '{ language: string; organization: string; }' is not assignable to parameter of type 'GovernedLanguage'.
// Types of property 'language' are incompatible.
// Type 'string' is not assignable to type 'Language'.
```
ts 객체에서 language의 타입은 string으로 추론됩니다. 

이 문제는 타입 선언을 추가하거나 `const ts: GovernedLanguage = ...` 상수 단언 `as const`을 사용해 해결합니다([아이템 9](#아이템-9-타입-단언보다는-타입-선언을-사용하기)).

#### 콜백 사용 시 주의점

콜백을 다른 함수로 전달할 때, 타입스크립트는 콜백의 매개변수 타입을 추론하기 위해 문맥을 사용합니다.

```typescript
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
  fn(Math.random(), Math.random());
}

callWithRandomNumbers((a, b) => {
  a;  // 타입이 number
  b;  // 타입이 number
  console.log(a + b);
});

const fn = (a, b) => { // error:
         // Parameter 'a' implicitly has an 'any' type
         // Parameter 'b' implicitly has an 'any' type
  console.log(a + b);
}

// 이 경우 매개변수에 타입 구문을 추가해서 해결할 수 있습니다.
const fn = (a: number, b: number) => {
  console.log(a + b);
}
```

> 변수를 뽑아서 별도로 선언했을 때 오류가 발생한다면 타입 선언을 추가해야 합니다.
> 
> 변수가 정말로 상수라면 상수 단언(as const)을 사용해야 합니다. 그러나 상수 단언을 사용하면 정의한 곳이 아니라 사용한 곳에서 오류가 발생하므로 주의해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 27. 함수형 기법과 라이브러리로 타입 흐름 유지하기

타입 흐름을 개선하고, 가독성을 높이고, 명시적인 타입 구문의 필요성을 줄이기 위해 직접 구현하기보다는 내장된 함수형 기법과 로대시(lodash)같은 유틸리티 라이브러리르 사용하는 것이 좋습니다.

allPlayers를 가지고 각 팀별로 연봉 순으로 정렬해서 최고 연봉 선수의 명단을 만든다고 가정해 보겠습니다.

**로대시 없는 방법**
```typescript
// 함수형 기법을 쓰지 않은 부분은 타입구문이 필요합니다.
interface BasketballPlayer {
  name: string;
  team: string;
  salary: number;
}
const teamToPlayers: {[team: string]: BasketballPlayer[]} = {};
for (const player of allPlayers) {
  const {team} = player;
  teamToPlayers[team] = teamToPlayers[team] || [];
  teamToPlayers[team].push(player);
}

for (const players of Object.values(teamToPlayers)) {
  players.sort((a, b) => b.salary - a.salary);
}

const bestPaid = Object.values(teamToPlayers).map(players => players[0]);
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary);
console.log(bestPaid);
```

**로대시를 사용해서 동일한 작업을 하는 코드**
```typescript
const bestPaid = _(allPlayers)
  .groupBy(player => player.team)
  .mapValues(players => _.maxBy(players, p => p.salary)!)
  .values()
  .sortBy(p => -p.salary)
  .value()  // 타입은 BasketballPlayer[]
```

**[⬆ 상단으로](#목차)**

<br>

## 4. 타입 설계

타입 시스템의 큰 장점 중 하나는 데이터 타입을 명확히 알 수 있어 코드를 이해하기 쉽다는 것입니다.

### 아이템 28. 유효한 상태만 표현하는 타입을 지향하기

타입을 잘 설계하면 코드는 직관적으로 작성할 수 있습니다.

효과적으로 타입을 설계하려면, 유효한 상태만 표현할 수 있는 타입을 만들어 내는 것이 가장 중요합니다.

이 아이템은 이런 관점에서 타입 설계가 잘못된 상황을 알아보고, 예제를 통해 잘못된 설계를 바로잡아 볼 것입니다.

웹 애플리케이션을 만든다고 가정하고, 페이지의 상태는 다음처럼 설계했습니다.

```typescript
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}
// 페이지를 그리는 renderPage 함수를 작성할 때는 상태 객체의 필드를 전부 고려해서 상태 표시를 분기해야 합니다.
function renderPage(state: State) {
  if (state.error) {
    return `Error! Unable to load ${currentPage}: ${state.error}`;
  } else if (state.isLoading) {
    return `Loading ${currentPage}...`;
  }
  return `<h1>${currentPage}</h1>\n${state.pageText}`;
}
```
코드를 살펴보면 분기 조건이 명확히 분리되어 있지 않다는 것을 알 수 있습니다.

isLoading이 true이고 동시에 error 값이 존재하면 로딩 중인 상태인지 오류가 발생한 상태인지 명확히 구분할 수 없습니다.

한편 페이지를 전환하는 changePage 함수는 다음과 같습니다.
```typescript
async function changePage(state: State, newPage: string) {
  state.isLoading = true;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
    }
    const text = await response.text();
    state.isLoading = false;
    state.pageText = text;
  } catch (e) {
    state.error = '' + e;
  }
}
```
changePage에는 많은 문제점이 있습니다.
- 오류가 발생했을 때, state.isLoading을 false로 설정하는 로직이 빠져 있습니다.
- state.error를 초기화하지 않았기 때문에, 로딩 메세지 대신 과거 오류 메시지를 보여줍니다.
- 페이지 로딩 중에 사용자가 페이지를 바꿔 버리면 어떤 일이 벌어질지 예상하기 어렵습니다.

문제는 바로 상태 값의 두 가지 속성이 동시에 정보가 부족하거나(요청이 실패한 것인지 여전히 로딩 중인지), 두 가지 속성이 충돌(오류이면서 동시에 로딩 중일 수)할 수 있다는 것입니다.

다음은 애플리케이션의 상태를 좀 더 제대로 표현한 방법입니다.

``` typescript
interface RequestPending {
  state: 'pending';
}
interface RequestError {
  state: 'error';
  error: string;
}
interface RequestSuccess {
  state: 'ok';
  pageText: string;
}
type RequestState = RequestPending | RequestError | RequestSuccess;

interface State {
  currentPage: string;
  requests: {[page: string]: RequestState};
}
```
상태를 나타내는 타입의 코드 길이가 서너 배 길어지긴 했지만, 무효한 상태를 허용하지 않도록 크게 개선되었습니다.

그 결과로 개선된 renderPage와 changePage 함수는 쉽게 구현할 수 있습니다.

```typescript
function renderPage(state: State) {
  const {currentPage} = state;
  const requestState = state.requests[currentPage];
  switch (requestState.state) {
    case 'pending':
      return `Loading ${currentPage}...`;
    case 'error':
      return `Error! Unable to load ${currentPage}: ${requestState.error}`;
    case 'ok':
      return `<h1>${currentPage}</h1>\n${requestState.pageText}`;
  }
}

async function changePage(state: State, newPage: string) {
  state.requests[newPage] = {state: 'pending'};
  state.currentPage = newPage;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
    }
    const pageText = await response.text();
    state.requests[newPage] = {state: 'ok', pageText};
  } catch (e) {
    state.requests[newPage] = {state: 'error', error: '' + e};
  }
}
```

> 유효한 상태와 무효한 상태를 둘 다 표현하는 타입은 혼란을 초래하기 쉽고 오류를 유발하게 됩니다.
> 
> 유효한 상태만 표현하는 타입을 지향해야 합니다. 코드가 길어지거나 표현하기 어렵지만 결국은 시간을 절약하고 고틍을 줄일 수 있습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

아이템 29의 제목은 TCP와 관련해서 존 포스텔이 쓴 견고성 원칙(robustness principle) 또는 포스텔의 법칙(Postel's Law)에서 따왔습니다.

> TCP 구현체는 견고성의 일반적 원칙을 따라야 한다. 당신의 작업은 엄격하게 하고, 다른 사람의 작업은 너그럽게 받아들여야 한다.

다양한 타입을 허용해야만 하는 라이브러리의 타입 선언을 작성하고 있다면, 어쩔 수 없이 다양한 타입을 허용해야 하는 경우가 생깁니다.

하지만 그때도 매우 자유로운 타입은 나쁜 설계라는 사실을 잊어서는 안됩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 30. 문서에 타입 정보를 쓰지 않기

다음 코드에서 잘못된 부분을 찾아보겠습니다.

```typescript
/* 
  전경색(foreground) 문자열을 반환합니다.
  0 개 또는 1개의 매개변수를 받습니다.
  매개변수가 없을 때는 표준 전경색을 반환합니다.
*/
function getForegroundColor(page?: string) {
  return page === 'login' ? {r: 127, g: 127, b: 127} : {r: 0, g: 0, b: 0};
}
```

코드와 주석의 정보가 맞지 않습니다.

의도된 동작이 코드에 제대로 반영되고 있다고 가정하면, 주석에는 세 가지 문제점이 있습니다.

- 함수가 string 형태의 색깔을 반환한다고 적혀 있지만 실제로는 {r, g, b}객체를 반환합니다.
- 주석에는 함수가 0개 또는 1개의 매개변수를 받는다고 설명하고 있지만, 타입 시그니처만 보아도 명확하게 알 수 있는 정보입니다.
- 불필요하게 장황합니다. 함수 선언과 구현체보다 주석이 더 깁니다.

타입스크립트의 타입 구문 시스템은 간결하고, 구체적이며, 쉽게 읽을 수 있도록 설계되었습니다.

함수의 입력과 출력의 타입을 코드로 표현하는 것이 주석보다 더 나은 방법이라는 것은 자명합니다.

주석 대신 타입 정보를 작성한다면 코드가 변경된다 하더라도 정보가 정확히 동기화됩니다.

```typescript
/** nums를 변경하지 않습니다. */
function sort(nums: number[]) { /* ... */ }

// 대신 readonly로 선언하여(아이템 17) 타입스크립트가 규칙을 강제할 수 있게 하면 됩니다.
function sort(nums: readonly number[]) { /* ... */ }
```

주석에 적용한 규칙은 변수명에도 그대로 적용할 수 있습니다. 변수명에 타입 정보를 넣지 않도록 합니다.

예를 들어 변수명을 ageNum으로 하는 것보다는 age로 하고, 그 타입이 number임을 명시하는 게 좋습니다.

그러나 단위가 있는 숫자들은 예외입니다. 단위가 무엇인지 확실하지 않다면 변수명 또는 속성 이름에 단위를 포함할 수 있습니다.

예를 들어 timeMs는 time보다 훨씬 명확하고 temperatureC는 temperature보다 훨씬 명확합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 31. 타입 주변에 null 값 배치하기

값이 전부 null이거나 전부 null이 아닌 경우로 분명히 구분된다면, 값이 섞여 있을 때보다 다루기 쉽습니다.

null과 null이 아닌 값을 섞어서 사용하면 클래스에서도 문제가 생깁니다.

```typescript
interface UserInfo { name: string }
interface Post { post: string }
declare function fetchUser(userId: string): Promise<UserInfo>;
declare function fetchPostsForUser(userId: string): Promise<Post[]>;
class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;

  constructor() {
    this.user = null;
    this.posts = null;
  }

  async init(userId: string) {
    return Promise.all([
      async () => this.user = await fetchUser(userId),
      async () => this.posts = await fetchPostsForUser(userId)
    ]);
  }

  getUserName() {
    // ...?
  }
}
```

두 번의 네트워크 요청이 로드되는 동안 user와 posts 속성은 null 상태입니다.

어떤 시점에는 둘 다 null이거나, 둘 중 하나만 null이거나, 둘 다 null이 아닐 것입니다. (총 4가지)

**개선된 설계**
```typescript
class UserPosts {
  user: UserInfo;
  posts: Post[];

  constructor(user: UserInfo, posts: Post[]) {
    this.user = user;
    this.posts = posts;
  }

  static async init(userId: string): Promise<UserPosts> {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPostsForUser(userId)
    ]);
    return new UserPosts(user, posts);
  }

  getUserName() {
    return this.user.name;
  }
}
```

이제 UserPosts 클래스는 완전히 null이 아니게 되었고, 메서드를 작성하기 쉬워졌습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 32. 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기

유니온 타입의 속성을 가지는 인터페이스를 작성 중이라면, 혹시 인터페이스의 유니온 타입을 사용하는 게 더 알맞지는 않을지 검토해 봐야 합니다.

벡터를 그리는 프로그램을 작성 중이고, 특정한 기하학적(geometry) 타입을 가지는 계층의 인터페이스를 정의한다고 가정해 보겠습니다.

```typescript
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
// layout이 LineLayout 타입이면서 paint 속성이 FillPaint 타입인 것은 말이 되지 않습니다.

// 더 나은 모델링하려면 각각 타입의 계층을 분리된 인터페이스로 둬야 합니다.
interface FillLayer {
  layout: FillLayout;
  paint: FillPaint;
}
interface LineLayer {
  layout: LineLayout;
  paint: LinePaint;
}
interface PointLayer {
  layout: PointLayout;
  paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;
```
이런 형태로 Layer를 정의하면 layout과 paint 속성이 잘못된 조합으로 섞이는 경우를 방지할 수 있습니다.

이러한 패턴의 가장 일반적인 예시는 태그된 유니온(or 구분된 유니온)입니다.

Layer의 경우 속성 중의 하나는 문자열 리터럴 타입의 유니온이 됩니다.

```typescript
interface Layer {
  type: 'fill' | 'line' | 'point';
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
```

하지만, type: 'fill'과 함께 LineLayout과 PointPaint 타입이 쓰이는 것은 말이 되지 않습니다. 

이러한 경우를 방지하기 위해 Layer를 인터페이스의 유니온으로 변환해 보겠습니다.

```typescript
interface FillLayer {
  type: 'fill';
  layout: FillLayout;
  paint: FillPaint;
}
interface LineLayer {
  type: 'line';
  layout: LineLayout;
  paint: LinePaint;
}
interface PointLayer {
  type: 'paint';
  layout: PointLayout;
  paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;

// 이제 type별로 layout과 paint를 뽑아서 쓸 수 있습니다.
```

<br>

```typescript
interface Person {
  name: string;
  // 다음은 둘 다 동시에 있거나 동시에 없습니다.
  placeOfBirth?: string;
  dateOfBirth?: Date;
}
```

타입 정보를 담고 있는 주석은 문제가 될 소지가 매우 높습니다([아이템 30](#아이템-30-문서에-타입-정보를-쓰지-않기)).

placeOfBirth와 dateOfBirth 필드는 실제로 관련되어 있지만, 타입 정보에는 어떠한 관계도 표현되지 않았습니다.

두 개의 속성을 하나의 객체로 모으는 것이 더 나은 설계입니다.

```typescript
interface Person {
  name: string;
  birth?: {
    place: string;
    date: Date;
  }
}
const alanT: Person = {
  name: 'Alan Turing',
  birth: { // error: 
// Property 'date' is missing in type '{ place: string; }' but required in type '{ place: string; date: Date; }'.ts(2741)
    place: 'London'
  }
}
```

> 유니온의 인터페이스보다 인터페이스의 유니온이 더 정확하고 타입스크립트가 이해하기도 좋습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 33. string 타입보다 더 구체적인 타입 사용하기

string 타입의 범위는 매우 넓습니다. 'x'나 'y'같은 한 글자도, '모비딕'(Moby Dick, "Call me ..."로 시작하는 약 120만 글자의 소설)의 전체 내용도 string 타입입니다.

string타입으로 변수를 선언하려 한다면, 혹시 그보다 더 좁은 타입이 적절하지는 않을지 검토해 보아야 합니다.

```typescript
interface Album {
  artist: string;
  title: string;
  releaseDate: string;  // YYYY-MM-DD
  recordingType: string;  // 예를 들어, "live" or "studio"
}

// 다음 예시처럼 Album 타입에 엉뚱한 값을 설정할 수 있습니다.
const kindOfBlue: Album = {
  artist: 'Miles Davis',
  title: 'Kind of Blue',
  releaseDate: 'August 17th, 1959',  // 날짜 형식이 다릅니다.
  recordingType: 'Studio',  // 오타(대문자 S)
};  // 정상
```

또한 string 타입의 범위가 넓기 때문에 제대로 된 Album 객체를 사용하더라도 매개변수 순서가 잘못된 것이 오류로 드러나지 않습니다.

```typescript
function recordRelease(title: string, date: string) { /* ... */ }
recordRelease(kindOfBlue.releaseDate, kindOfBlue.title);  // 정상, 오류여야 함!
```

앞의 예제처럼 string 타입이 남용된 코드를 '**문자열을 남발하여 선언되었다(stringly typed)**'고 표현하기도 합니다.

**타입의 범위를 좁히는 방법**
```typescript
type RecordingType = 'studio' | 'live';

interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  recordingType: RecordingType;
}
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 34. 부정확한 타입보다는 미완성 타입을 사용하기

GeoJSON 형식의 타입 선언을 작성한다고 가정해 보겠습니다.

GeoJSON 정보는 각각 다른 형태의 좌표 배열을 가지는 몇 가지 타입 중 하나가 될 수 있습니다.
```typescript
interface Point {
  type: 'Point';
  coordinates: number[];
}
interface LineString {
  type: 'LineString';
  coordinates: number[][];
}
interface Polygon {
  type: 'Polygon';
  coordinates: number[][][];
}
type Geometry = Point | LineString | Polygon;  // 다른 것들도 추가될 수 있습니다.
```

큰 문제는 없지만 좌표에 쓰이는 number[]가 약간 추상적입니다. 여기서 number[]는 경도와 위도를 나타내므로 튜플 타입으로 선언하는 게 낫습니다.

```typescript
type GeoPosition = [number, number];
interface Point {
  type: 'Point';
  coordinates: GeoPosition;
}
// ...
```

> 타입 안정성에서 불쾌한 골짜기는 피해야 합니다.
> 
> 타입이 없는 것보다 잘못된 게 더 나쁩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 35. 데이터가 아닌, API와 명세를 보고 타입 만들기

잘 설계된 타입은 타입스크립트 사용을 즐겁게 해 주는 반면, 잘못 설계된 타입은 비극을 불러옵니다.

이러한 양면성 때문에 타입 설계를 잘 해야 한다는 압박감이 느껴질 수 있습니가.

파일 형식, API, 명세(specification) 등 우리가 다루는 타입 중 최소한 몇 개는 프로젝트 외부에서 비롯된 것입니다.

그래서 이미 타입스크립트 타입 선언이 존재한다면, `npm install --save-dev @types/...` 등 익숙한 방법을 이용해 추가할 수 있습니다.

만약 명세 정보나 공식 스키마가 없다면 데이터로부터 타입을 생성해야 합니다.

이를 위해 [quicktype](https://quicktype.io/) 같은 도구를 사용할 수 있습니다.

그러나 생성된 타입이 실제 데이터와 일치하지 않을 수 있다는 점을 주의해야 합니다.

> 코드의 구석 구석까지 타입 안정성을 얻기 위해 API 또는 데이터 형식에 대한 타입 생성을 고려해야 합니다.
> 
> 데이터에 드러나지 않는 예외적인 경우들이 문제가 될 수 있기 때문에 데이터보다는 명세로부터 코드를 생성하는 것이 좋습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 36. 해당 분야의 용어로 타입 이름 짓기

엄선된 타입, 속성, 변수의 이름은 의도를 명확히 하고 코드와 타입의 추상화 수준을 높여 줍니다.

잘못 선택한 타입 이름은 코드의 의도를 왜곡하고 잘못된 개념을 심어 주게 됩니다.

동물들의 데이터베이스를 구축한다고 가정해 보겠습니다.
```typescript
interface Animal {
  name: string;
  endangered: boolean;
  habitat: string;
}
const leopard: Animal = {
  name: 'Snow Leopard',
  endangered: false,
  habitat: 'tundra',
};
```
이 코드에는 네 가지 문제가 있습니다.
- name은 매우 일반적인 용어입니다.
- endangered 속성이 멸종 위기를 표현하기 위해 boolean 타입을 사용한 것이 이상합니다. 이미 멸종된 동물을 true나 false로 해야 하는지 판단할 수 없습니다. 또, 멸종 위기인지 멸종인지 애매합니다.
- 서식지를 나타내는 habitat 속성은 너무 범위가 넓은 string 타입([아이템 33](#아이템-33-string-타입보다-더-구체적인-타입-사용하기))일 뿐만 아니라 서식지라는 뜻 자체도 불분명하기 때문에 모호합니다.
- 객체의 변수명이 leopard이지만, name 속성의 값은 'Snow Leopard'입니다. 객체의 이름과 속성의 name이 다른 의도로 사용된 것인지 불문명합니다.

**개선된, 명확한 코드**
```typescript
interface Animal {
  commonName: string;
  genus: string;
  species: string;
  status: ConservationStatus;
  climates: KoppenClimate[];
}
type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
type KoppenClimate = |
  'Af' | 'Am' | 'As' | 'Aw' |
  'BSh' | 'BSk' | 'BWh' | 'BWk' |
  'Cfa' | 'Cfb' | 'Cfc' | 'Csa' | 'Csb' | 'Csc' | 'Cwa' | 'Cwb' | 'Cwc' |
  'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' |
  'Dsa' | 'Dsb' | 'Dsc' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' |
  'EF' | 'ET';
const snowLeopard: Animal = {
  commonName: 'Snow Leopard',
  genus: 'Panthera',
  species: 'Uncia',
  status: 'VU',  // vulnerable
  climates: ['ET', 'EF', 'Dfd'],  // alpine or subalpine
};
```

타입, 속성, 변수에 이름을 붙일 때 명심해야 할 세 가지 규칙이 있습니다.
- 동일한 의미를 나타낼 때는 같은 용어를 사용해야 합니다.
- data, info, thing, item, object, entity 같은 모호하고 의미 없는 이름은 피해야 합니다. 만약 entity라는 용어가 해당 분야에서 특별한 의미를 가진다면 괜찮습니다.
- 이름을 지을 때는 포함된 내용이나 계산 방식이 아니라 데이터 자체가 무엇인지를 고려해야 합니다. 예를 들어, INodeList보다는 Directory가 더 의미 있는 이름입니다. Directory는 구현의 측면이 아니라 개념적인 측면에서 디렉터리를 생각하게 합니다.

> 가독성을 높이고, 추상화 수준을 올리기 위해서 해당 분야의 용어를 사용해야 합니다.
> 
> 같은 의미에 다른 이름을 붙이면 안 됩니다. 특별한 의미가 있을 때만 용어를 구분해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 37. 공식 명칭에는 상표를 붙이기

구조적 타이핑([아이템 4](#아이템-4-구조적-타이핑에-익숙해지기))의 특성 때문에 가끔 코드가 이상한 결과를 낼 수 있습니다.

```typescript
interface Vector2D {
  x: number;
  y: number;
}
function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm({x: 3, y: 4});  // 정상, 결과는 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D);  // 정상, 결과는 동일하게 5
```

이 코드는 구조적 타이핑 관점에서는 문제가 없기는 하지만, 수학적으로 따지면 2차원 벡터를 사용해야 이치에 맞습니다.

calculateNorm 함수가 3차원 벡터를 허용하지 않게 하려면 공식 명칭(nominal typing)을 사용하면 됩니다.

공식 명칭 개념을 타입스크립트에서 흉내 내려면 '상표(brand)'를 붙이면 됩니다(비유를 들자면 스타벅스가 아니라 커피).

```typescript
interface Vector2D {
  _brand: '2d';
  x: number;
  y: number;
}
function vec2D(x: number, y: number): Vector2D {
  return {x, y, _brand: '2d'};
}
function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);  // 기존과 동일합니다.
}

calculateNorm(vec2D(3, 4)); // 정상, 5를 반환합니다.
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D); // error: 
// Argument of type '{ x: number; y: number; z: number; }' is not assignable to parameter of type 'Vector2D'.
// Property '_brand' is missing in type '{ x: number; y: number; z: number; }' but required in type 'Vector2D'.
```

<br>

```typescript
type Meters = number & {_brand: 'meters'};
type Seconds = number & {_brand: 'seconds'};

const meters = (m: number) => m as Meters;
const seconds = (s: number) => s as Seconds;

const oneKm = meters(1000);  // 타입은 Meters
const oneMin = seconds(60);  // 타입은 Seconds
const tenKm = oneKm * 10;  // 타입은 number
const v = oneKm / oneMin;  // 타입은 number
```

number 타입에 상표를 붙여도 산술연산 후에는 상표가 없어지기 때문에 실제로 사용하기에는 무리가 있습니다.

그러나 코드에 여러 단위가 혼합된 많은 수의 숫자가 들어 있는 경우, 숫자의 단위를 문서화하는 괜찮은 방법일 수 있습니다.

> 타입스크립트는 구조적 타이핑(덕 타이핑)을 사용하기 때문에, 값을 세밀하게 구분하지 못하는 경우가 있습니다.
> 
> 상표 기법은 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있습니다.


## 5. any 다루기
전통적으로 프로그래밍 언어들의 타입 시스템은 완전히 정적이거나 완전히 동적으로 확실히 구분되어 있었습니다.

그러나 타입스크립트의 타입 시스템은 선택적(optional)이고 점진적(gradual)이기 때문에 정적이면서도 동적인 특성을 동시에 가집니다.

- 따라서 타입스크립트는 프로그램의 일부분에만 타입 시스템을 적용할 수 있습니다.

프로그램의 일부분에만 타입 시스템을 적용할 수 있다는 특성 덕분에 점진적인 마이그레이션(자바스크립트 코드를 타입스크립트로 전환)이 가능합니다([아이템 8](#아이템-8-타입-공간과-값-공간의-심벌-구분하기)).

마이그레이션을 할 때 코드의 일부분에 타입 체크를 비활성화시켜주는 any 타입이 중요한 역할을 합니다.

또한 any를 현명하게 사용하는 방법을 익혀야만 효과적인 타입스크립트 코드를 작성할 수 있습니다.


### 아이템 38. any 타입은 가능한 한 좁은 범위에서만 사용하기

```typescript
interface Foo { foo: string; }
interface Bar { bar: string; }
declare function expressionReturningFoo(): Foo;
function processBar(b: Bar) { /* ... */ }

function f() {
  const x = expressionReturningFoo();
  processBar(x); // error:
// Argument of type 'Foo' is not assignable to parameter of type 'Bar'.
// Property 'bar' is missing in type 'Foo' but required in type 'Bar'.
}
```

문맥상으로 x라는 변수가 동시에 Foo 타입과 Bar 타입에 할당 가능하다면, 오류를 제거하는 방법은 두 가지입니다.

```typescript
function f1() {
  const x: any = expressionReturningFoo();  // 이렇게 하지 맙시다.
  processBar(x);
}

function f2() {
  const x = expressionReturningFoo();
  processBar(x as any);  // 이게 낫습니다.
}
```
두 가지 해결책 중에서 f1에 사용된 x: any보다 f2에 사용된 x as any 형태가 권장됩니다.

그 이유는 any 타입이 processBar 함수의 매개변수에서만 사용된 표현식이므로 다른 코드에는 영향을 미치지 않기 때문입니다.

f1에서는 함수의 마지막까지 x의 타입이 any인 반면, f2에서는 processBar 호출 이후에 x가 그대로 Foo 타입입니다.

**만일 f1 함수가 x를 반환한다면**
```typescript
function f1() {
  const x: any = expressionReturningFoo();
  processBar(x);
  return x;
}

function g() {
  const foo = f1();  // 타입은 any
  foo.fooMethod();  // 이 함수 호출은 체크되지 않습니다.
}
```

#### 객체와 관련한 any의 사용법

```typescript
interface Config {
  a: number;
  b: number;
  c: {
    key: Foo;
  };
}
declare const value: Bar;
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value
 // Property 'foo' is missing in type 'Bar' but required in type 'Foo'.
  }
};
```

단순히 생각하면 config 객체 전체를 as any로 선언해서 오류를 제거할 수 있습니다.
```typescript
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value
  }
} as any;  // 이렇게 하지 맙시다!

const config: Config = {
  a: 1,
  b: 2,  // 이 속성은 여전히 체크 됩니다.
  c: {
    key: value as any
  }
};
```

> 의도치 않은 타입 안정성의 손실을 피하기 위해서 any의 사용 범위를 최소한으로 좁혀야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 39. any를 구체적으로 변형해서 사용하기

any는 자바스크립트에서 표현할 수 있는 모든 값을 아우르는 매우 큰 범위의 타입입니다.

any 타입에는 모든 숫자, 문자열, 배열, 객체, 정규식, 함수, 클래스, DOM 앨리먼트는 물론 null과 undefined까지도 포함됩니다.

반대로 말하면, 일반적인 상황에서는 any보다 더 구체적으로 표현할 수 있는 타입이 존재하 가능성이 높기 때문에 더 구체적인 타입을 찾아 타입 안정성을 높이도록 해야 합니다.

예를 들어, any 타입의 값을 그대로 정규시이나 함수에 넣는 것은 권장되지 않습니다.

**getLength가 더 좋은 함수입니다**
```typescript
function getLengthBad(array: any) {  // 이렇게 하지 맙시다.
  return array.length;
}
function getLength(array: any[]) {
  return array.length;
}
```
이유 세 가지
- 함수 내의 array.length 타입이 체크됩니다.
- 함수의 반환 타입이 any 대신 number로 추론됩니다.
- 함수 호출될 때 매개변수가 배열인지 체크됩니다.

배열이 아닌 값을 넣어서 실행해 보면, getLength는 제대로 오류를 표시하지만 getLengthBad는 오류를 잡아내지 못하는 것을 볼 수 있습니다.

```typescript
getLengthBad(/123/);  // 정상, 오류 없음, undefined를 반환합니다.
getLength(/123/); // error: 
// Argument of type 'RegExp' is not assignable to parameter of type 'any[]'.
```

함수의 매개변수를 구체화할 때, (요소의 타입에 관계없이) 배열의 배열 형태라면 any[][]처럼 선언하면 됩니다.

그리고 함수의 매개변수가 객체이긴 하지만 값을 알 수 없다면 {[key: string]: any}처럼 선언하면 됩니다.

```typescript
function hasTwelveLetterKey(o: {[key: string]: any}) {
  for (const key in o) {
    if (key.length === 12) {
      return true;
    }
  }
  return false;
}
```

<br>

```typescript
type Fn0 = () => any;  // 매개변수 없이 호출 가능한 모든 함수
type Fn1 = (arg: any) => any;  // 매개변수 1개
type FnN = (...args: any[]) => any;  // 모든 개수의 매개변수 "Function" 타입과 동일합니다.
```

```typescript
const numArgsBad = (...args: any) => args.length; // any를 반환합니다.
const numArgsGood = (...args: any[]) => args.length;  // number를 반환합니다.
```

> any를 사용할 때는 정말로 모든 값이 허용되어야만 하는지 면밀히 검토해야합니다.
> 
> any보다 더 정확하게 모델링할 수 있도록 any[] 또는 `{[id: string]: any}` 또는 () => any처럼 구체적인 형태를 사용해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 40. 함수 안으로 타입 단언문 감추기

함수를 작성하다 보면, 외부로 드러난 타입 정의는 간단하지만 내부 로직이 복잡해서 안전한 타입으로 구현하기 어려운 경우가 많습니다.

함수의 모든 부분을 안전한 타입으로 구현하는 것이 이상적이지만, 불필요한 예외 상황까지 고려해 가며 타입 정보를 힘들게 구성할 필요는 없습니다.

함수 내부에는 타입 단언을 사용하고 함수 외부로 드러나는 타입 정의를 정확히 명시하는 정도로 끝내는 게 낫습니다.

> 프로젝트 전반에 위험한 타입 단언문이 드러나 있는 것보다, 제대로 타입이 정의된 함수 안으로 타입 단언문을 감추는 것이 더 좋은 설계입니다.

<br>

어떤 함수든 캐싱할 수 있도록 래퍼 함수 cacheLast를 만들어 보겠습니다.(리액트를 사용하고 있다면 useMemo 훅을 사용)

```typescript
declare function shallowEqual(a: any, b: any): boolean;
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[]|null = null;
  let lastResult: any;
  return function(...args: any[]) { // error:
    // Type '(...args: any[]) => any' is not assignable to type 'T'.
    // '(...args: any[]) => any' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'Function'.
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  };
}
```
타입스크립트는 반환문에 있는 함수와 원본 함수 T 타입이 어떤 관련이 있는지 알지 못하기 때문에 오류가 발생했습니다.

그러나 결과적으로 원본 함수 T 타입과 동일한 매개변수로 호출되고 반환값 역시 예상한 결과가 되기 때문에, 타입 단언문을 추가해서 오류를 제거하는 것이 큰 문제가 되지는 않습니다.

```typescript
declare function shallowEqual(a: any, b: any): boolean;
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[]|null = null;
  let lastResult: any;
  return function(...args: any[]) {
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  } as unknown as T;
}
```
함수를 실행해 보면 잘 동작하지만, 두 가지 문제가 있습니다.

- 함수를 연속으로 호출하는 경우에 this의 값이 동일한지 체크하지 않습니다.
- 원본 함수가 객체처럼 속성 값을 가지고 있었다면 래퍼 함수에는 속성 값이 없기 대문에 타입이 달라집니다.

위 예제는 간단한 구현체를 보인 예시입니다.

> 타입 선언문은 일반적으로 타입을 위험하게 만들지만 상황에 따라 필요하기도 하고 현실적인 해결책이 되기도 합니다.
> 
> 불가피하게 사용해야 한다면, 정확한 정의를 가지는 함수 안으로 숨기도록 합니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 41. any의 진화를 이해하기

타입스크립트에서 일반적으로 변수의 타입은 변수를 선언할 때 결정됩니다.

그 후에 정제될 수 있지만(예를 들어 null인지 체크해서), 새로운 값이 추가되도록 확장할 수는 없습니다.

그러나 any 타입과 관련해서 예외인 경우가 존재 합니다.

일정 범위의 숫자들을 생성하는 함수를 예로 들어 보겠습니다.

```typescript
function range(start: number, limit: number) {
  const out = []; // out의 타입은 any[]로 추론됨.
  for (let i = start; i < limit; i++) {
    out.push(i); // out의 타입이 any[]
  }
  return out;  // 반환 타입이 number[]로 추론됨.
}
```
처음에는 any 타입 배열인 []로 초기화되었는데, 마지막에는 number[]로 추론되고 있습니다.

out의 타입은 any[]로 선언되었지만 number 타입의 값을 넣는 순간부터 타입은 number[]로 진화(evolve)합니다.

타입의 진화는 타입 좁히기([아이템 22](#아이템-22-타입-좁히기))와 다릅니다.

<br>

#### 배열에 다양한 타입의 요소를 넣으면 배열의 타입이 확장되며 진화합니다.

```typescript
const result = [];  // 타입은 any[]
result.push('a');
result  // 타입은 string[]
result.push(1);
result  // 타입은 (string | number)[]
```

또한 조건문에서는 분기에 따라 타입이 변할 수도 있습니다.
```typescript
let val;  // 타입은 any
if (Math.random() < 0.5) {
  val = /hello/;
  val  // 타입은 RegExp
} else {
  val = 12;
  val  // 타입은 number
}
val  // 타입은 number | RegExp
```

변수의 초깃값이 null인 경우도 any의 진화가 일어납니다.

보통은 try/catch 블록 안에서 변수를 할당하는 경우에 나타납니다.

```typescript
function somethingDangerous() {}
let val = null;  // 타입은 any
try {
  somethingDangerous();
  val = 12;
  val  // 타입은 number
} catch (e) {
  console.warn('alas!');
}
val  // 타입은 number | null
```

다음처럼 명시적으로 any를 선언하면 타입이 그대로 유지됩니다.
```typescript
let val: any;  // 타입은 any
if (Math.random() < 0.5) {
  val = /hello/;
  val  // 타입은 any
} else {
  val = 12;
  val  // 타입은 any
}
val  // 타입은 any
```

> 일반적인 타입들은 정제되기만 하는 반면, 암시적 any와 any[] 타입은 진화 할 수 있습니다. 이러한 동작이 발생하는 코드를 인지하고 이해할 수 있어야 합니다.
> 
> any를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 안전한 타입을 유지하는 방법입니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 42. 모르는 타입의 값에는 any대신 unknown을 사용하기

unknown에는 함수의 반환값과 관련된 형태, 변수 선언과 관련된 형태, 단언문과 관련된 형태가 있는데, 이를 순차적으로 알아보겠습니다.

#### 함수의 반환값과 관련된 unknown

YAML 파서인 parseYAML 함수를 작성한다고 가정해 보겠습니다.

```typescript
function parseYAML(yaml: string): any {
  // ...
}
```

**반환값을 원하는 타입으로 할당하는 것이 이상적**
```typescript
interface Book {
  name: string;
  author: string;
}
const book: Book = parseYAML(`
  name: Wuthering Heights
  author: Emily Brontë
`);
```

**만약 반환값에 타입 선언을 생략한다면**
```typescript
const book = parseYAML(`
  name: Jane Eyre
  author: Charlotte Brontë
`);
alert(book.title);  // 오류 없음, 런타임에 alerts "undefined"
book('read');  // 오류 없음, 런타임에 throws "TypeError: book is not a function"
```

대신 parseYAML이 unknown 타입을 반환하게 만드는 것이 더 안전합니다.

```typescript
function safeParseYAML(yaml: string): unknown {
  return parseYAML(yaml);
}
const book = safeParseYAML(`
  name: The Tenant of Wildfell Hall
  author: Anne Brontë
`);
alert(book.title); // error: 
// Property 'title' does not exist on type 'unknown'.
book("read"); // error:
// This expression is not callable.
// Type '{}' has no call signatures.
```

unknown 타입을 이해하기 위해서는 할당 가능성의 관점에서 any를 생각해 볼 필요가 있습니다.

any가 강력하면서도 위험한 이유는 다음 두 가지 특징으로부터 비롯됩니다.

- 어떠한 타입이든 any타입에 할당 가능하다.
- any 타입은 어떠한 타입으로도 할당 가능하다(never 타입은 예외).

'타입을 값의 집합으로 생각하기([아이템 7](#아이템-7-타입이-값들의-집합이라고-생각하기))'의 관점에서, 한 집합은 다른 모든 집합의 부분 집합이면서 동시에 상위집합이 될 수 없기 때문에, 분명히 any는 타입 시스템과 상충되는 면을 가지고 있습니다.

unknown은 any 대신 쓸 수 있는 타입 시스템에 부합하는 타입입니다. 

unknown 타입은 앞에서 언급한 any의 첫 번째 속성(어떠한 타입이든 unknown에 할당 가능)을 만족하지만, 두 번째 속성(unknown은 오직 unknown과 any에만 할당 가능)은 만족하지 않습니다.

<br>

반면 never 타입은 unknown과 정반대입니다.

첫 번째 속성(어떤 타입도 never에 할당할 수 없음)은 만족하지 않지만, 두 번째 속성(어떠한 타입으로도 할당 가능)은 만족합니다.

<br>

한편 unknown 타입인 채로 값을 사용하면 오류가 발생합니다.

```typescript
const book = safeParseYAML(`
  name: Villette
  author: Charlotte Brontë
`) as Book;
alert(book.title); // error:
// Property 'title' does not exist on type 'Book'.
book('read'); // error:
// This expression is not callable.
// Type 'Book' has no call signatures.
```

함수의 반환 타입인 unknown 그대로 값을 사용할 수 없기 때문에 Book으로 타입 단언을 해야 합니다. 

애초에 반환값이 Book이라고 기대하며 함수를 호출하기 때문에 단언문은 문제가 되지 않습니다.

#### 변수 선언과 관련된 unknown

어떠한 값이 있지만 그 타입을 모르는 경우에 unknown을 사용합니다.

```typescript
interface Feature {
  id?: string | number;
  geometry: Geometry;
  properties: unknown;
}
```

instanceof를 체크한 후 unknown에서 원하는 타입으로 변환할 수 있습니다.

```typescript
function processValue(val: unknown) {
  if (val instanceof Date) {
    val  // 타입은 Date
  }
}
```

또한 사용자 정의 타입 가드도 unknown에서 원하는 타입으로 변환할 수 있습니다.

```typescript
function isBook(val: unknown): val is Book {
  return (
      typeof(val) === 'object' && val !== null &&
      'name' in val && 'author' in val
  );
}
function processValue(val: unknown) {
  if (isBook(val)) {
    val;  // 타입이 Book
  }
}
```

이중 단언문에서 any 대신 unknown을 사용할 수도 있습니다.
```typescript
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

barAny와 barUnk는 기능적으로 동일하지만, 나중에 두 개의 단언문을 분리하는 리팩터링을 한다면 unknown 형태가 더 안전합니다.

any의 경우는 분리되는 순간 그 영향력이 전염병처럼 퍼지게 됩니다.

그러나 unknown의 경우는 분리되는 즉시 오류를 발생하게 되므로 더 안전합니다.

마지막으로 unknown과 유사하지만 조금 다른 타입들도 알아보겠습니다.

- {} 타입은 null과 undefined를 제외한 모든 값을 포함합니다.
- object 타입은 모든 비기본형(non-primitive) 타입으로 이루어집니다. 여기에는 true 또는 12 또는 'foo'가 포함되지 않지만 객체와 배열은 포함됩니다.

unknown 타입이 도입되기 전에는 {}가 더 일반적으로 사용되었지만, 최근에는 {}를 사용하는 경우가 꽤 드뭅니다.

정말로 null과 undefined가 불가능하다고 판단되는 경우만 unknown 대신 {}를 사용하면 됩니다.

> unknown은 any 대신 사용할 수 있는 안전한 타입입니다.
> 
> 사용자가 타입 단언문이나 타입 체크를 사용하도록 강제하려면 unknown을 사용하면 됩니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 43. 몽키 패치보다는 안전한 타입을 사용하기

자바스크립트의 가장 유명한 특징 중 하나는, 객체와 클래스에 임의의 속성을 추가할 수 있을 만큼 유연하다는 것입니다.

객체에 속성을 추가할 수 있는 기능은 종종 웹 페이지에서 window나 document에 값을 할당하여 전역 변수를 만드는 데 사용됩니다.

```javascript
window.monkey = 'Howler';
document.monkey = 'Tamarin';

const el = document.getElementById('colobus');
el.home = 'tree';

> RegExp.prototype.monkey = 'Capuchin';
"Capuchin"
> /123/.monkey
"Capuchin"
```

객체에 임의의 속성을 추가하는 것은 일반적으로 좋은 설계가 아닙니다.

타입스크립트까지 더하면 또 다른 문제가 발생합니다.
```typescript
document.monkey = 'Tamarin';
// Property 'monkey' does not exist on type 'Document'.

// 오류 해결: any 단언문
(document as any).monkey = 'Tamarin';  // 정상

(document as any).monky = 'Tamarin';  // 정상, 하지만 오타
(document as any).monkey = /Tamarin/;  // 정상, 하지만 잘못된 타입
```

최선의 해결책은 document 또는 DOM으로부터 데이터를 분리하는 것입니다.

분리할 수 없는 경우(객체와 데이터가 붙어 있어야만 하는 라이브러리를 사용주이거나 자바스크립트 애플리케이션을 마이그레이션하는 과정 중이라면), 두 가지 차선책이 존재합니다.

- 첫 번째 interface이 특수 기능 중 하나인 보강(augmentation)을 사용하는 것입니다([아이템 13](#아이템-13-타입과-인터페이스의-차이점-알기)).

```typescript
interface Document {
  /** 몽키 패치의 속(genus) 또는 종(species) */
  monkey: string;
}
document.monkey = 'Tamarin';  // 정상
```
보강을 사용한 방법이 any보다 나은 점은 다음과 같습니다.

- 타입이 더 안전합니다. 타입 체커는 오타나 잘못된 타입의 할당을 오류로 표시합니다.
- 속성에 주석을 붙일 수 있습니다(아이템 48).
- 속성에 자동완성을 사용할 수 있습니다.
- 몽키 패치가 어떤 부분에 적용되었는지 정확한 기록이 남습니다.

그리고 모듈의 관점에서(타입스크립트 파일이 import / export를 사용하는 경우), 제대로 동작하게 하려면 global 선언을 추가해야 합니다.

```typescript
export {};
declare global {
  interface Document {
    /** 몽키 패치의 속(genus) 또는 종(species) */
    monkey: string;
  }
}
document.monkey = 'Tamarin';  // 정상
```
보강을 사용할 때 주의해야 할 점은 모듈 영역(scope)과 관련이 있습니다.

보강은 전역적으로 적용되기 때문에, 코드의 다른 부분이나 라이브러리로부터 분리할 수 없습니다.

- 두 번째 더 구체적인 타입 단언문을 사용하는 것입니다.

```typescript
interface MonkeyDocument extends Document {
  /** 몽키 패치의 속(genus) 또는 종(species) */
  monkey: string;
}
(document as MonkeyDocument).monkey = 'Macaque';
```

MonkeyDocument는 Document를 확장하기 때문에([아이템 9](#아이템-9-타입-단언보다는-타입-선언을-사용하기)) 타입 단언문은 정상이며 할당문의 타입은 안전합니다.

또한 Document 타입을 건드리지 않고 별도로 확장하는 새로운 타입을 도입했기 때문에 모듈 영역 문제도 해결할 수 있습니다(import하는 곳의 영역에만 해당됨).

그러나 몽키패치를 남용해서는 안 되며 궁극적으로 더 잘 설계된 구조로 리팩터링하는 것이 좋습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 44. 타입 커버리지를 추적하여 타입 안정성 유지하기

noImplicitAny를 설정하고 모든 암시적 any 대신 명시적 타입 구문을 추가해도 any 타입과 관련된 문제들로부터 안전하다고 할 수 없습니다.

any 타입이 여전히 프로그램 내에 존재할 수 있는 두 가지 경우가 있습니다.

- 명시적 any 타입
  - [아이템 38](#아이템-38-any-타입은-가능한-한-좁은-범위에서만-사용하기)과 [아이템 39](#아이템-39-any를-구체적으로-변형해서-사용하기)의 내용에 따라 any 타입의 범위를 좁히고 구체적으로 만들어도 여전히 any 타입입니다.
- 서드파티 타입 선언
  - 이 경우는 @types 선언 파일로부터 any 타입이 전파되기 때문에 특별히 조심해야 합니다.

any 타입은 타입 안정성과 생산성에 부정적 영향을 미칠 수 있으므로([아이템 5](#아이템-5-any-타입-지양하기)), 프로젝트에서 any의 갯수를 추적하는 것이 좋습니다.

<br>

npm의 type-coverage 패키지를 활용하여 any를 추적
``` javascript
$ npx type-coverage
9985 / 10117 98.69% // any이 추가된다면, 백분율이 감소하게 됩니다.

// any 타입이 있는 곳을 모두 출력해 줍니다.
$ npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
```

서드파티 라이브러리로부터 비롯되는 any 타입은 몇 가지 형태로 등장할 수 있지만 가장 극단적인 예는 전체 모듈에 any 타입을 부여하는 것입니다.

```typescript
declare module 'my-module';
import {someMethod, someSymbol} from 'my-module'; // 정상

const pt1 = {
  x: 1,
  y: 2,
} // 타입은 { x: number, y: number }
const pt2 = someMethod(pt1, somSymbol); // 정상, pt2의 타입은 any
```

일반적인 모듈의 사용법과 동일하기 때문에, 타입 정보가 모두 제거됐다는 것을 간과할 수 있습니다.

또는 동료가 모든 타입 정보를 날려 버렸지만, 알아채지 못하는 경우일 수도 있습니다.

그렇기 때문에 가끔 해당 모듈을 점검해야 합니다.

**[⬆ 상단으로](#목차)**

<br>

## 6. 타입 선언과 @types

타입스크립트를 포함한 모든 언어들에서 라이브러리 의존성 관리는 어려운 일입니다.

타입스크립트에서 의존성이 어떻게 동작하는지 설명하여 의존성에 대한 개념을 잡을 수 있게 합니다.

### 아이템 45. devDependencies에 typescript와 @types 추가하기

npm(node package manager)은 자바스크립트 세상에서 필수적입니다.

npm은 자바스크립트 라이브러리 저장소(npm 레지스트리)와, 프로젝트가 의존하고 있는 라이브러리들의 버전을 지정하는 방법(package.json)을 제공합니다.

npm은 세 가지 종류의 의존성을 구분해서 관리하며, 각각의 의존성은 package.json 파일 내의 별도 영역에 들어 있습니다.

- dependencies

현재 프로젝트를 실행하는 데 필수적인 라이브러리들이 포함됩니다.

예를 들어, 프로젝트의 런타임에 lodash가 사용된다면 dependencies에 포함되어야 합니다.

프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설치한다면, dependencies에 들어 있는 라이브러리도 함께 설치될 것입니다[전이(transitive) 의존성].

- devDependencies

현재 프로젝트를 개발하고 테스트하는 데 사용되지만, 런타임에는 필요 없는 라이브러리들이 포함됩니다.

예를 들어, 프로젝트에서 사용 중인 테스트 프레임워크가 devDependencies에 포함될 수 있는 라이브러리입니다.

- peerDependencies

런타임에 필요하긴 하지만, 의존성을 직접 관리하지 않는 라이브러리들이 포함됩니다.

예를 들어, 플러그인을 들 수 있습니다.

제이쿼리의 플러그인은 다양한 버전의 제이쿼리와 호환되므로 제이쿼리의 버전을 플러그인에서 직접 선택하지 않고, 플로그인이 사용되는 실제 프로젝트에서 선택하도록 만들 때 사용합니다.

타입스크립트는 개발 도구일 뿐이고 타입 정보는 런타임에 존재하지 않기 때문에([아이템 3](#아이템-3-코드-생성과-타입이-관계없음을-이해하기)), 타입스크립트와 관련된 라이브러리는 일반적으로 devDependencies에 속합니다.

모든 타입스크립트 프로젝트에서 공통적으로 고려해야 할 의존성 두 가지를 살펴보겠습니다.

첫 번째, 타입스크립트 자체 의존성을 고려해야 합니다.

타입스크립트를 시스템 레벨로 설치할 수도 있지만, 다음 두 가지 이유 때문에 추천하지는 않습니다.

- 팀원들 모두가 항상 동일한 버전을 설치한다는 보장이 없습니다.
- 프로젝트를 셋업할 때 별도의 단계가 추가됩니다.

그래서 시스템 레벨로 설치하기보다는 devDependencies에 넣는 것이 좋습니다.

<br>

두 번째, 타입 의존성(@types)을 고려해야 합니다.

사용하려는 라이브러리에 타입 선언이 포함되어 있지 않더라도, DefinitelyTyped(타입스크립트 커뮤니티에서 유지보수하고 있는 자바스크립트 라이브러리의 타입을 정의한 모음)에서 타입 정보를 얻을 수 있습니다.

DefinitelyTyped의 타입 저의들은 npm 레지스트리의 @types 스코프에 공개됩니다.

즉, @types/jquery에는 제이쿼리의 타입 정의가 있고, @types/lodash에는 로대시의 타입 정의가 있습니다.

@types 라이브러리는 타입 정보만 포함하고 있으며 구현체는 포함하지 않습니다.

원본 라이브러리 자체가 dependencies에 있더라도 @types 의존성은 devDependencies에 있어야 합니다.

예를 들어, 리액트의 타입 선언과 리액트를 의존성에 추가하려면 다음처럼 실행하고 package.json 파일이 생성됩니다.

```javascript
$ npm install react
$ npm install --save-dev @types/react

{
  "devDependencies": {
    "@types/react": "^~~~",
    "typescript": '^~~~"
  },
  "dependencies": {
    "react": "^~~~"
  }
}
```

이 예제의 의도는 런타임에 @types/react와 typescript에 의존하지 않겠다는 것입니다.

그러나 타입 의존성을 devDependencies에 넣는 방식이 항상 유효한 것은 아니며 @types 의존성과 관련된 몇 가지 문제점이 있습니다(아이템 46).

**[⬆ 상단으로](#목차)**

<br>

### 아이템 46. 타입 선언과 관련된 세 가지 버전 이해하기

의존성 관리는 개발자에게 매우 힘든 일입니다.

그래서 여러분은 아마 단순히 라이브러리를 프로젝트에 추가해서 사용할 뿐이지 라이브러리의 전이적(transitive) 의존성이 호환되는지 깊게 생각하지 않았을 겁니다.

그런데 실제로 타입스크립트는 알아서 의존성 문제를 해결해 주기는커녕, 의존성 관리를 오히려 더 복잡하게 만듭니다.

왜냐하면 타입스크립트를 사용하면 다음 세 가지 사항을 추가로 고려해야 하기 때문입니다.

- 라이브러리의 버전
- 타입 선언(@types)의 버전
- 타입스크립트의 버전

세 가지 버전 중 하나라도 맞지 않으면, 의존성과 상관없어 보이는 곳에서 엉뚱한 오류가 발생할 수 있습니다.

타입스크립트에서 일반적으로 의존성을 사용하는 방식은 다음과 같습니다.

특정 라이브러리를 dependencies로 설치하고, 타입 정보는 devDependencies로 설치합니다([아이템 45](#아이템-45-devdependencies에-typescript와-types-추가하기)).

```javascript
$ npm install react
+ react@16.8.6

$ npm install --save-dev @types/react
+ @types/react@16.8.19
```
메이저 버전과 마이너 버전(16.8)이 일치하지만 패치 버전(.6과 .19)은 일치하지 않는다는 점에 주목하길 바랍니다.

@types/react의 16.8.19는 타입 선언들이 리액트 16.8 버전의 API를 나타낸다는 것을 의미합니다.

만약 리액트 모듈이 시맨틱(semantic) 버전 규칙을 제대로 지킨다고 가정하면 패치 버전들은 공개 API의 사양을 변경하지 않습니다.

따라서 타입 선언을 업데이트할 필요가 없습니다.

그러나 타입 선언 자체에도 버그나 누락이 존재할 수 있으며 @types 모듈의 패치 버전은 버그나 누락으로 인한 수정과 추가에 따른 것입니다.

앞선 예제의 경우 라이브러리 자체보다 타입 선언에 더 많은 업데이트가 있었습니다(19대 6).

<br>

그러나 실제 라이브러리와 타입 정보의 버전이 별도로 관리되는 방식은 다음 네 가지 문제점이 있습니다.

1. 라이브러리를 업데이트했지만 실수로 타입 선언은 업데이트하지 않는 경우입니다.

이런 경우 라이브러리 업데이트와 관련된 새로운 기능을 사용하려 할 때마다 타입 오류가 발생하게 됩니다. 특히 하위 호환성이 깨지는 변경이 있었다면, 코드가 타입 체커를 통과하더라도 런타임에 오류가 발생할 수 있습니다.

일반적인 해결책은 타입 선언도 업데이트하여 라이브러리와 버전을 맞추는 것입니다.

그러나 업데이트해야 할 타입 선언의 버전이 아직 준비되지 않은 경우라면 두 가지 선택지가 있습니다.
- 보강 기법을 활용하여, 사용하려는 새 함수와 메서드의 타입 정보를 프로젝트 자체에 추가하는 것입니다.
- 타입 선언의 업데이트를 직접 작성하고 공개하여 커뮤니티에 기여하는 방법도 있습니다.

<br>

2. 라이브러리보다 타입 선언의 버전이 최신인 경우입니다.

이런 경우는 타입 정보 없이 라이브러리를 사용해 오다가(아마도 declare module을 사용해서 any 타입으로 사용했을 겁니다) 타입 선언을 설치하려고 할때 뒤늦게 발생합니다.

그 사이에 라이브러리와 타입 선언의 새 버전이 릴리스되었다면 라이브러리와 타입 선언의 버전 정보는 어긋나게 될 것입니다.

해결책은 라이브러리와 타입 선언의 버전이 맞도록 라이브러리 버전을 올리거나 타입 선언의 버전을 내리는 것입니다.

3. 프로젝트에서 사용하는 타입스크립트 버전보다 라이브러리에서 필요로 하는 타입스크립트 버전이 최신인 경우입니다.

일반적으로 로대시, 리액트, 람다 같은 유명 자바스크립트 라이브러리의 타입 정보를 더 정확하게 표현하기 위해서 타입스크립트에서 타입 시스템이 개선되고 버전이 올라가게 됩니다.

그러므로 이러한 라이브러리들의 최신 타입 정보를 얻기 위해서라면 당연히 타입스크립트의 최신 버전을 사용해야 합니다.

4. @types 의존성이 중복될 수도 있습니다.

@types/foo와 @types/bar에 의존하는 경우를 가정해 봅시다.

만약 @types/bar가 현재 프로젝트와 호환되지 않는 버전의 @types/foo에 의존한다면 npm은 중첩된 폴더에 별도로 해당 버전을 설치하여 문제를 해결하려고 합니다.

```javascript
node_modules/
  @types/
    foo/
      index.d.ts @1.2.3
    bar/
      index.d.ts
        node_modules/
          @types/
            foo/
              index.d.ts @2.3.4
```
런타임에 사용되는 모듈이라면 괜찮을 수 있지만, 전역 네임스페이스(namespace)에 있는 타입 선언 모듈이라면 대부분 문제가 발생합니다.

전역 네임스페이스에 타입 선언이 존재하면 중복된 선언, 또는 선언이 병합될 수 없다는 오류로 나타나게 됩니다.

이런 상황이라면 `npm ls @types/foo`를 실행하여 어디서 타입 선언 중복이 발생했는지 추적할 수 있습니다.

해결책은 보통 @types/foo를 업데이트하거나 @types/bar를 업데이트해서 서로 버전이 호환되게 하는 것입니다.

만약 타입 선언을 작성하고 공개하려고 한다면, 아이템 51을 참고하여 이러한 문제를 피하기 바랍니다.

일부 라이브러리, 특히 타입스크립트로 작성된 라이브러리들은 자체적으로 타입 선언을 포함(번들링, bundling)하게 됩니다.

자체적인 타입 선언은 보통 package.json의 "types" 필드에서 .d.ts 파일을 가리키도록 되어 있습니다.
```json
{
  "name": "left-pad",
  "version": "1.3.0",
  "description": "String left pad",
  "main": "index.js",
  "types": "index.d.ts",
  // ...
}
```
"types": "index.d.ts"를 추가하면 모든 문제가 해결될까요?

번들링하여 타입 선언을 포함하는 경우, 특히 라이브러리가 타입스크립트로 작성되고 컴파일러를 통해 타입 선언이 생성된 경우라면 버전 불일치 문제를 해결하기는 합니다.

그러나 번들링 방식은 부수적인 네 가지 문제점을 가지고 있습니다.

1. 번들된 타입 선언에 보강 기법으로 해결할 수 없는 오류가 있는 경우, 또는 공개 시점에는 잘 동작했지만 타입스크립트 버전이 올라가면서 오류가 발생하는 경우에 문제가 됩니다.

@types을 별도로 사용하는 경우라면 라이브러리 자체의 버전에 맞추어 선택할 수 있습니다.

그러나 번들된 타입에서는 @types의 버전 선택이 불가능합니다.

단 하나의 잘못된 타입 선언으로 인해 타입스크립트의 버전을 올리지 못하는 불상사가 생길 수 있는 것입니다.

번들된 타입과 DefinitelyTyped이 비교되는 부분입니다. 마이크로소프트는 타입스크립트 버전이 올라감에 따라 DefinitelyTyped의 모든 타입 선언을 점검하며, 문제가 발견된 곳은 빠른 시간 내에 해결하고 있습니다.

2. 프로젝트 내의 타입 선언이 다른 라이브러리의 타입 선언에 의존한다면 문제가 됩니다.

보통은 의존성이 devDependencies에 들어갑니다([아이템 45](#아이템-45-devdependencies에-typescript와-types-추가하기)).

그러나 프로젝트를 공개하여 다른 사용자가 설치하게 되면 devDependencies가 설치되지 않을 것이고 타입 오류가 발생하게 됩니다.

아이템 51에서는 이러한 상황에 대한 표준 해결책을 다룹니다.

3. 프로젝트의 과거 버전에 있는 타입 선언에 문제가 있는 경우에는 과거 버전으로 돌아가서 패치 업데이트를 해야 합니다.

번들링된 타입 선언에서는 어려운 일이지만, DefinitelyTyped는 동일 라이브러리의 여러 버전의 타입 선언을 동시에 유지보수할 수 있는 메커니즘을 가지고 있습니다.

4. 타입 선언의 패치 업데이트를 자주 하기 어렵다는 문제가 있습니다.

처음에 있었던 react와 @types/react 버전의 사례를 떠올려 봅시다.

라이브러리 자체보다 타입 선언에 대한 패치 업데이트가 무려 세 배나 더 많았습니다.

DefinitelyTyped는 커뮤니티에서 관리되기 때문에 이러한 작업량을 감당할 수 있습니다.


<br>

타입스크립트에서 의존성을 관리한다는 것은 쉽지 않은 일이지만, 잘 관리 한다면 그에 따른 보상이 함께 존재합니다.

잘 작성된 타입 선언은 라이브러리를 올바르게 사용하는 방법을 배우는 데 도움이 되며 생산성 역시 크게 향상시킬 수 있습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 47. 공개 API에 등장하는 모든 타입을 익스포트하기

타입스크립트를 사용하다 보면, 언젠가는 서드파티의 모듈에서 익스포트되지 않은 타입 정보가 필요한 경우가 있습니다.

만약 함수의 선언에 이미 타입 정보가 있다면 제대로 익스포트되고 있는 것이며, 타입 정보가 없다면 타입을 명시적으로 작성해야 합니다.

어떤 타입을 숨기고 싶어서 익스포트하지 않았다고 가정해 보겠습니다.

```typescript
interface SecretName {
  first: string;
  last: string;
}

interface SecretSanta {
  name: SecretName;
  gift: string;
}

export function getGift(name: SecretName, gift: string): SecretSanta {
  // ...
}
```

해당 라이브러리 사용자는 SecretName 또는 SecretSanta를 직접 임포트할 수 없고, getGift만 임포트 가능합니다.

추출하는 한 가지 방법은 Parameters와 ReturnType 제너릭 타입을 사용하는 것입니다.
```typescript
type MySanta = ReturnType<typeof getGift>;  // SecretSanta
type MyName = Parameters<typeof getGift>[0];  // SecretName
```

> 공개 매서드에 등장한 어떤 형태의 타입이든 익스포트합시다. 어차피 라이브러리 사용자가 추출할 수 있으므로, 익스포트하기 쉽게 만드는 것이 좋습니다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 48. API 주석에 TSDoc 사용하기

다음 코드는 인사말을 생성하는 타입스크립트 함수입니다.

```typescript
// 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다.
function greet(name: string, title: string) {
  return `Hello ${title} ${name}`;
} // 인라인 주석은 툴팁이 안나옵니다.

/** 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다. */
function greetJSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

JSDoc에는 @param과 @returns 같은 일반적 규칙을 사용할 수 있습니다.

```typescript
/**
 * 인사말을 생성합니다.
 * @param name 인사할 사람의 이름
 * @param salutation 그 사람의 칭호
 * @returns 사람이 보기 좋은 형태의 인사말
 */
function greetFullTSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

타입 정의에 TSDoc을 사용할 수도 있습니다.

```typescript
/** 특정 시간과 장소에서 수행된 측정 */
interface Measurement {
  /** 어디에서 측정되었나? */
  position: Vector3D;
  /** 언제 측정되었나? epoch에서부터 초 단위로 */
  time: number;
  /** 측정된 운동량 */
  momentum: Vector3D;
}
```
Measurement 객체의 각 필드에 마우스를 올려 보면 필드별로 설명을 볼 수 있습니다.

> 익스포트된 함수, 클래스, 타입에 주석을 달 때는 JSDoc/TSDoc 형태를 사용합시다.

**[⬆ 상단으로](#목차)**

<br>

### 아이템 49. 콜백에서 this에 대한 타입 제공하기

자바스크립트에서 this 키워드는 매우 혼란스러운 기능입니다.

let이나 const로 선언된 변수가 렉시컬 스코프(lexical scope)인 반면, this는 다이나믹 스코프(dynamic scope)입니다.

다이나믹 스코프의 값은 '정의된'방식이 아니라 '호출된'방식에 따라 달라집니다.

this는 전형적으로 객체의 현재 인스턴스를 참조하는 클래스에서 가장 많이 쓰입니다.

```javascript
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}
const c = new C();
c.logSquares();
// 1
// 4
// 9
```

```typescript
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}
const c = new C();
const method = c.logSquares;
method(); // 런타임에 오류가 발생합니다.

// TypeError: Cannot read property 'vals' of undefined
```

call을 사용하면 명시적으로 this를 바인딩하여 문제를 해결할 수 있습니다.
```typescript
const c = new C();
const method = c.logSquares;
method.call(c);  // 제곱을 출력합니다.
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 50. 오버로딩 타입보다는 조건부 타입을 사용하기

다음 예제의 double 함수에 타입 정보를 추가해 보겠습니다.

```typescript
function double(x) { return x + x };

function double(x: number|string): number|string;
function double(x: any) { return x + x; }
```
선언이 틀린 것은 아니지만, 모호한 부분이 있습니다.

```typescript
const num = double(12);  // string | number
const str = double('x');  // string | number
```

제너릭을 사용하면 이러한 동작을 모델링할 수 있습니다.
```typescript
function double<T extends number|string>(x: T): T;
function double(x: any) { return x + x; }

const num = double(12);  // 타입이 12
const str = double('x');  // 타입이 "x"
```

하지만 너무 과했습니다.

또 다른 방법은 여러 가지 타입 선언으로 분리하는 것입니다.
```typescript
function double(x: number): number;
function double(x: string): string;
function double(x: any) { return x + x; }

const num = double(12);  // 타입이 number
const str = double('x');  // 타입이 string
```

함수 타입이 조금 명확해졌지만 여전히 버그는 남아 있습니다.

```typescript
function f(x: number|string) {
  return double(x); // error:
// Argument of type 'string | number' is not assignable to parameter of type 'string'
}
```

다음 오버로딩(string|number 타입)을 추가하여 문제를 해결할 수도 있지만, 가장 좋은 해결책은 조건부 타입(conditional type)을 사용하는 것입니다.

```typescript
function double<T extends number | string>(
  x: T
): T extends string ? string : number;
function double(x: any) { return x + x; }

const num = double(12);  // number
const str = double('x');  // string

// function f(x: string | number): string | number
function f(x: number|string) {
  return double(x);
}
```

> 오버로딩 타입보다 조건부 타입을 사용하는 것이 좋습니다. 조건부 타입은 추가적인 오버로딩 없이 유니온 타입을 지원할 수 있습니다. 

**[⬆ 상단으로](#목차)**

<br>

### 아이템 51. 의존성 분리를 위해 미러 타입 사용하기

CSV 파일을 파싱하는 라이브러리를 작성한다고 가정해 보겠습니다.

CSV 파일의 내용을 매개변수로 받고, 열 이름을 값으로 매핑하는 객체들을 생성하여 배열로 반환합니다. 그리고 NodeJS 사용자를 위해 매개변수에 Buffer 타입을 허용합니다.

```typescript
function parseCSV(contents: string | Buffer): {[column: string]: string}[]  {
  if (typeof contents === 'object') {
    // It's a buffer
    return parseCSV(contents.toString('utf8'));
  }
  // ...
}
```

이때 Buffer의 타입 정의는 NodeJs 타입 선언을 설치해서 얻을 수 있습니다. `npm install --save-dev @types/node`

그러나 @types/node를 devDependencies로 포함하면 두 그룹의 라이브러리 사용자들에게 문제가 생깁니다.

- @types와 무관한 자바스크립트 개발자
- NodeJs와 무관한 타입스크립트 웹 개발자


그래서 실제로 필요한 부분만을 떼어 내어 명시해, 의존성을 분리할 때가 좋을 수 있습니다.

```typescript
interface CsvBuffer {
  toString(encoding: string): string;
}
function parseCSV(contents: string | CsvBuffer): {[column: string]: string}[]  {
  // ...
}
```

**[⬆ 상단으로](#목차)**

<br>

### 아이템 52. 테스팅 타입의 함정에 주의하기

테스팅을 위해 할당을 사용하는 방법에는 두 가지 근본적인 문제가 있습니다.

1. 불필요한 변수를 만들어야 합니다.

반환값을 할당하는 변수는 샘플코드처럼 쓰일 수도 있지만, 일부 린팅 규칭(미사용 변수 경고)을 비활성해야합니다.

일반적인 해결책은 변수를 도입하는 대신 헬퍼 함수를 정의하는 것입니다.

```typescript
function assertType<T>(x: T) {}

assertType<number[]>(map(['john', 'paul'], name => name.length));
```

이 코드는 불필요한 변수 문제를 해결하지만, 또 다른 문제점이 남아 있습니다.

2. 두 타입이 동일한지 체크하는 것이 아니라 할당 가능성을 체크하고 있습니다.

```typescript
const n = 12;
assertType<number>(n);  // 정상
```

그러나 객체의 타입을 체크하는 경우를 살펴보면 문제를 발견하게 될 겁니다.

```typescript
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType<{name: string}[]>(
  map(beatles, name => ({
    name,
    inYellowSubmarine: name === 'ringo'
  })));  // 정상
```

map은 {name: string, inYellowSubmarine: boolean} 객체의 배열을 반환합니다.

반환된 배열은 {name: string}[]에 할당 가능하지만, inYellowSubmarine 속성에 대한 부분이 체크되지 않았습니다.

게다가 assertType에 함수를 넣어보면, 이상한 결과가 나타납니다.

```typescript
function assertType<T>(x: T) {}
const add = (a: number, b: number) => a + b;
assertType<(a: number, b: number) => number>(add);  // 정상

const double = (x: number) => 2 * x;
assertType<(a: number, b: number) => number>(double);  // 정상!?
```

double 함수의 체크가 성공하는 이유는, 타입스크립트의 함수는 매개변수가 더 적은 함수 타입에 할당 가능하기 때문입니다.

```typescript
const g: (x: string) => any = () => 12;  // 정상
```

앞의 코드는 선언된 것보다 적은 매개변수를 가진 함수를 할당하는 것이 아무런 문제가 없다는 것을 보여 줍니다.

<br>

다음 코드처럼 assertType을 Parameters와 ReturnType 제너릭 타입을 이용해 함수의 매개변수 타입과 반환 타입만 분리하여 테스트할 수 있습니다.

```typescript
const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null!;
assertType<[number, number]>(p);
// Argument of type '[number]' is not assignable to parameter of type [number, number]
let r: ReturnType<typeof double> = null!;
assertType<number>(r);  // 정상
```

**[⬆ 상단으로](#목차)**

<br>

## 7. 코드를 작성하고 실행하기

### 아이템 53. 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

타입스크립트가 태동하던 2010년경, 자바스크립트는 결함이 많고 개선해야 할 부분이 많은 언어였습니다.

그리고 클래스, 데코레이터, 모듈 시스템 같은 기능이 없어서 프레임워크나 트랜스파일러로 보완하는 것이 일반적인 모습이었습니다.

그렇기 때문에 타입스크립트도 초기 버전에는 독립적으로 개발한 클래스, 열거형(enum), 모듈 시스템을 포함시킬 수밖에 없었습니다.

시간이 흐르며 TC39(자바스크립트를 관장하는 표준 기구)는 부족했던 점들을 대부분 내장 기능으로 추가했습니다.

그러나 자바스크립트에 새로 추가된 기능은 타입스크립트 초기 버전에서 독립적으로 개발했던 기능과 호환성 문제를 발생시켰습니다.

그렇기에 타입스크립트 진영에서는 다음 전략 중 하나를 선택해야 했습니다.

- 한 가지 전략은 타입스크립트 초기 버전의 형태를 유지하기 위해 자바스크립트 신규 기능을 변형해서 끼워 맞추는 것입니다.

- 또 다른 전략은 자바스크립트의 신규 기능을 그대로 채택하고 타입스크립트 초기 버전과 호환성을 포기하는 것입니다.

타입스크립트 팀은 대부분 두 번째 전략을 선택했습니다.

결국 TC39는 런타임 기능을 발전시키고, 타입스크립트 팀은 타입 기능만 발전시킨다는 명확한 원칙을 세우고 현재까지 지켜오고 있습니다.

<br>

그런데 이 원칙이 세워지기 전에, 이미 사용되고 있던 몇 가지 기능이 있습니다.

이 기능들은 타입 공간(타입스크립트)과 값 공간(자바스크립트)의 경계를 혼란스럽게 만들기 때문에 사용하지 않는 것이 좋습니다.

**여기서는 피해야 하는 기능을 몇 가지 살펴봅니다.**

그리고 불가피하게 이 기능을 사용하게 될 경우 어떤 점에 유의해야 호환성 문제를 일으키지 않는지 알아봅시다.

<br>

#### 열거형(enum)

타입스크립트에서도 열거형을 사용할 수 있습니다.

```typescript
enum Flavor {
  VANILLA = 0,
  CHOCOLATE = 1,
  STRAWBERRY = 2,
}

let flavor = Flavor.CHOCOLATE;  // 타입은 Flavor

Flavor  // 자동완성 추천: VANILLA, CHOCOLATE, STRAWBERRY
Flavor[0]  // 값이 "VANILLA"
```

단순히 값을 나열하는 것보다 실수가 적고 명확하기 때문에 일반적으로 열거형을 사용하는 것이 좋습니다.

그러나 타입스크립트의 열거형은 몇 가지 문제가 있습니다.

타입스크립트의 열거형은 다음 목록처럼 상황에 따라 다르게 동작합니다.

- 숫자 열거형(앞 예제의 Flavor)에 0, 1, 2 외의 다른 숫자가 할당되면 매우 위험합니다.
- 상수 열거형은 보통의 열거형과 달리 런타임에 완전히 제거됩니다. 앞의 예제를 `const enum Flavor`로 바꾸면, 컴파일러는 Flavor.CHOCOLATE을 0으로 바꿔 버립니다. 이런 결과는 기대하지 않은 것이며, 문자열 열거형과 숫자 열거형이 전혀 다른 동작입니다.
- preserveConstEnums 플래그를 설정한 상태의 상수 열거형은 보통의 열거형처럼 런타임 코드에 상수 열거형 정보를 유지합니다.
- 문자열 열거형은 런타임의 타입 안전성과 투명성을 제공합니다. 그러나 타입스크립트의 다른 타입과 달리 구조적 타이핑이 아닌 명목적 타이핑을 사용합니다.

타입스크립트의 일반적인 타입들이 할당 가능성을 체크하기 위해서 구조적 타이핑([아이템 4](#아이템-4-구조적-타이핑에-익숙해지기))을 사용하는 반면, 문자열 열거형은 명목적 타이핑(nominally typing)을 사용합니다.

- 구조적 타이핑은 구조가 같으면 할당이 허용되는 반면, 명목적 타이핑은 타입의 이름이 같아야 할당이 허용됩니다.

```typescript
enum Flavor {
  VANILLA = 'vanilla',
  CHOCOLATE = 'chocolate',
  STRAWBERRY = 'strawberry',
}

let flavor = Flavor.CHOCOLATE;  // Type is Flavor
    flavor = 'strawberry'; // error: 
// Type '"strawberry"' is not assignable to type 'Flavor'.
```

Flavor는 런타임 시절에는 문자열이기 때문에, 자바스크립트에서 다음처럼 호출할 수 있습니다.

```javascript
function scoop(flavor: Flavor) { /* ... */ }

scoop('vanilla') // 자바스크립트에선 정상

scoop('vanilla') // 타입스크립트에선 오류 error:
// "vanilla" 형식은 'Flavor' 형식의 매개변수에 할당될 수 없습니다.
```

이처럼 자바스크립트와 타입스크립트에서 동작이 다르기 때문에 문자열 열거형은 사용하지 않는 것이 좋습니다.

열거형 대신 리터럴 타입의 유니온을 사용하면 됩니다.

```typescript
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';

let flavor: Flavor = 'chocolate';  // 정상
    flavor = 'mint chip';
// Type '"mint chip"' is not assignable to type 'Flavor'.
```

<br>

#### 매개변수 속성

일반적으로 클래스를 초기화할 때 속성을 할당하기 위해 생성자의 매개변수를 사용합니다.

```typescript
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// 타입스크립트는 더 간결한 문법을 제공합니다.
class Person {
  constructor(public name: string) {}
}
```

예제의 public name은 '매개변수 속성'이라고 불리며, 멤버 변수로 name을 선언한 이전 예제와 동일하게 동작합니다.

그러나 매개변수 속성과 관련된 몇 가지 문제점이 존재합니다.

- 일반적으로 타입스크립트 컴파일은 타입 제거가 이루어지므로 코드가 줄어들지만, 매개변수 속성은 코드가 늘어나는 문법입니다.
- 매개변수 속성이 런타임에는 실제로 사용되지만, 타입스크립트 관점에서는 사용되지 않는 것처럼 보입니다.
- 매개변수 송성과 일반 속성을 섞어서 사용하면 클래스의 설계가 혼란스러워집니다.

문제점들에 대한 예

```typescript
class Person {
  first: string;
  last: string;
  constructor(public name: string) {
    [this.first, this.last] = name.split(' ');
  }
}
```

Person 클래스에는 세 가지 속성(first, last, name)이 있지만, first와 last만 속성에 나열되어 있고 name은 매개변수 속성에 있어서 일관성이 없습니다.

클래스에 매개변수 속성만 존재한다면 클래스 대신 인터페이스로 만들고 객체 리터럴을 사용하는 것이 좋습니다.

```typescript
class Person {
  constructor(public name: string) {}
}
const p: Person = {name: 'Jed Bartlet'};  // 정상
```

> 매개변수 속성을 사용하는 것이 좋은지에 대해서는 찬반 논란이 있습니다.

매개변수 속성은 타입스크립트의 다른 패턴들과 이질적이고, 초급자에게 생소한 문법이라는 것을 기억해야 합니다.

또한, 매개변수 속성과 일반 속성을 같이 사용하면 설계가 혼란스러워지기 때문에 한 가지만 사용하는 것이 좋습니다.

<br>

#### 네임스페이스와 트리플 슬래시 임포트

ECMAScript 2015 이전에는 자바스크립트에 공식적인 모듈 시스템이 없었습니다.

그래서 각 환경마다 자신만의 방식으로 모듈 시스템을 마련했습니다.

Node.js는 require와 module.exports를 사용한 반면, AMD는 define 함수와 콜백을 사용했습니다.

타입스크립트 역시 자체적으로 모듈 시스템을 구축했고, module 키워드와 '트리플 슬래시' 임포트를 사용했습니다.

ECMAScript 2015가 공식적으로 모듈시스템을 도입한 이후, 타입스크립트는 충돌을 피하기 위해 module과 같은 기능을 하는 namespace 키워드를 추가했습니다.

```typescript
namespace foo {
  function bar() {}
}

/// <reference path="other.ts" />
foo.bar();
```

트리플 슬래시 임포트와 module 키워드는 호환성을 위해 남아 있을 뿐이며,

이제는 ECMAScript 2015스타일의 모듈(import와 export)을 사용해야 합니다.

<br>

#### 데코레이터

데코레이터는 클래스, 메서드, 속성에 애너테이션(annotation)을 붙이거나 기능을 추가하는 데 사용할 수 있습니다.

예를 들어, 클래스의 메서드가 호출될때마다 로그를 남기려면 logged 애너테이션을 정의할 수 있습니다.

```typescript

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  @logged
  greet() {
    return "Hello, " + this.greeting;
  }
}

function logged(target: any, name: string, descriptor: PropertyDescriptor) {
  const fn = target[name];
  descriptor.value = function() {
    console.log(`Calling ${name}`);
    return fn.apply(this, arguments);
  };
}

console.log(new Greeter('Dave').greet());
// Logs:
// Calling greet
// Hello, Dave
```

데코레이터는 처음에 앵귤러 프레임워크를 지원하기 위해 추가되었으며 `tsconfig.json에 experimentalDecorators` 속성을 설정하고 사용해야 합니다.

앵귤러를 사용하거나 애너테이션이 필요한 프레임워크를 사용하고 있는 게 아니라면, 데코레이터가 표준이 되기 전에는 타입스크립트에서 데코레이터를 사용하지 않는 게 좋습니다.

> 일반적으로 타입스크립트 코드에서 모든 타입 정보를 제거하면 자바스크립트가 되지만, 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 타입 정보를 제거한다고 자바스크립트가 되지는 않습니다.

