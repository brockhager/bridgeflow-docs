# EDI Technical Debt

This document captures known technical debt in the EDI library and serves as a checklist for the post-Phase 5 architectural refactor.

## Purpose
- Track duplicated segment logic across parser/generator implementations
- Call out inconsistent validations and data typing
- Capture opportunities to extract shared element/segment primitives
- Prioritize refactoring work and acceptance criteria

## Known Issues / Debt Items
1. Duplicated Generation/Parsing Logic
   - Multiple transactions implement similar handling for segments like `N1`, `TD1`, `TD5`, `LIN`, `SN1`, etc.
   - Generators and parsers repeat element mapping logic that should be centralized.

2. Inconsistent Validations
   - Some segments receive strict field validation while others accept loose values.
   - No unified validation schema per segment/element (e.g., numeric weights, date formats).

3. HL Hierarchy Handling
   - HL tree is attached ad-hoc; consistency across transaction types should be improved.
   - Need a shared HL model to reduce per-transaction duplication.

4. Segment/Element Data Typing
   - Lack of consistent types for elements (numbers vs strings, optional fields).
   - No clear canonical JSON shape for certain segments (e.g., TD1 weight fields).

5. Repetition & Performance
   - Repeated parse/generate operations for large HL trees could be optimized.

## 945-specific notes
- Reuse TD1/TD5/N1 handling where applicable
- W05/N9/G62/NTE/W27/W28 scaffolding added; consider centralizing date/reference handling

## Proposed Refactor Plan (Post-Phase 5)
1. Design a small element/segment model (JS module) that provides:
   - Segment definitions (id, element names, required/optional, types)
   - Utilities: normalizeElements(), validateSegment(), buildSegment(), parseSegment()
2. Replace ad-hoc generator/parse calls with segment primitives
3. Introduce a HL helper API for building and traversing hierarchical levels
4. Add schema-based validation (lightweight) using the definitions above
5. Create migration tests that verify parity between old and new implementations

## Acceptance Criteria for Refactor
- All existing tests pass (generator ↔ parser round-trip parity maintained)
- Reduced code duplication by >50% across segment handling code paths
- Segment validation coverage in unit tests for all core segments (850,810,820,856,997)
- Performance of roundtrip generation/parsing for large HL trees acceptable (no regressions)

## Short-term Mitigations (Before Refactor)
- Add unit tests for all edge cases encountered during Phase 5
- Document canonical JSON shapes for each segment in `docs/edi/` as we implement them
- Use consistent helper functions in the EDI package where obvious (e.g., generateSegment)

## Tracking
- Use this file to list specific code pointers and improvements discovered while implementing 856/945/210
- Link PRs that address the items above for visibility

_Last Updated: 2025-12-17_
