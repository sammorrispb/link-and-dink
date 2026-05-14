"use client";

import { useState, useMemo, type FormEvent } from "react";
import { marked } from "marked";

type Issue = {
  id: string;
  title: string;
  subject: string;
  slug: string;
  preview_text: string | null;
  body_markdown: string;
  status: string;
};

export default function IssueEditor({ issue }: { issue?: Issue }) {
  const isNew = !issue;
  const editable = isNew || issue.status === "draft";
  const sendable = !isNew && issue.status === "draft";

  const [title, setTitle] = useState(issue?.title ?? "");
  const [subject, setSubject] = useState(issue?.subject ?? "");
  const [previewText, setPreviewText] = useState(issue?.preview_text ?? "");
  const [body, setBody] = useState(issue?.body_markdown ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [emailHtml, setEmailHtml] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const previewHtml = useMemo(
    () =>
      marked.parse(body || "_Nothing to preview yet._", {
        async: false,
      }) as string,
    [body],
  );

  function clearMsgs() {
    setMessage("");
    setError("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    clearMsgs();
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subject,
            preview_text: previewText,
            body_markdown: body,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.id) {
          window.location.assign(`/admin/issues/${data.id}`);
          return;
        }
        setError(data.error || "Couldn't save.");
      } else {
        const res = await fetch(`/api/admin/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subject,
            preview_text: previewText,
            body_markdown: body,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) setMessage("Saved.");
        else setError(data.error || "Couldn't save.");
      }
    } catch {
      setError("Couldn't save.");
    }
    setSaving(false);
  }

  async function handleEmailPreview() {
    if (isNew) return;
    clearMsgs();
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}/preview`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.html) setEmailHtml(data.html);
      else setError(data.error || "Couldn't render the email preview.");
    } catch {
      setError("Couldn't render the email preview.");
    }
  }

  async function handleTest() {
    if (isNew || !testEmail) return;
    clearMsgs();
    setTestBusy(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMessage(`Test sent to ${testEmail}.`);
      else setError(data.error || "Couldn't send the test.");
    } catch {
      setError("Couldn't send the test.");
    }
    setTestBusy(false);
  }

  async function handleDelete() {
    if (isNew) return;
    clearMsgs();
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.assign("/admin");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't delete.");
    } catch {
      setError("Couldn't delete.");
    }
    setDeleteBusy(false);
  }

  async function handleSend() {
    if (isNew) return;
    clearMsgs();
    setSendBusy(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}/send`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(
          `Queued for ${data.recipientCount} subscriber(s). It'll send over the next few minutes.`,
        );
        setConfirmingSend(false);
        setTimeout(() => window.location.reload(), 1800);
      } else {
        setError(data.error || "Couldn't send.");
      }
    } catch {
      setError("Couldn't send.");
    }
    setSendBusy(false);
  }

  return (
    <div className="admin-editor">
      {!isNew && (
        <div className="admin-editor-status">
          Status:{" "}
          <span className={`admin-badge admin-badge-${issue.status}`}>
            {issue.status}
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-form">
        <label>
          <span>Title (internal + archive heading)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={!editable}
          />
        </label>
        <label>
          <span>Email subject line</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            disabled={!editable}
          />
        </label>
        <label>
          <span>Preview text (inbox snippet)</span>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            disabled={!editable}
          />
        </label>

        <div className="admin-editor-split">
          <label>
            <span>Body (markdown)</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              disabled={!editable}
            />
          </label>
          <div className="admin-editor-preview">
            <span className="admin-editor-preview-label">Live preview</span>
            <div
              className="admin-editor-preview-body"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>

        {editable && (
          <div className="admin-editor-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving…" : isNew ? "Create issue" : "Save"}
            </button>
          </div>
        )}
      </form>

      {!isNew && (
        <div className="admin-editor-tools">
          <div className="admin-tool">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleEmailPreview}
            >
              Email preview
            </button>
          </div>

          {sendable && (
            <>
              <div className="admin-tool">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Test email address"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTest}
                  disabled={testBusy || !testEmail}
                >
                  {testBusy ? "Sending…" : "Send test"}
                </button>
              </div>

              <div className="admin-tool">
                {confirmingSend ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSend}
                      disabled={sendBusy}
                    >
                      {sendBusy ? "Queuing…" : "Confirm — send to all"}
                    </button>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => setConfirmingSend(false)}
                      disabled={sendBusy}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setConfirmingSend(true)}
                  >
                    Send to all subscribers
                  </button>
                )}
              </div>

              <div className="admin-tool admin-tool-danger">
                {confirmingDelete ? (
                  <>
                    <button
                      type="button"
                      className="admin-link-btn admin-link-danger"
                      onClick={handleDelete}
                      disabled={deleteBusy}
                    >
                      {deleteBusy ? "Deleting…" : "Confirm — delete draft"}
                    </button>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleteBusy}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="admin-link-btn admin-link-danger"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete draft
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {message && (
        <p className="admin-msg" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="signup-error" role="alert">
          {error}
        </p>
      )}

      {emailHtml && (
        <div className="admin-email-preview">
          <span className="admin-editor-preview-label">
            Email preview (as sent)
          </span>
          <iframe
            title="Email preview"
            srcDoc={emailHtml}
            className="admin-email-frame"
          />
        </div>
      )}
    </div>
  );
}
