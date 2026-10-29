export function ReadTime({ minutes }: { minutes: number }) {
  return (
    <h5 className="flex">
      <i className="fa-regular fa-clock" aria-hidden="true"></i>
      <span>{minutes}</span>mins read
    </h5>
  );
}
