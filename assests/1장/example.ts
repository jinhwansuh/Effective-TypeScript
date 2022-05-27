let city = 'new york city';
console.log(city.toUppercase());

const a = null + 7;

const b = [] + 12;

alert('Hello', 'TypeScript');

function add(a, b) {
  return a + b;
}

const x: number = null;

let y = 'hello';
y = 1234;

function asNumber(val: number | string): number {
  return val as number;
}

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
const v: NamedVector = { x: 3, y: 4, name: 'Zee' };
calculateLength(v); // 정상 return

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

normalize({ x: 3, y: 3, z: 5 });

let age: number;
age = '12' as any;

interface ComponentProps {
  onSelectItem: (item: number) => void;
}

function renderSelector(props: ComponentProps) {
  /* ... */
}

let selectedId: number = 0;
function handleSelectItem(item: any) {
  selectedId = item.id;
}

renderSelector({ onSelectItem: handleSelectItem });
