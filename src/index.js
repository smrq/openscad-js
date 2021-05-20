const indent = '\t';

class ScadNode {
	constructor(type, props) {
		this.type = type;
		this.props = props;
	}

	toString() {
		return writeNode(0, this);
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

function defineModule(name) {
	return (...args) => {
		const result = function scadModule(...children) {
			return new ScadNode('module', { name, args, children });
		};
		Object.setPrototypeOf(result, ScadNode);
		result.type = 'object';
		result.props = { name, args };
		return result;
	};
}

function defineModifier(symbol) {
	return (child) => new ScadNode('modifier', { symbol, child });
}

const modules = new Proxy({
	_bg: defineModifier('%'),
	_debug: defineModifier('#'),
	_root: defineModifier('!'),
	_disable: defineModifier('*'),
}, {
	get: (obj, prop) => prop in obj ? obj[prop] : defineModule(prop)
});

const globals = new Proxy({}, {
	get(_, prop) {
		if (prop === Symbol.unscopables) {
			return;
		}
		try {
			return eval(prop);
		} catch (e) {
			return modules[prop];
		}
	},
	has() { return true; }
});

module.exports = {
	modules,
	globals,
};
