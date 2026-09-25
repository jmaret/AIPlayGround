"""Fictional in-memory teaching chart. Not PHI. Never written to disk."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

PathName = Literal["auto_approve", "controlled", "renewal", "early_or_labs", "identity"]
ESCALATE_PATHS = frozenset({"controlled", "renewal", "early_or_labs"})

DOB_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")
ZIP_RE = re.compile(r"\b(\d{5})\b")
PHARMACY_MARKERS = ("pharmacy", "harbor", "calling to refill", "calling:")
EARLY_FILL_DAYS = 10

PROPOSED = {
    "controlled": "Schedule II–V must not auto-approve. Route to a pharmacist with fill history.",
    "renewal": "No refills remain on the script. Draft a renewal for prescriber sign-off.",
    "early_or_labs": "Too soon since the last fill, or required labs are overdue. Suspend auto-approval.",
}


@dataclass(frozen=True)
class Script:
    medication: str
    aliases: tuple[str, ...]
    refills_remaining: int
    last_fill_days: int
    days_supply: int
    expired: bool
    schedule: str | None
    labs_overdue: bool


@dataclass(frozen=True)
class Patient:
    name: str
    dob: str
    zip_code: str
    scripts: tuple[Script, ...]


PATIENTS: tuple[Patient, ...] = (
    Patient(
        name="Patient A",
        dob="1984-03-12",
        zip_code="10000",
        scripts=(
            Script("lisinopril", ("lisinopril",), 3, 40, 30, False, None, False),
        ),
    ),
    Patient(
        name="Patient B",
        dob="1971-08-02",
        zip_code="20000",
        scripts=(
            Script("metformin", ("metformin",), 2, 25, 30, False, None, False),
        ),
    ),
    Patient(
        name="Patient C",
        dob="1990-11-04",
        zip_code="30000",
        scripts=(
            Script("oxycodone", ("oxycodone",), 1, 28, 30, False, "II", False),
        ),
    ),
    Patient(
        name="Patient D",
        dob="1966-01-19",
        zip_code="40000",
        scripts=(
            Script("atorvastatin", ("atorvastatin",), 0, 90, 90, True, None, False),
        ),
    ),
    Patient(
        name="Patient E",
        dob="1958-06-22",
        zip_code="50000",
        scripts=(
            Script("warfarin", ("warfarin",), 2, 5, 30, False, None, True),
        ),
    ),
)

CONTROLLED_NAMES = frozenset({"oxycodone"})
MEDICATION_ALIASES = tuple(
    sorted(
        {alias for patient in PATIENTS for script in patient.scripts for alias in script.aliases},
        key=len,
        reverse=True,
    )
)


def parse_request(question: str) -> dict:
    lowered = question.lower()
    channel = "pharmacy" if any(marker in lowered for marker in PHARMACY_MARKERS) else "patient"
    dob_match = DOB_RE.search(question)
    zip_match = ZIP_RE.search(question)
    dob = dob_match.group(1) if dob_match else ""
    zip_code = zip_match.group(1) if zip_match else ""
    medication = next((alias for alias in MEDICATION_ALIASES if alias in lowered), "")

    best: Patient | None = None
    best_score = 0
    for patient in PATIENTS:
        score = 0
        if re.search(rf"\b{re.escape(patient.name.lower())}\b", lowered):
            score += 1
        if dob and dob == patient.dob:
            score += 1
        if zip_code and zip_code == patient.zip_code:
            score += 1
        if score > best_score:
            best = patient
            best_score = score

    matched = best is not None and best_score >= 2
    return {
        "channel": channel,
        "medication": medication,
        "identifiers_matched": matched,
        "patient": best if matched else None,
    }


def find_script(patient: Patient | None, medication: str) -> Script | None:
    if patient is None or not medication:
        return None
    for script in patient.scripts:
        if medication in script.aliases or medication == script.medication:
            return script
    return None


def verify_identity(question: str) -> bool:
    return bool(parse_request(question)["identifiers_matched"])


def get_script(question: str) -> dict:
    parsed = parse_request(question)
    if not parsed["identifiers_matched"]:
        return {"refills_remaining": None, "last_fill_days": None, "expired": False}
    script = find_script(parsed["patient"], parsed["medication"])
    if script is None:
        return {"refills_remaining": 0, "last_fill_days": None, "expired": True}
    return {
        "refills_remaining": script.refills_remaining,
        "last_fill_days": script.last_fill_days,
        "expired": script.expired or script.refills_remaining == 0,
    }


def is_controlled(medication: str) -> bool:
    return medication in CONTROLLED_NAMES


def check_controlled(question: str) -> bool:
    parsed = parse_request(question)
    script = find_script(parsed["patient"], parsed["medication"]) if parsed["identifiers_matched"] else None
    if script and script.schedule:
        return True
    return is_controlled(parsed["medication"])


def check_early_refill(question: str) -> bool:
    parsed = parse_request(question)
    if not parsed["identifiers_matched"]:
        return False
    script = find_script(parsed["patient"], parsed["medication"])
    if script is None:
        return False
    return script.last_fill_days < EARLY_FILL_DAYS


def check_labs(question: str) -> bool:
    parsed = parse_request(question)
    if not parsed["identifiers_matched"]:
        return False
    script = find_script(parsed["patient"], parsed["medication"])
    return bool(script and script.labs_overdue)


def check_safety(question: str) -> dict[str, bool]:
    return {
        "controlled": check_controlled(question),
        "labs_overdue": check_labs(question),
        "early_refill": check_early_refill(question),
    }


def decide_path(
    identifiers_matched: bool,
    controlled: bool,
    expired: bool,
    refills_remaining: int | None,
    early_refill: bool,
    labs_overdue: bool,
) -> PathName:
    if not identifiers_matched:
        return "identity"
    if controlled:
        return "controlled"
    if expired or refills_remaining == 0:
        return "renewal"
    if early_refill or labs_overdue:
        return "early_or_labs"
    return "auto_approve"


def submit_order(medication: str, channel: str) -> dict[str, str]:
    return {
        "destination": "teaching_pms",
        "medication": medication or "unknown",
        "channel": channel,
    }


def queue_escalation(path: str) -> dict[str, str]:
    queues = {
        "controlled": "pharmacist",
        "renewal": "prescriber",
        "early_or_labs": "care_coordinator",
        "identity": "front_desk",
    }
    return {"queue": queues.get(path, "pharmacist"), "path": path}


def proposed_for(path: str) -> str:
    return PROPOSED.get(path, "A clinician should review this request.")
