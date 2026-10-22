/** Decorative KPay-style liquid waves for balance / countdown cards. */
export function WaveBackdrop() {
  return (
    <div className="wave-backdrop" aria-hidden>
      <span className="wave-blob wave-blob-a" />
      <span className="wave-blob wave-blob-b" />
      <span className="wave-blob wave-blob-c" />
      <span className="wave-sheen" />
    </div>
  )
}
