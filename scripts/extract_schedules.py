#!/usr/bin/env python3
"""Extract Sched-RP-* and Sched-SP-* schedules from the tournament rundowns
xlsx into TypeScript that the engine consumes.

Usage:
    python3 scripts/extract_schedules.py \
        docs/tournament/artifacts/tournament_format_rundowns_4-18.xlsx \
        > src/lib/tournament/schedules.ts

Reads the xlsx directly via the stdlib `zipfile` module — no third-party deps.
"""
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
PKG_REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def col_letters(n: int) -> str:
    """1 -> A, 2 -> B, ..., 27 -> AA."""
    out = ""
    while n:
        n, r = divmod(n - 1, 26)
        out = chr(65 + r) + out
    return out


def read_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    with zf.open("xl/sharedStrings.xml") as f:
        tree = ET.parse(f)
    return [
        "".join(t.text or "" for t in si.iter(NS + "t"))
        for si in tree.iter(NS + "si")
    ]


def sheet_targets(zf: zipfile.ZipFile) -> dict[str, str]:
    """name -> sheet xml path (inside xl/)."""
    with zf.open("xl/workbook.xml") as f:
        wb = ET.parse(f).getroot()
    with zf.open("xl/_rels/workbook.xml.rels") as f:
        rels = ET.parse(f).getroot()
    rel_target = {
        r.get("Id"): r.get("Target") for r in rels.iter(PKG_REL_NS + "Relationship")
    }
    out = {}
    for s in wb.iter(NS + "sheet"):
        rid = s.get(REL_NS + "id")
        out[s.get("name")] = "xl/" + rel_target[rid]
    return out


def read_grid(zf: zipfile.ZipFile, path: str, ss: list[str]) -> dict[str, str]:
    with zf.open(path) as f:
        tree = ET.parse(f)
    grid = {}
    for c in tree.iter(NS + "c"):
        ref = c.get("r")
        t = c.get("t")
        v = c.find(NS + "v")
        if v is None:
            continue
        val = v.text
        if t == "s":
            val = ss[int(val)]
        grid[ref] = val
    return grid


def is_round_header(s) -> bool:
    if not isinstance(s, str):
        return False
    return s.startswith("Round ") or s.strip() == "Crossover"


def find_round_header_row(grid):
    for r in range(1, 50):
        b = grid.get(f"B{r}", "")
        if isinstance(b, str) and b.strip() == "Round 1":
            return r
    return None


def player_num(s):
    if not s:
        return None
    m = re.match(r"Player\s+(\d+)", s)
    return int(m.group(1)) if m else None


def team_num(s):
    if not s:
        return None
    m = re.match(r"Team\s+(\d+)", s)
    return int(m.group(1)) if m else None


def find_round_cols(grid, hdr):
    cols, n = [], 2
    while True:
        letter = col_letters(n)
        val = grid.get(f"{letter}{hdr}", "")
        if is_round_header(val):
            cols.append(letter)
            n += 2
        else:
            break
    return cols


def parse_sched_rp(grid):
    hdr = find_round_header_row(grid)
    if hdr is None:
        raise ValueError("no round header row")
    round_cols = find_round_cols(grid, hdr)
    court_rows = []
    for r in range(hdr + 1, hdr + 40):
        a = grid.get(f"A{r}", "")
        if isinstance(a, str) and a.startswith("Court "):
            court_rows.append(r)

    rounds, sit_outs = [], []
    for col in round_cols:
        round_matches = []
        round_players = set()
        for court_r in court_rows:
            a1 = player_num(grid.get(f"{col}{court_r + 1}"))
            a2 = player_num(grid.get(f"{col}{court_r + 2}"))
            b1 = player_num(grid.get(f"{col}{court_r + 4}"))
            b2 = player_num(grid.get(f"{col}{court_r + 5}"))
            if None in (a1, a2, b1, b2):
                continue
            round_matches.append({"a": [a1, a2], "b": [b1, b2]})
            round_players.update([a1, a2, b1, b2])
        rounds.append(round_matches)
        sit_outs.append(round_players)

    title = (grid.get("A1") or "") + " " + (grid.get("A2") or "")
    m = re.search(r"(\d+)\s+Players", title)
    if m:
        player_count = int(m.group(1))
    else:
        all_players = set()
        for round_matches in rounds:
            for match in round_matches:
                all_players.update(match["a"])
                all_players.update(match["b"])
        player_count = max(all_players) if all_players else 0
    courts = len(court_rows)
    byes = [
        sorted(set(range(1, player_count + 1)) - p) for p in sit_outs
    ]
    return {
        "playerCount": player_count,
        "courts": courts,
        "rrRounds": len(rounds),
        "schedule": rounds,
        "byes": byes,
    }


