# Effective-TypeScript

> 책: https://effectivetypescript.com/ 
> 
> Github: https://github.com/danvk/effective-typescript

## 목차
1. [타입스크립트 알아보기](#1-타입스크립트-알아보기)
2. [타입스크립트의 타입 시스템](#2-타입스크립트의-타입-시스템)

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
console.log(city.toUppercase());
// Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
const a = null + 7;
// Operator '+' cannot be applied to types 'null' and '7'.
const b = [] + 12;
// Operator '+' cannot be applied to types 'undefined[]' and 'number'.
alert('Hello', 'TypeScript');
// Expected 0-1 arguments, but got 2.
```

**[⬆ 상단으로](#목차)**

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
}
// 오류: Parameter 'a' implicitly has an 'any' type. 
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

- 타입스크립트는 타입을 명시하는 것이 좋고, 엄격한 체크를 하고 싶다면 strict 설정을 고려해야 합니다.

**[⬆ 상단으로](#목차)**

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
// error Type 'number' is not assignable to type 'string'.

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

### 아이템 5. any 타입 지양하기

타입스크립트의 타입 시스템은 점진적(gradual)이고 선택적(optional)입니다.

#### any 타입에는 타입 안전성이 없습니다.

```typescript
let age: number;
age = '12'
// Type 'string' is not assignable to type 'number'.
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

## 2. 타입스크립트의 타입 시스템

타입스크립트는 코드를 자바스크립트로 변환하는 [역할](#아이템-3-코드-생성과-타입이-관계없음을-이해하기)도 하지만 가장 중요한 역할은 타입 시스템에 있습니다. 이것이 타입스크립트를 사용하는 진정한 이유이기도 합니다.

### 아이템 6. 편집기를 사용하여 타입 시스템 탐색하기
편집기에서 타입스크립트 언어 서비스를 적극 활용해야 합니다.

편집기를 사용하면 어떻게 타입 시스템이 동작하는지, 그리고 타입스크립트가 어떻게 타입을 추론하는지 개념을 잡을 수 있습니다.

타입스크립트가 동작을 어떻게 모델링하는지 알기 위해 타입 선언 파일을 찾아보는 방법을 터득해야 합니다.

