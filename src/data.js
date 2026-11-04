/* Tech Graph — graph data (React port, same content as vanilla).

Nodes = languages / language-like abstractions.
Edges = technologies (typically programs) connecting nodes, of two types:
  - interpret  : the source is interpreted/executed by the target
  - translate  : the source is translated/compiled into the target
*/

export const NODE_TYPES = {
  hardware:   { color: '#6b7280', size: 44 },
  language:   { color: '#2563eb', size: 34 },
  assembly:   { color: '#7c3aed', size: 30 },
  'machine-code': { color: '#0ea5e9', size: 28 },
  bytecode:   { color: '#14b8a6', size: 26 },
  runtime:    { color: '#15803d', size: 30 },
  engine:     { color: '#b45309', size: 26 },
};

export const NODES = [
  { id: 'physical-hardware', label: 'physical hardware', type: 'hardware', root: true },
  { id: 'x86-processor',   label: 'x86 processor',   type: 'hardware' },
  { id: 'arm-processor',   label: 'ARM processor',   type: 'hardware' },
  { id: 'x86-machine-code', label: 'x86 machine code', type: 'machine-code' },
  { id: 'arm-machine-code', label: 'ARM machine code', type: 'machine-code' },
  { id: 'intel-assembly', label: 'Intel Assembly', type: 'assembly' },
  { id: 'arm-assembly',   label: 'ARM Assembly',   type: 'assembly' },
  { id: 'c',      label: 'C',              type: 'language' },
  { id: 'cpp',    label: 'C++',            type: 'language' },
  { id: 'java',   label: 'Java',           type: 'language' },
  { id: 'js',     label: 'JavaScript',     type: 'language' },
  { id: 'python', label: 'Python',         type: 'language' },
  { id: 'java-bytecode',   label: 'Java bytecode',   type: 'bytecode' },
  { id: 'python-bytecode', label: 'Python bytecode', type: 'bytecode' },
  { id: 'jvm',      label: 'JVM',          type: 'runtime' },
  { id: 'cpython',  label: 'CPython',      type: 'runtime' },
  { id: 'browser',  label: 'web browser',  type: 'runtime' },
  { id: 'nodejs',   label: 'Node.js',      type: 'runtime' },
  { id: 'v8',       label: 'V8',           type: 'engine' },
];

export const EDGES = [
  { id: 'e1', source: 'x86-machine-code', target: 'x86-processor', type: 'interpret', label: 'x86 CPU' },
  { id: 'e2', source: 'x86-processor',   target: 'physical-hardware', type: 'interpret', label: 'x86 processor' },
  { id: 'e3', source: 'arm-processor',   target: 'physical-hardware', type: 'interpret', label: 'ARM processor' },
  { id: 'e4', source: 'intel-assembly', target: 'x86-machine-code', type: 'translate', label: 'Intel Assembler' },
  { id: 'e5', source: 'arm-assembly',   target: 'arm-machine-code',   type: 'translate', label: 'ARM Assembler' },
  { id: 'e6',  source: 'c', target: 'intel-assembly', type: 'translate', label: 'C compiler (gcc)' },
  { id: 'e7',  source: 'c', target: 'arm-assembly',   type: 'translate', label: 'C compiler (gcc)' },
  { id: 'e8',  source: 'cpp', target: 'intel-assembly', type: 'translate', label: 'C++ compiler' },
  { id: 'e9',  source: 'java', target: 'java-bytecode', type: 'translate', label: 'javac' },
  { id: 'e10', source: 'java-bytecode', target: 'jvm', type: 'interpret', label: 'JVM' },
  { id: 'e11', source: 'jvm', target: 'x86-processor', type: 'interpret', label: 'JIT' },
  { id: 'e12', source: 'jvm', target: 'arm-processor', type: 'interpret', label: 'JIT' },
  { id: 'e13', source: 'python', target: 'python-bytecode', type: 'translate', label: 'CPython compiler' },
  { id: 'e14', source: 'python-bytecode', target: 'cpython', type: 'interpret', label: 'CPython' },
  { id: 'e15', source: 'cpython', target: 'x86-processor', type: 'interpret', label: 'CPython' },
  { id: 'e16', source: 'js', target: 'browser', type: 'interpret', label: 'JS engine' },
  { id: 'e17', source: 'js', target: 'nodejs', type: 'interpret', label: 'Node.js (V8)' },
  { id: 'e18', source: 'js', target: 'x86-processor', type: 'interpret', label: 'V8 JIT' },
  { id: 'e19', source: 'v8', target: 'nodejs', type: 'translate', label: 'bundled with' },
];

export function toCyElements() {
  const nodeEls = NODES.map((n) => {
    const t = NODE_TYPES[n.type] || NODE_TYPES.language;
    return {
      group: 'nodes',
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        root: !!n.root,
        color: t.color,
        size: n.root ? t.size + 14 : t.size,
      },
    };
  });

  const edgeEls = EDGES.map((e) => {
    const isInterpret = e.type === 'interpret';
    return {
      group: 'edges',
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: e.type,
        color: isInterpret ? '#3b82f6' : '#f59e0b',
        width: 2,
        style: isInterpret ? 'solid' : 'dashed',
      },
    };
  });

  return [...nodeEls, ...edgeEls];
}
