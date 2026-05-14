/**
 * Link & Dink paddle-pair mark. Spruce rounded-square field, two lime paddles,
 * a smoke-white ball. `variant="single"` is the simpler one-circle mark used on
 * the P3 confirmation screen.
 */
export function Logo({
  size = 24,
  variant = "paddles",
}: {
  size?: number;
  variant?: "paddles" | "single";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="9" fill="#044026" />
      {variant === "single" ? (
        <circle cx="12" cy="12" r="6" fill="#b5d654" />
      ) : (
        <>
          <ellipse cx="9" cy="10" rx="3.4" ry="4.3" transform="rotate(-22 9 10)" fill="#b5d654" />
          <ellipse cx="15" cy="13" rx="3.4" ry="4.3" transform="rotate(-22 15 13)" fill="#b5d654" />
          <circle cx="12" cy="7" r="1.7" fill="#fffdfa" />
        </>
      )}
    </svg>
  );
}
