interface IconProps {
  name: "chat" | "file" | "send" | "spark" | "attach" | "close" | "plus";
  size?: number;
}

const paths: Record<IconProps["name"], string> = {
  chat: "M4 4h16v11H7l-3 3V4z",
  file: "M6 2h8l4 4v16H6V2zm8 0v4h4",
  send: "M3 11l18-8-8 18-2-8-8-2z",
  spark: "M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z",
  attach: "M9 11l5-5a3 3 0 014 4l-7 7a5 5 0 01-7-7l6-6",
  close: "M6 6l12 12M6 18L18 6",
  plus: "M12 5v14M5 12h14",
};

export default function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
