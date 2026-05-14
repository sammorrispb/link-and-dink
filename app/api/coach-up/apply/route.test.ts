import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

// --- Mocks --------------------------------------------------------------

const insertMock = vi.fn();
const sendMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

vi.mock("@/lib/email", () => ({
  getEmailProvider: () => ({ name: "test", send: sendMock }),
}));

// --- Helpers ------------------------------------------------------------

function post(body: unknown): Request {
  return new Request("https://www.linkanddink.com/api/coach-up/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID = {
  name: "Jordan Player",
  email: "jordan@example.com",
  phone: "(301) 555-0142",
  neighborhood: "Silver Spring, MD",
  why: "I get stopped at open play for tips and want to do it for real.",
  hoursPerWeek: "5–10 hours",
};

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue({ error: null });
  sendMock.mockReset().mockResolvedValue({ id: "test-1" });
  process.env.COACH_UP_NOTIFY_EMAIL = "sam@linkanddink.com";
});

// --- Tests --------------------------------------------------------------

describe("POST /api/coach-up/apply", () => {
  it("saves a valid application and notifies Sam", async () => {
    const res = await POST(post(VALID));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });

    expect(insertMock).toHaveBeenCalledOnce();
    const row = insertMock.mock.calls[0][0];
    expect(row.email).toBe("jordan@example.com");
    expect(row.source).toBe("coach_up_apply");
    expect(row.id).toMatch(/[0-9a-f-]{36}/);

    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock.mock.calls[0][0].to).toBe("sam@linkanddink.com");
  });

  it("treats a filled honeypot as success without inserting", async () => {
    const res = await POST(post({ ...VALID, company: "spammer co" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email with 400", async () => {
    const res = await POST(post({ ...VALID, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a missing required field with 400", async () => {
    const res = await POST(post({ ...VALID, name: "" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a missing 'why' with 400", async () => {
    const res = await POST(post({ ...VALID, why: "" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("still returns ok when the notification email fails (soft fail)", async () => {
    sendMock.mockResolvedValue({ error: "provider down" });
    const res = await POST(post(VALID));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("returns 500 when the database insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom" } });
    const res = await POST(post(VALID));
    expect(res.status).toBe(500);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
