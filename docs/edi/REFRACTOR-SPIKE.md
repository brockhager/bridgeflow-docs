# EDI Refactor Spike: Element / Segment Primitives

## Purpose
Create a small prototype demonstrating element and segment primitives that can be reused by both parser and generator.

## Prototype API (initial)
- createElement(value, options) -> { value, validate(), toString() }
- createSegment(id, elements[]) -> { id, elements, serialize(delims), toSegmentString(delims) }
- parseSegment(text, delims) -> { id, elements }

## Example usage
```js
import { createElement, createSegment } from '../src/formats/x12/primitives.js'

const el = createElement('CN', { required: true })
const seg = createSegment('REF', [el])
const txt = seg.toSegmentString({ element: '*', segment: '~' })
```

## Spike tasks (today)
1. Implement primitives module with basic serialize/parse
2. Add unit test that round-trips a small segment (REF*CN*123~)
3. Identify integration points in parser/generator for replacement

**Goal:** Prove concept and measure small migration path for 2 transactions (856, 210)

*Prepared: 2025-12-17 — A6 (EDI Specialist)*
