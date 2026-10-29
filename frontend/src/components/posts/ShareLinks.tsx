import { CopyLinkButton } from "@/components/posts/CopyLinkButton";
import { shareLinks } from "@/lib/share";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  return (
    <section className="share-links" aria-labelledby="share-heading">
      <h2 id="share-heading">Share this article</h2>
      <ul className="flex">
        {shareLinks(url, title).map((link) => (
          <li key={link.network}>
            <a
              href={link.href}
              className={`share-link share-link--${link.network}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={link.icon} aria-hidden="true"></i>
              <span className="sr-only">Share on </span>
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} />
        </li>
      </ul>
    </section>
  );
}
