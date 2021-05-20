# openscad-js
OpenSCAD, but in a real language :)

## Usage
```
const { modules: m } = require('@smrq/openscad');

const model = m.translate([10,20,30])(
  m.cube([1,2,3], { center: true })
);

console.log(String(model));
```

## I don't want to prefix everything with `m.`
That's too bad for you.

## Isn't there another way?
Okay, but don't say I didn't warn you.

```
const { globals } = require('@smrq/openscad');
with (globals) {

  const model = translate([10,20,30])(
    cube([1,2,3], { center: true })
  );

  console.log(String(model));
  
}
```
