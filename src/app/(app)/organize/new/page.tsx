import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requireOrganizer } from "@/lib/organizer";
import { createClient } from "@/lib/supabase/server";
import { createEventAction } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-btn border border-border-medium bg-surface-2 px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-dim focus:border-lime focus:outline-none";
const labelClass = "mt-3 block text-[12px] text-text-muted";

export default async function NewEventPage() {
  const supabase = await createClient();
  await requireOrganizer(supabase);

  return (
    <MobileShell>
      <TopBar brand="pot-night" icon="⌃" backHref="/organize" />
      <main className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-[100px] pt-4">
        <h1 className="mb-1 text-[26px] font-black leading-tight tracking-[-0.03em]">
          Post a Pot Night
        </h1>
        <p className="mb-4 text-[14px] text-text-muted">
          Players RSVP at <code className="text-text">/pot/&lt;slug&gt;</code>. You get a roster you
          can drop into the popup bracket tool.
        </p>

        <form action={createEventAction} className="flex flex-col gap-3">
          <Card>
            <label className={labelClass} htmlFor="title">
              Event name
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="Pot Night — May 28"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="starts_at">
              Date &amp; time
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              className={inputClass}
            />

            <label className={labelClass} htmlFor="venue_name">
              Venue
            </label>
            <input
              id="venue_name"
              name="venue_name"
              required
              placeholder="Next Gen Pickleball Academy"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="venue_address">
              Address <span className="text-text-dim">(optional)</span>
            </label>
            <input
              id="venue_address"
              name="venue_address"
              placeholder="Olney, MD"
              className={inputClass}
            />
          </Card>

          <Card>
            <label className={labelClass} htmlFor="age_bracket">
              Age bracket
            </label>
            <select id="age_bracket" name="age_bracket" defaultValue="" className={inputClass}>
              <option value="">Adult / open</option>
              <option value="11U">11U · Yellow ball</option>
              <option value="14U">14U · Green ball</option>
            </select>

            <label className={labelClass} htmlFor="waiver_url">
              Waiver link <span className="text-text-dim">(youth events — optional)</span>
            </label>
            <input
              id="waiver_url"
              name="waiver_url"
              type="url"
              placeholder="https://…"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="bracket">
              Skill bracket
            </label>
            <input
              id="bracket"
              name="bracket"
              defaultValue="3.5-4.0 DUPR"
              className={inputClass}
              placeholder="e.g. 3.5-4.0 DUPR"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="pot_amount_dollars">
                  Pot ($)
                </label>
                <input
                  id="pot_amount_dollars"
                  name="pot_amount_dollars"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue="80"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="entry_fee_dollars">
                  Entry ($)
                </label>
                <input
                  id="entry_fee_dollars"
                  name="entry_fee_dollars"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue="0"
                  className={inputClass}
                />
              </div>
            </div>

            <label className={labelClass} htmlFor="pot_funder">
              Pot funder
            </label>
            <input
              id="pot_funder"
              name="pot_funder"
              placeholder="Sam Morris, JOOLA, etc."
              defaultValue="Sam Morris"
              className={inputClass}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="max_players">
                  Max players
                </label>
                <input
                  id="max_players"
                  name="max_players"
                  type="number"
                  step="1"
                  min="4"
                  max="16"
                  defaultValue="8"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="game_length">
                  Games to
                </label>
                <select id="game_length" name="game_length" className={inputClass}>
                  <option value="11">11</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </Card>

          <Button type="submit">Post event</Button>
          <p className="text-center text-[11px] text-text-dim">
            Format locked to RR → Single Elim (v1). You can edit text fields later.
          </p>
        </form>
      </main>
    </MobileShell>
  );
}
