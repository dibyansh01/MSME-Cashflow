---
name: compliance-guard
description: Use when a task involves 43B(h), MSME/MSMED rules, GST input tax credit, deadlines, penalties, or any user-visible tax/legal wording.
---
# Compliance guard
- The only source of rules is `docs/domain/compliance-rules.md`. If a rule you need isn't there, **stop and ask**; do not infer from memory or the web.
- Rules marked "CA review: pending" may be implemented behind a feature flag but must not appear in user-facing text without the disclaimer from that file.
- Never present computed tax amounts as certain; show deadlines, clocks and *exposure estimates* with their assumptions.
- Implement rules as typed, versioned config with tests that cite the rule ID (e.g., `R1`).
- Any change to rule logic = separate PR referencing the rule ID, approved by me.
