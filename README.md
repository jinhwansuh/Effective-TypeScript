# Effective TypeScript

> 책: https://effectivetypescript.com/ 
> 
> Github: https://github.com/danvk/effective-typescript

## 목차
1. [타입스크립트 알아보기](#1-타입스크립트-알아보기)
2. [타입스크립트의 타입 시스템](#2-타입스크립트의-타입-시스템)
3. [타입 추론](#3-타입-추론)
4. [타입 설계](#4-타입-설계)

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

타입 체커는 일반적으로 이러한 조건문에서 타입좁히기를 잘 해내지만, 타입 별칭이 존재한다면 그러지 못할 수도 있습니다(아이템 24).

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

### 아이템 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

아이템 29의 제목은 TCP와 관련해서 존 포스텔이 쓴 견고성 원칙(robustness principle) 또는 포스텔의 법칙(Postel's Law)에서 따왔습니다.

> TCP 구현체는 견고성의 일반적 원칙을 따라야 한다. 당신의 작업은 엄격하게 하고, 다른 사람의 작업은 너그럽게 받아들여야 한다.

다양한 타입을 허용해야만 하는 라이브러리의 타입 선언을 작성하고 있다면, 어쩔 수 없이 다양한 타입을 허용해야 하는 경우가 생깁니다.

하지만 그때도 매우 자유로운 타입은 나쁜 설계라는 사실을 잊어서는 안됩니다.

