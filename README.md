# openscad-js
OpenSCAD, but in a real language :)

## Usage
```js
const { modules: m } = require('@smrq/openscad-js');

const model = m.translate([10, 20, 30])(
    m.cube([1, 2, 3], { center: true })
);

console.log(String(model));
```

## What features in OpenSCAD does this support?

Literally anything that follows the OpenSCAD module syntax. Nothing is built into this library, it just rewrites things into the OpenSCAD syntax.

```js
m.foo(1, 2, { bar: 3, baz: 4 })(
    m.quux([5, 6, 7])
)
```
=>
```scad
foo(1, 2, bar=3, baz=4) {
    quux([5, 6, 7]);
}
```

## I don't want to prefix everything with `m.`
That's too bad for you.

## Isn't there another way?
Okay, but don't say I didn't warn you.

```js
const { globals } = require('@smrq/openscad-js');
with (globals) {
    const model = translate([10,20,30])(
        cube([1,2,3], { center: true })
    );

    console.log(String(model));
}
```
