"use client";

import { useEffect, useId, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { contact } from "@/lib/site";
import { projects } from "@/data/projects";

interface IFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: hidden from people, filled in by bots (see the function). */
  company: string;
}

type VisibleField = Exclude<keyof IFormInput, "company">;
const VISIBLE_FIELDS: VisibleField[] = ["name", "email", "subject", "message"];

type Status = { kind: "idle" } | { kind: "sent" } | { kind: "error"; message: string };

const fallbackError = `Your message couldn’t be sent. Try again, or email ${contact.email} directly.`;

// Handled by the route in app/api/contact/route.ts, which validates the
// message and forwards it to the Laravel API server-side.
const CONTACT_ENDPOINT = "/api/contact";

type ApiResult = { message?: unknown; errors?: Record<string, unknown> };

function readMessage(result: ApiResult | null): string {
  return typeof result?.message === "string" && result.message.trim() ? result.message : fallbackError;
}

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    setFocus,
    setError,
  } = useForm<IFormInput>({ shouldFocusError: true });

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const id = useId();

  // Arriving from a project story's "Start a similar project"
  // (/contact?project=<id>#project-form): name the project in the subject
  // and put the cursor in the first field, ready to write.
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get("project");
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    if (!getValues("subject")) setValue("subject", `A project like ${project.title}`);
    // The page has already scrolled to the form, so this is in view.
    requestAnimationFrame(() => setFocus("name"));
  }, [getValues, setValue, setFocus]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json().catch(() => null)) as ApiResult | null;
      if (!res.ok) {
        // Field-level errors (from the function or Laravel) go on their
        // fields, and focus moves to the first one.
        let focused = false;
        for (const field of VISIBLE_FIELDS) {
          const messages = result?.errors?.[field];
          const message = Array.isArray(messages) ? messages[0] : undefined;
          if (typeof message !== "string") continue;
          setError(field, { type: "server", message }, { shouldFocus: !focused });
          focused = true;
        }
        setStatus({ kind: "error", message: readMessage(result) });
        return;
      }
      setStatus({ kind: "sent" });
      reset();
    } catch {
      setStatus({ kind: "error", message: fallbackError });
    }
  };

  const fieldProps = (name: VisibleField) => ({
    id: `${id}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  const fieldError = (name: VisibleField) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="field-error">
        {errors[name]?.message}
      </p>
    ) : null;

  return (
    <form id="contact-form" noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            Name
          </label>
          <input
            {...fieldProps("name")}
            {...register("name", { required: "Enter your name." })}
            autoComplete="name"
            className="field"
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor={`${id}-email`} className="field-label">
            Email
          </label>
          <input
            {...fieldProps("email")}
            {...register("email", {
              required: "Enter your email address so I can reply.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter an email address in the format name@example.com.",
              },
            })}
            type="email"
            autoComplete="email"
            inputMode="email"
            className="field"
          />
          {fieldError("email")}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-subject`} className="field-label">
          Subject
        </label>
        <input
          {...fieldProps("subject")}
          {...register("subject", { required: "Add a subject, for example “New website”." })}
          className="field"
        />
        {fieldError("subject")}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="field-label">
          Message
        </label>
        <textarea
          {...fieldProps("message")}
          {...register("message", { required: "Tell me a little about your project." })}
          rows={7}
          placeholder="What are you building, and what would you like help with?"
          className="field resize-y"
        />
        {fieldError("message")}
      </div>

      {/* Honeypot. Off-screen rather than display:none (some bots skip
          hidden fields), and out of the tab order and accessibility tree. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} {...register("company")} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary sm:min-w-48">
          {isSubmitting ? "Sending…" : "Send message"}
        </button>

        <div role="status" aria-live="polite" className="t-small">
          {status.kind === "sent" && (
            <p className="flex items-center gap-2 text-success">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              Message sent. I’ll get back to you shortly.
            </p>
          )}
        </div>
      </div>

      {status.kind === "error" && (
        <p role="alert" className="border-l-2 border-danger pl-4 text-danger">
          {status.message}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
