"use client";

import { useActionState } from "react";
import { CoverUpload } from "@/components/authoring/CoverUpload";
import { MarkdownField } from "@/components/authoring/MarkdownField";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { savePost } from "@/lib/actions/authoring";
import { initialFormState } from "@/lib/actions/form-state";
import type { Category, MyPost } from "@/types/api";

interface PostEditorProps {
  /** The post being edited, or undefined for a new draft. */
  post?: MyPost;
  categories: Category[];
}

export function PostEditor({ post, categories }: PostEditorProps) {
  const [state, formAction, pending] = useActionState(
    savePost.bind(null, post?.id ?? null),
    initialFormState,
  );
  const errors = state.fieldErrors ?? {};
  // After a submit, refill from what was sent (React resets uncontrolled fields).
  const value = (field: string, fallback = "") => state.values?.[field] ?? fallback;

  return (
    <form className="contact-form post-editor" action={formAction} noValidate>
      <FormField
        name="title"
        label="Title:"
        required
        maxLength={200}
        defaultValue={value("title", post?.title)}
        error={errors.title}
      />
      <FormField
        name="excerpt"
        label="Summary (shown on article cards):"
        multiline
        rows={3}
        maxLength={500}
        required
        defaultValue={value("excerpt", post?.excerpt)}
        error={errors.excerpt}
      />

      <div className="post-editor__row">
        <div>
          <label htmlFor="field-category">Category:</label>
          <select
            id="field-category"
            name="category"
            defaultValue={value("category", post?.category.slug)}
            aria-invalid={errors.category ? true : undefined}
          >
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <div className="error">{errors.category}</div>}
        </div>
        <div>
          <FormField
            name="tags"
            label="Tags (comma separated):"
            placeholder="prayer, family, hope"
            defaultValue={value("tags", post?.tags.map((t) => t.name).join(", "))}
            error={errors.tags}
          />
        </div>
      </div>

      <CoverUpload defaultUrl={value("cover_url", post?.cover_url ?? "") || null} />

      <MarkdownField
        name="body"
        label="Article:"
        defaultValue={value("body", post?.body)}
        error={errors.body}
      />

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : post ? "Save changes" : "Save draft"}
      </button>
      <FormStatus state={state} />
    </form>
  );
}
