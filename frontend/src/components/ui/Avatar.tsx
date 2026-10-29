import Image from "next/image";

interface AvatarProps {
  src: string | null;
  /** Used for the initials shown when there's no photo. */
  name: string;
  size?: number;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((part) => part[0].toUpperCase()).join("");
}

export function Avatar({ src, name, size = 48 }: AvatarProps) {
  if (src) return <Image src={src} alt="" width={size} height={size} />;
  return (
    <span
      className="avatar-initials"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
