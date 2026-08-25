export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M16 2.5 27 8.8v12.4L16 27.5 5 21.2V8.8L16 2.5Z"
        fill="#0B3D25"
      />
      <path
        d="M17.2 6.7 10.8 17h4.5l-1.1 8.1L21.4 14h-4.8l.6-7.3Z"
        fill="white"
      />
    </svg>
  );
}
