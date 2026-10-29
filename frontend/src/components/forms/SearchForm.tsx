import Form from "next/form";

/** GET form to /articles?q=…; next/form turns it into a client-side navigation. */
export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/articles" className="search-form" role="search" scroll={false}>
      <input
        type="search"
        name="q"
        placeholder="Search articles"
        aria-label="Search articles"
        defaultValue={defaultValue}
        key={defaultValue}
      />
      <button type="submit" aria-label="Search">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      </button>
    </Form>
  );
}
