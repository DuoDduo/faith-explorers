export function ReadTime({ minutes }: { minutes: number }) {
  return (
    <span className="meta flex">
      <i className="fa-regular fa-clock" aria-hidden="true"></i>
      <span>{minutes}</span>mins read
    </span>
  );
}
