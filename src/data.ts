/* Tech Graph — graph data (React port, same content as vanilla).

Nodes = languages / language-like abstractions.
Edges = technologies (typically programs) connecting nodes, of two types:
  - interpret  : the source is interpreted/executed by the target
  - translate  : the source is translated/compiled into the target
*/

export type EdgeType = 'interpret' | 'translate';

export interface NodeTypeDef {
  color: string;
  size: number;
}

export interface Node {
  id: string;
  label: string;
  type: string;
  root?: boolean;
  size?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
}

export const NODE_TYPES: Record<string, NodeTypeDef> = {
  default: { color: '#2563eb', size: 30 },
};

export const NODES: Node[] = [
  { id: 'physical-hardware', label: 'physical hardware', type: 'hardware', root: true, size: 44 },
  { id: 'x86-machine-code', label: 'x86 machine code', type: 'machine-code', size: 30 },
  { id: 'arm-machine-code', label: 'ARM machine code', type: 'machine-code', size: 30 },
  { id: 'intel-assembly', label: 'Intel Assembly', type: 'assembly', size: 30 },
  { id: 'arm-assembly',   label: 'ARM Assembly',   type: 'assembly', size: 30 },
  { id: 'c',      label: 'C',              type: 'language', size: 30 },
  { id: 'cpp',    label: 'C++',            type: 'language', size: 30 },
  { id: 'java',   label: 'Java',           type: 'language', size: 30 },
  { id: 'python', label: 'Python',         type: 'language', size: 30 },
  { id: 'java-bytecode',   label: 'Java bytecode',   type: 'bytecode', size: 30 },
  { id: 'python-bytecode', label: 'Python bytecode', type: 'bytecode', size: 30 },
];

export const EDGES: Edge[] = [
  { id: 'e1', source: 'x86-machine-code', target: 'physical-hardware', type: 'interpret', label: 'x86 processor' },
  { id: 'e2', source: 'arm-machine-code', target: 'physical-hardware', type: 'interpret', label: 'ARM processor' },
  { id: 'e3', source: 'intel-assembly', target: 'x86-machine-code', type: 'translate', label: 'Intel Assembler' },
  { id: 'e4', source: 'arm-assembly',   target: 'arm-machine-code',   type: 'translate', label: 'ARM Assembler' },
  { id: 'e5',  source: 'c', target: 'intel-assembly', type: 'translate', label: 'C compiler (gcc)' },
  { id: 'e6',  source: 'c', target: 'arm-assembly',   type: 'translate', label: 'C compiler (gcc)' },
  { id: 'e7',  source: 'cpp', target: 'intel-assembly', type: 'translate', label: 'C++ compiler' },
  { id: 'e8',  source: 'java', target: 'java-bytecode', type: 'translate', label: 'javac' },
  { id: 'e9',  source: 'python', target: 'python-bytecode', type: 'translate', label: 'CPython compiler' },
  { id: 'e10', source: 'java-bytecode', target: 'physical-hardware', type: 'interpret', label: 'JVM' },
  { id: 'e11', source: 'python-bytecode', target: 'physical-hardware', type: 'interpret', label: 'CPython' },
];

export function toCyElements(): cytoscape.ElementDefinition[] {
  const nodeEls: cytoscape.ElementDefinition[] = NODES.map((n) => ({
    group: 'nodes' as const,
    data: {
      id: n.id,
      label: n.label,
      type: n.type,
      root: !!n.root,
      color: (NODE_TYPES[n.type]?.color) ?? NODE_TYPES.default.color,
      size: n.size ?? NODE_TYPES.default.size,
    },
  }));

  const edgeEls: cytoscape.ElementDefinition[] = EDGES.map((e) => {
    const isInterpret = e.type === 'interpret';
    return {
      group: 'edges' as const,
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: e.type,
        color: isInterpret ? '#3b82f6' : '#f59e0b',
        width: 2,
      },
    };
  });

  return [...nodeEls, ...edgeEls];
}