def parse_sched_sp(grid):
    hdr = None
    for r in range(1, 50):
        b = grid.get(f"B{r}", "")
        if isinstance(b, str) and b.strip() == "Round 1":
            hdr = r
            break
    if hdr is None:
        raise ValueError("no round header row")
    round_cols = find_round_cols(grid, hdr)
    slot_rows = []
    sitting_row = None
    for r in range(hdr + 1, hdr + 40):
        a = grid.get(f"A{r}", "")
        if isinstance(a, str) and a.startswith("Game Slot"):
            slot_rows.append(r)
        if isinstance(a, str) and a.strip() == "Sitting Out":
            sitting_row = r

    rounds, byes = [], []
    for col in round_cols:
        round_matches = []
        for slot_r in slot_rows:
            a = team_num(grid.get(f"{col}{slot_r + 1}"))
            b = team_num(grid.get(f"{col}{slot_r + 3}"))
            if a is None or b is None:
                continue
            round_matches.append({"a": a, "b": b})
        rounds.append(round_matches)
        if sitting_row is not None:
            t = team_num(grid.get(f"{col}{sitting_row}"))
            byes.append([t] if t else [])
        else:
            byes.append([])

    title = (grid.get("A1") or "") + " " + (grid.get("A2") or "")
    m = re.search(r"(\d+)\s+Same-Partner Teams", title)
    if m:
        team_count = int(m.group(1))
    else:
        all_teams = set()
        for round_matches in rounds:
            for match in round_matches:
                all_teams.update([match["a"], match["b"]])
        team_count = max(all_teams) if all_teams else 0
    courts = max((len(r) for r in rounds), default=0)
    return {
        "teamCount": team_count,
        "courts": courts,
        "rrRounds": len(rounds),
        "schedule": rounds,
        "byes": byes,
    }


HEADER = """\
// AUTO-GENERATED from docs/tournament/artifacts/tournament_format_rundowns_4-18.xlsx
// To regenerate: pnpm run generate:schedules
// DO NOT EDIT BY HAND.

export type RPSchedule = {
  playerCount: number;
  courts: number;
  rrRounds: number;
  schedule: { a: [number, number]; b: [number, number] }[][];
  byes: number[][];
};

export type SPSchedule = {
  teamCount: number;
  courts: number;
  rrRounds: number;
  schedule: { a: number; b: number }[][];
  byes: number[][];
};
"""


def render_rp(entry):
    sched = ",\n".join(
        f"      [{', '.join('{ a: [' + str(m['a'][0]) + ', ' + str(m['a'][1]) + '], b: [' + str(m['b'][0]) + ', ' + str(m['b'][1]) + '] }' for m in rd)}]"
        for rd in entry["schedule"]
    )
    byes = ",\n".join(f"      [{', '.join(map(str, b))}]" for b in entry["byes"])
    return (
        f"    playerCount: {entry['playerCount']},\n"
        f"    courts: {entry['courts']},\n"
        f"    rrRounds: {entry['rrRounds']},\n"
        f"    schedule: [\n{sched},\n    ],\n"
        f"    byes: [\n{byes},\n    ],"
    )


def render_sp(entry):
    sched = ",\n".join(
        f"      [{', '.join('{ a: ' + str(m['a']) + ', b: ' + str(m['b']) + ' }' for m in rd)}]"
        for rd in entry["schedule"]
    )
    byes = ",\n".join(f"      [{', '.join(map(str, b))}]" for b in entry["byes"])
    return (
        f"    teamCount: {entry['teamCount']},\n"
        f"    courts: {entry['courts']},\n"
        f"    rrRounds: {entry['rrRounds']},\n"
        f"    schedule: [\n{sched},\n    ],\n"
        f"    byes: [\n{byes},\n    ],"
    )


def main() -> int:
    if len(sys.argv) != 2:
        sys.stderr.write(
            "usage: extract_schedules.py <path/to/tournament_format_rundowns_4-18.xlsx>\n",
        )
        return 2
    xlsx_path = sys.argv[1]
    out = sys.stdout

    with zipfile.ZipFile(xlsx_path) as zf:
        ss = read_shared_strings(zf)
        targets = sheet_targets(zf)
        rp, sp = {}, {}
        for n in range(4, 19):
            name = f"Sched-RP-{n:02d}"
            if name not in targets:
                continue
            grid = read_grid(zf, targets[name], ss)
            rp[f"rp_{n:02d}"] = parse_sched_rp(grid)
        for n in (6, 8, 10, 12, 14, 16, 18):
            name = f"Sched-SP-{n:02d}"
            if name not in targets:
                continue
            grid = read_grid(zf, targets[name], ss)
            sp[f"sp_{n:02d}"] = parse_sched_sp(grid)

    out.write(HEADER)
    out.write("\nexport const RP_SCHEDULES: Record<string, RPSchedule> = {\n")
    for key in sorted(rp):
        out.write(f"  {key}: {{\n{render_rp(rp[key])}\n  }},\n")
    out.write("};\n\nexport const SP_SCHEDULES: Record<string, SPSchedule> = {\n")
    for key in sorted(sp):
        out.write(f"  {key}: {{\n{render_sp(sp[key])}\n  }},\n")
    out.write("};\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
