# Effective TypeScript

> 책: https://effectivetypescript.com/ 
> 
> Github: https://github.com/danvk/effective-typescript

## 목차
1. [타입스크립트 알아보기](#1-타입스크립트-알아보기)
2. [타입스크립트의 타입 시스템](#2-타입스크립트의-타입-시스템)
3. [타입 추론](#3-타입-추론)

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
function add(a, b) {
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
const x: number = null;
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

#### 타입 오류가 있는 코드도 컴파일이 가능합니다.
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
// '컴파일에 문제가 있다'보단 '타입 체크에 문제가 있다'
```
- 오류가 있을 때 컴파일하지 않으려면, tsconfig.json에 noEmitOnError를 설정하거나 빌드 도구에 동일하게 적용하면 됩니다.


#### 런타임에는 타입 체크가 불가능합니다.

#### 타입 연산은 런타임에 영향을 주지 않습니다.

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

#### 런타임 타입은 선언된 타입과 다를 수 있습니다.
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

#### 타입스크립트 타입으로는 함수를 오버로드할 수 없습니다.

#### 타입스크립트 타입은 런타임 성능에 영향을 주지 않습니다.

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
// Vector2D와 NamedVector의 관계를 전혀 선언하지 않았다.

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
// 오류를 잡지 못한다.
```

calculateLength는 2D 벡터를 기반으로 연산하는데, 버그로 인해 normalize가 3D 벡터로 연산되었습니다. z가 정규화에서 무시된 것입니다.

Vector3D와 호환되는 {x, y, z} 객체로 calculateLength를 호출하면, 구조적 타이핑 관점에서 x와 y가 있어서 Vector2D와 호환됩니다. 따라서 오류가 발생하지 않았고, 타입 체커가 문제로 인식하지 않았습니다. (이런 경우를 오류로 처리하기 위한 설정 아이템 37에서 다룹니다.)

**[⬆ 상단으로](#목차)**

<br>

### 아이템 5. any 타입 지양하기

타입스크립트의 타입 시스템은 점진적(gradual)이고 선택적(optional)입니다.

#### any 타입에는 타입 안전성이 없습니다.

```typescript
let age: number;
age = '12' // error: Type 'string' is not assignable to type 'number'.

age = '12' as any; // 정상
age += 1; // 정상 age = '121'
```

#### any는 함수 시그니처(contract)를 무시해 버립니다.
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
#### any 타입에는 언어 서비스가 적용되지 않습니다.
any타입을 이용하면 자동완성과 오타 체크를 이용할 수 없습니다.

> 타입스크립트의 모토는 '확장 가능한 자바스크립트'입니다.

#### any 타입은 코드 리팩터링 때 버그를 감춥니다.
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

#### any는 타입 설계를 감춰버립니다.
상태 객체 안에 있는 수많은 속성의 타입을 일일이 작성해야 하는데, any 타입을 사용하면 간단히 끝내버릴 수 있습니다.

**하지만, 이때 any를 사용하면 안됩니다.**

상태 객체의 설계를 감춰버리기 때문입니다. 
> 깔끔하고 정확하고 명료한 코드 작성을 위해 제대로 된 타입 설계는 필수입니다.

#### any는 타입시스템의 신뢰도를 떨어뜨립니다.
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
getKey({}, 12); // Argument of type 'number' is not assignable to parameter of type 'string'.
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
type T2 = typeof email; // (p: Person, subject: string, body: string) => Response
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
- 키의 타입: string이나 number 또는 symbol이 조합이어야 하지만, 보통은 string을 사용합니다(아이템 16).
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

- 타입 체커에 추가적인 문맥(아이템 26)을 제공하는 것입니다. (예를 들어, 함수의 매개변수로 값을 전달)

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
