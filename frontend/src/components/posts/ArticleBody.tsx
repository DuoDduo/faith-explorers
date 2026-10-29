import Markdown from "react-markdown";

/** Renders an article's Markdown body. Raw HTML in the source is not rendered. */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="article-body">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
