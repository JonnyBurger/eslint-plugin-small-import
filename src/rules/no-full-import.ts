const isStaticRequire = (node): boolean => {
	return (
		node?.callee &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'require' &&
		node.arguments.length === 1 &&
		node.arguments[0].type === 'Literal' &&
		typeof node.arguments[0].value === 'string'
	);
};

function reportIfMissing(packages, context, node, name, tokens): void {
	if (Object.keys(packages).includes(name)) {
		const filtered = tokens
			.filter(t => {
				return [
					t.key && t.key.type === 'Identifier',
					t.type === 'ImportSpecifier' &&
						Object.keys(packages).includes(t.parent.source.value)
				].some(Boolean);
			})
			.map(t => {
				if (t.imported) {
					return t.imported.name;
				}
				if (t.key) {
					return t.key.name;
				}
				return t.value;
			})
			.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
		if (filtered.length > 0) {
			context.report({
				node,
				message: `Import only this function instead of the whole ${name} package`,
				fix: fixer => {
					const replacement = filtered
						.map(f => {
							return `import ${f} from "${name}/${f}"`;
						})
						.join('\n');
					return fixer.replaceText(node, replacement);
				}
			});
		}
	}
}

export default {
	meta: {
		type: 'suggestion',
		fixable: 'code'
	},

	create(context): any {
		const options = context.options[0] || {};
		if (options.packages) {
			if (typeof options.packages !== 'object') {
				throw new TypeError(
					"The 'packages' option must be an object of libraries that should be linted, where the keys are the names of the libraries and the values are the location where the separate exports are located. Refer to README to learn more."
				);
			}
			if (!Object.values(options.packages).every(v => typeof v === 'string')) {
				throw new TypeError(
					"The 'packages' option must be an object of libraries that should be linted, where the keys are the names of the libraries and the values are the location where the separate exports are located. Refer to README to learn more."
				);
			}
		}
		const packages = options.packages || {
			lodash: '/',
			'date-fns': '/',
			rambda: '/src/'
		};

		return {
			ImportDeclaration: function handleImports(node): void {
				const parentNode = node.parent.body.find(
					b =>
						b.type === 'ImportDeclaration' &&
						Object.keys(packages).includes(b.source.value)
				);
				reportIfMissing(
					packages,
					context,
					node,
					node.source.value,
					parentNode ? parentNode.specifiers : node.parent.tokens
				);
			},
			CallExpression: function handleRequires(node): void {
				if (isStaticRequire(node) && node.parent.id) {
					reportIfMissing(
						packages,
						context,
						node,
						node.arguments[0].value,
						node.parent.id.properties
					);
				}
			}
		};
	}
};
