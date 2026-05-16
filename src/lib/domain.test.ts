import { describe, expect, it } from "vitest";
import { ageOnDate, ballColorFor, maxAgeFor } from "./domain";

describe("ageOnDate", () => {
  it("returns whole-year age for birthday before event day", () => {
    expect(ageOnDate("2015-01-15", "2026-05-16T18:00:00Z")).toBe(11);
  });

  it("does not advance age when birthday hasn't arrived yet", () => {
    expect(ageOnDate("2015-12-01", "2026-05-16T18:00:00Z")).toBe(10);
  });

  it("counts a birthday-on-event-day as the new age", () => {
    expect(ageOnDate("2015-05-16", "2026-05-16T18:00:00Z")).toBe(11);
  });

  it("returns negative when birthdate is in the future", () => {
    expect(ageOnDate("2030-01-01", "2026-05-16T18:00:00Z")).toBeLessThan(0);
  });
});

describe("youth bracket helpers", () => {
  it("maps brackets to the right cap and ball color", () => {
    expect(maxAgeFor("11U")).toBe(11);
    expect(maxAgeFor("14U")).toBe(14);
    expect(ballColorFor("11U")).toBe("Yellow ball");
    expect(ballColorFor("14U")).toBe("Green ball");
  });
});
