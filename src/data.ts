/* Tech Graph — graph data (React port, same content as vanilla).

Nodes = languages / language-like abstractions.
Edges = technologies (typically programs) connecting nodes, of two types:
  - interpret  : the source is interpreted/executed by the target
  - translate  : the source is translated/compiled into the target
*/

export type EdgeType = 'interpret' | 'translate';

export interface NodeTypeDef {
  color: string;
}

export interface Node {
  id: string;
  label: string;
  root?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
}

export const NODE_TYPES: Record<string, NodeTypeDef> = {
  default: { color: '#2563eb' },
};

export const NODES: Node[] = [
  { id: 'physical-hardware', label: 'physical hardware', root: true },
  { id: 'x86-machine-code', label: 'x86 machine code' },
  { id: 'arm-machine-code', label: 'ARM machine code' },
  { id: 'intel-assembly', label: 'Intel Assembly' },
  { id: 'arm-assembly',   label: 'ARM Assembly'   },
  { id: 'c',      label: 'C'              },
  { id: 'cpp',    label: 'C++',           },
  { id: 'java',   label: 'Java',          },
  { id: 'python', label: 'Python',        },
  { id: 'java-bytecode',   label: 'Java bytecode',   },
  { id: 'python-bytecode', label: 'Python bytecode', },
];

/**
 * Estimate the box dimensions needed to fit a node's label.
 * Wraps words at maxWidth, then computes width from the longest line
 * and height from the line count, plus padding.
 */
function computeNodeDimensions(label: string): { width: number; height: number } {
  const fontSize = 10;
  const charWidth = fontSize * 0.5; // conservative avg char width (px)
  const lineHeight = fontSize * 1.25;
  const paddingX = 10;
  const paddingY = 6;
  const maxWidth = 120;

  const charsPerLine = Math.floor(maxWidth / charWidth);

  // Simple word wrap to count lines and find the longest line.
  const words = label.split(' ');
  let lines = 1;
  const lineLengths: number[] = [];
  let lineLen = 0;

  for (const word of words) {
    const wl = word.length;
    if (lineLen === 0) {
      lineLen = wl;
    } else if (lineLen + 1 + wl <= charsPerLine) {
      lineLen += 1 + wl;
    } else {
      lineLengths.push(lineLen);
      lineLen = wl;
      lines++;
    }
  }
  lineLengths.push(lineLen);
  const maxLineLen = Math.max(...lineLengths);

  const width = Math.max(maxLineLen * charWidth + paddingX, 32);
  const height = Math.max(lines * lineHeight + paddingY, 20);

  return { width, height };
}

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
      root: !!n.root,
      color: NODE_TYPES.default.color,
      ...computeNodeDimensions(n.label),
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
