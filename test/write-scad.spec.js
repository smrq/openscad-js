const { globals, modules: m } = require('..');

test('basic output', () => {
	const result = String(
		m.union()(
			m.cube(1),
			m.cube([1,2,3], { center: true }),
		)
	);
	expect(result).toBe(`
union() {
	cube(1);
	cube([1, 2, 3], center=true);
}
	`.trim());
});

test('modifiers', () => {
	const result = String(
		m.union()(
			m._debug(m.cube(1)),
			m._bg(m.cube(2)),
			m._root(m.cube(3)),
			m._disable(m.cube(4)),
		)
	);
	expect(result).toBe(`
union() {
	#cube(1);
	%cube(2);
	!cube(3);
	*cube(4);
}
	`.trim());
});
