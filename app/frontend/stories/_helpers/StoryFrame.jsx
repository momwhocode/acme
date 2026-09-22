/** Centered canvas for April component stories */
export function StoryFrame({ children, width = "min(100%, 480px)", padding = 24 }) {
  return (
    <div
      style={{
        padding,
        display: "grid",
        placeItems: "start",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width }}>{children}</div>
    </div>
  );
}
