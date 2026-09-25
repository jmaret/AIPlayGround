import { matchQuery } from "@/lib/fixtures";

export type ScenarioGuide = {
  title: string;
  story: string;
  happens: string;
};

export const SCENARIO_GUIDES: Record<string, ScenarioGuide> = {
  "refill-patient-auto": {
    title: "Patient A — the easy refill",
    story:
      "Patient A asks for lisinopril, a common blood-pressure pill. Name, date of birth, and zip match the teaching chart. The prescription still has refills. The last fill was long enough ago. The drug is not tightly controlled, and no lab checks are overdue.",
    happens:
      "The system fills it on its own. No pharmacist has to click. This is the boring happy path — everything checks out.",
  },
  "refill-pharmacy-auto": {
    title: "Patient B — the pharmacy calls it in",
    story:
      "Same kind of clean refill, but Harbor Pharmacy calls for metformin, a diabetes pill, for Patient B. The request is on someone else's behalf.",
    happens:
      "The rules do not get looser because a pharmacy called. Identity still has to match. If the chart is clear, it auto-approves the same way as Patient A. The only extra chip you see is that the request came through the pharmacy.",
  },
  "refill-controlled": {
    title: "Patient C — a tightly controlled drug",
    story:
      "Patient C asks for oxycodone. That is a Schedule II pain medicine. Real clinics never let software rubber-stamp those, even when refills remain.",
    happens:
      "The system will not auto-approve. It gathers the checklist and waits. A person must click Approve or Deny. On the recorded demo, this one is approved after that review — so you can see a human saying yes.",
  },
  "refill-expired": {
    title: "Patient D — the prescription ran out",
    story:
      "Patient D asks for atorvastatin, a cholesterol pill. The teaching chart says the script is expired or has zero refills left. There is nothing left to refill.",
    happens:
      "The system drafts a “please renew this” request for a prescriber instead of sending pills. A person still has to approve or deny that renewal. On the recorded demo, this one is denied — the other human outcome, next to Patient C.",
  },
  "refill-labs": {
    title: "Patient E — too soon, or labs are late",
    story:
      "Patient E asks for warfarin, a blood thinner. Two yellow flags: the last fill was only a few days ago, and the required blood test (INR) is overdue.",
    happens:
      "Auto-approve is suspended. Filling now could be unsafe or wasteful. The system pauses for a human, who can still approve or deny. The recorded demo shows an approve after that pause.",
  },
  "refill-identity": {
    title: "Patient F — we cannot prove who this is",
    story:
      "Someone asks for lisinopril as Patient F, with a date of birth and zip that are not on the teaching chart.",
    happens:
      "The system stops at the front door. It does not offer Approve or Deny. That click is for a pharmacist looking at a known chart, not for guessing a stranger. The outcome is refused and handed to a fictional front desk: identity did not match.",
  },
};

export function guideForQuestion(question: string): ScenarioGuide | null {
  const match = matchQuery("refill", question);
  if (!match) return null;
  return SCENARIO_GUIDES[match.id] ?? null;
}
