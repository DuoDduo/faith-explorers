import Image from "next/image";

const FALLBACK = "/images/faith.png";

export function Avatar({ src, size = 48 }: { src: string | null; size?: number }) {
  return <Image src={src ?? FALLBACK} alt="" width={size} height={size} />;
}
