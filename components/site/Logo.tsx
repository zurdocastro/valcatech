export default function Logo({ size = 32, dark = false, wordmark = true }: { size?: number; dark?: boolean; wordmark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="valca-grad" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4C3A8F" />
            <stop offset="1" stopColor="#7E5BD6" />
          </linearGradient>
        </defs>
        {/* Angular fragment — the same triangular glyph the constellation is made of */}
        <path d="M20 3 L37 34 L26 34 L20 22 L14 34 L3 34 Z" fill="url(#valca-grad)" />
        <path d="M20 27.5 L23.2 34 L16.8 34 Z" fill="#B8FF2E" />
      </svg>
      {wordmark && (
        <span style={{ fontWeight: 400, fontSize: size * 0.68, color: dark ? "#FAF9F5" : "var(--t-hi)", letterSpacing: "-0.03em" }}>
          VALCA<span style={{ color: dark ? "rgba(250,249,245,.55)" : "var(--t-mute)" }}> Tech</span>
        </span>
      )}
    </span>
  );
}
