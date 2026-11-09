/* Tech Graph — edge-type key (bottom left).

Shows the two edge colours used on the graph so the reader can tell
interpret edges from translate edges at a glance.
*/

export default function Key() {
  return (
    <div className="key">
      <div className="key-title">Edge types</div>
      <div className="key-row">
        <span className="key-swatch key-swatch--interpret" />{' '}
        interpret
      </div>
      <div className="key-row">
        <span className="key-swatch key-swatch--translate" />{' '}
        translate
      </div>
    </div>
  );
}
