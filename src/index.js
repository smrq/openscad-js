const indent = '\t';

class ScadNode {
	constructor(type, props) {
		this.type = type;
		this.props = props;
	}
}

function writeNode(depth, node) {
	switch (node.type) {
		case 'module':
			return writeModule(depth, node.props.name, node.props.args, node.props.children);
		case 'object':
			return writeObject(depth, node.props.name, node.props.args);
		case 'modifier':
			return writeModifier(depth, node.props.symbol, node.props.child);
	}
}

function writeIndent(depth) {
	return indent.repeat(depth);
}

function writeModule(depth, name, args, children) {
	return `${name}(${writeArgs(args)}) {
${children.map(c => writeIndent(depth+1) + writeNode(depth+1, c)).join('\n')}
${writeIndent(depth)}}`;
}

function writeObject(depth, name, args) {
	return `${name}(${writeArgs(args)});`;
}

function writeArgs(args) {
	return args.map(arg => writeValue(arg, true)).join(', ');
}

function writeValue(value, isArg = false) {
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	if (typeof value === 'string') {
		return '"' + string.replace(/"/g, '\"') + '"';
	}
	if (Array.isArray(value)) {
		return '[' + value.map(v => writeValue(v)).join(', ') + ']';
	}
	if (isArg) {
		return Object.entries(value)
			.map(([k, v]) => k + '=' + writeValue(v))
			.join(', ');
	}
	throw new Error('unexpected value ' + arg);
}

function writeModifier(depth, symbol, child) {
	return symbol + writeNode(depth, child);
}

function compile(node) {
	return writeNode(0, node);
}

function defineModule(name) {
	return (...args) => {
		const result = function scadModule(...children) {
			return { type: 'module', props: { name, args, children }};
		};
		Object.assign(result, { type: 'object', props: { name, args }});
		return result;
	};
}

function defineModifier(symbol) {
	return (child) => ({ type: 'modifier', props: { symbol, child }});
}

const modules = new Proxy({
	_bg: defineModifier('%'),
	_debug: defineModifier('#'),
	_root: defineModifier('!'),
	_disable: defineModifier('*'),
}, {
	get: (obj, prop) => prop in obj ? obj[prop] : defineModule(prop)
});

function globals(tryLookup) {
	return new Proxy({}, {
		get(_, prop) {
			return modules[prop];
		},
		has(_, prop) {
			if (!/^(?:[$_\p{ID_Start}])(?:[$_\u200C\u200D\p{ID_Continue}])*$/u.test(prop)) {
				return false;
			}
			try {
				tryLookup(prop);
				return false;
			} catch (e) {
				return true;
			}
		}
	});
}

module.exports = {
	compile,
	modules,
	globals,
};
