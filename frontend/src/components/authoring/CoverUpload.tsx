"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadCover } from "@/lib/actions/authoring";

/** Uploads a cover image as soon as it's picked; the form submits the resulting URL. */
export function CoverUpload({ defaultUrl }: { defaultUrl: string | null }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const form = new FormData();
    form.append("file", file);
    startTransition(async () => {
      const result = await uploadCover(form);
      if ("url" in result) setUrl(result.url);
      else setError(result.error);
      if (input.current) input.current.value = "";
    });
  };

  return (
    <div className="cover-upload">
      <span className="cover-upload__label">Cover image:</span>
      <input type="hidden" name="cover_url" value={url} />
      {url ? (
        <Image
          src={url}
          alt="Cover preview"
          width={480}
          height={270}
          className="cover-upload__preview"
        />
      ) : (
        <p className="field-hint">No cover yet. A default image is used until you add one.</p>
      )}
      <div className="cover-upload__actions">
        <label className="engagement-button">
          <i className="fa-solid fa-image" aria-hidden="true"></i>{" "}
          {pending ? "Uploading…" : url ? "Replace image" : "Upload image"}
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={pending}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </label>
        {url && !pending && (
          <button type="button" className="link-button" onClick={() => setUrl("")}>
            Remove
          </button>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
