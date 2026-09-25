# Acme Teaching Pharmacy refill rules

This file is a teaching policy for a local playground. It is not a real pharmacy handbook and it does not describe real patients. The refill lab reads these rules and runs local tools against a fictional in-memory chart. Nothing here is PHI.

## Identity first

A refill request may arrive from a patient or from a pharmacy calling on a patient's behalf. Before any fill, match at least two of three teaching identifiers: name, date of birth, and zip code. If the identifiers do not match the teaching chart, do not approve. Warm-transfer the request to the front desk with the reason "identity mismatch." Do not invent a person who is not on the chart.

## Zero-touch auto-approve

When the identity check passes, an active script still has refills, the last fill was not too recent, the drug is not a controlled substance, and required labs are current, the agent may auto-approve. That is zero-touch: inject a fictional order into the teaching pharmacy queue. No pharmacist click is required.

A pharmacy-on-behalf request uses the same clinical rules. The channel chip may say pharmacy, but the safety gates do not get looser.

## Controlled substances

Schedule II through V drugs (for this teaching chart, oxycodone is Schedule II) must never auto-approve. Flag the record, gather last-fill context, and route to a pharmacist or prescriber. A human must choose approve or deny. Electronic prescribing rules in a real clinic are out of scope; this lab only teaches the gate.

## Expired script or zero refills

If the teaching script is expired or zero refills remain, do not fill. Draft a short renewal request that stays inside this policy and send it to a fictional prescriber inbox. The human may approve the renewal path or deny it.

## Early refill and overdue labs

If the last fill was too recent, or required monitoring is overdue (for this teaching chart, INR for warfarin), suspend auto-approval. Offer to flag a lab or wait, then wait for a human approve or deny. Do not invent lab values.

## Grounding and logs

Stay inside this policy and the structured tool results. Do not invent dosages, NDC codes, or clinical advice. Cite this file as [refill.md]. Prompts and answers are not written to disk. Logs may include method, path, status, and duration only.
