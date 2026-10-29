import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  name: string;
  label: string;
  error?: string;
} & (
  | ({ multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | ({ multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)
);

/** Labelled input/textarea with an accessible error message. */
export function FormField({ name, label, error, multiline, ...rest }: FieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea {...shared} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && (
        <div className="error" id={errorId}>
          {error}
        </div>
      )}
    </>
  );
}
