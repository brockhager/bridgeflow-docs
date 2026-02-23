**Example Variants:**
- `docs/examples/variants/complex-shipment-856.txt` - Complex order→shipment→package→item example
- `docs/examples/variants/minimal-856.txt` - Minimal example
- `docs/examples/variants/international-856.txt` - International / special chars example
 - `docs/examples/sample-945.txt` - Sample 945 Warehouse Shipping Advice
 - `docs/examples/variants/warehouse-receiving-945.txt` - Warehouse receiving variant
 - `docs/examples/variants/warehouse-crossdock-945.txt` - Warehouse cross-dock variant
 - `docs/examples/variants/warehouse-returns-945.txt` - Warehouse returns variant
 - `docs/examples/sample-210.txt` - Sample 210 Motor Carrier Freight Invoice
 - `docs/examples/variants/standard-freight-210.txt` - Standard freight invoice variant
 - `docs/examples/variants/international-freight-210.txt` - International freight invoice variant
 - `docs/examples/variants/accessorial-charges-210.txt` - Accessorial charges variant

# EDI Transaction Types - Ready for Customers

This document lists all X12 EDI transaction types that are currently supported by the BridgeFlow EDI Library with complete specifications, parser support, and generator capabilities.

## Production-Ready Transaction Types

### 850 - Purchase Order
**Status**: ✅ Fully Supported (Parser + Generator + Tested)

- **Functional Group**: PO
- **Industry**: Retail, Manufacturing, Distribution
- **Description**: Used to place orders for goods or services
- **Parser Support**: Yes - Fully tested with real-world samples
- **Generator Support**: Yes - Complete implementation
- **Specification**: `src/formats/x12/specs/transactions/850-purchase-order.json`
- **Examples**:
  - `examples/parse-850.js` - Parse existing 850 PO
  - `examples/generate-850.js` - Generate new 850 PO
  - `examples/roundtrip-850.js` - Round-trip validation
- **Sample Files**: `docs/examples/x12/850-real-world-complete.txt`

**Key Segments**:
- BEG - Beginning Segment for Purchase Order
- REF - Reference Identification
- DTM - Date/Time Reference
- N1 - Party Identification
- PO1 - Baseline Item Data
- CTT - Transaction Totals

---

### 810 - Invoice
**Status**: ✅ Specification Complete (Parser + Generator Ready)

- **Functional Group**: IN
- **Industry**: All industries
- **Description**: Used to request payment for goods or services
- **Parser Support**: Yes - Spec-based parsing available
- **Generator Support**: Yes - Complete implementation
- **Specification**: `src/formats/x12/specs/transactions/810-invoice.json`
- **Examples**: Generator support included in library
- **Sample Files**: Pending

**Key Segments**:
- BIG - Beginning Segment for Invoice
- REF - Reference Identification
- N1 - Party Identification (Name)
- IT1 - Baseline Item Data (Invoice)
- TDS - Total Monetary Value Summary

---

## In Development

### 210 - Motor Carrier Freight Details and Invoice
**Status**: ✅ Implemented (Core segments + Variants + Tests)

- **Functional Group**: MI
- **Industry**: Transportation, Logistics
- **Description**: Freight billing and shipment details for motor carriers
- **Parser Support**: Yes - B3/B4/L0/L5/L1 parsing implemented
- **Generator Support**: Yes - Core segments and L0/L5/L1 generation implemented
- **Specification**: Partial - core fields implemented; remaining optional segments TBD
- **Examples / Variants**:
  - `packages/edi-library/examples/generate-210.js` - Generate sample 210
  - `docs/examples/sample-210.txt` - Generated sample 210 file
  - `docs/examples/variants/standard-freight-210.txt` - Standard freight invoice
  - `docs/examples/variants/international-freight-210.txt` - International variant (customs)
  - `docs/examples/variants/accessorial-charges-210.txt` - Accessorial charges (fuel, detention)
**Target**: Complete remaining optional segments and expand edge-case tests in follow-up work

---

### 820 - Payment Order/Remittance Advice
**Status**: ✅ Fully Supported (Parser + Generator + Tested)

- **Functional Group**: RA
- **Industry**: Financial, All industries
- **Description**: Payment details and remittance information
- **Parser Support**: Yes - Fully tested with examples
- **Generator Support**: Yes - Complete implementation
- **Specification**: `src/formats/x12/specs/transactions/820-payment-order.json`
- **Examples**:
  - `examples/generate-820.js` - Generate 820 Payment Order
  - `examples/parse-820.js` - Parse a sample 820
  - `examples/roundtrip-820.js` - Round-trip validation
  - `examples/sample-820.txt` - Sample generated 820 file

---

### 856 - Ship Notice/Manifest (ASN)
**Status**: ✅ Fully Supported (Parser + Generator + Variants + Tests)

- **Functional Group**: SH
- **Industry**: Retail, Manufacturing, Distribution
- **Description**: Advanced Shipping Notice with detailed package/item information
 - **Parser Support**: Yes - HL loop parsing and attachment of N1/TD1/TD5/LIN/SN1/MAN/PID
 - **Generator Support**: Yes - BSN, recursive HL generation, TD1/TD5, LIN/SN1, MAN/PID emission
**Examples**:
  - `packages/edi-library/examples/generate-856.js` - Generate a sample 856 ASN and write `docs/examples/sample-856.txt`
  - `packages/edi-library/examples/parse-856.js` - Parse `docs/examples/sample-856.txt` and print transaction structure
  - `packages/edi-library/examples/roundtrip-856.js` - Generate → Parse → Regenerate roundtrip script
  - `docs/examples/sample-856.txt` - Sample generated 856 file
- **Specification**: Partial (works for core use-cases)
- **Target Completion**: Complete for Phase 5; follow-up refinements tracked in TECHNICAL-DEBT
-- **Target Completion**: TBD - work in progress (tests added)

---

### 945 - Warehouse Shipping Advice
**Status**: ✅ Fully Supported (Parser + Generator + Variants + Tests)

- **Functional Group**: WA
- **Industry**: Warehousing, 3PL
- **Description**: Notification of shipment from warehouse
- **Parser Support**: Yes - W05/N9/G62/NTE/W27/W28 parsing implemented and attached to structured output
- **Generator Support**: Yes - generate945Segments emits W05/N9/G62/NTE/W27/W28 and N1 loops
- **Specification**: Planned (core segments implemented)
- **Examples / Variants**:
  - `packages/edi-library/examples/generate-945.js` - Generate sample 945 file
  - `docs/examples/sample-945.txt` - Sample generated 945 file
  - `docs/examples/variants/warehouse-receiving-945.txt`, `warehouse-crossdock-945.txt`, `warehouse-returns-945.txt`
 - **Target Completion**: Phase 5 complete for core 945 scenarios; edge-case tests tracked for follow-up

---

### 997 - Functional Acknowledgment
**Status**: ✅ Fully Supported (Parser + Generator + Tested)

- **Functional Group**: FA
- **Industry**: All industries (EDI infrastructure)
- **Description**: Acknowledges receipt and syntax validation of EDI transactions
- **Parser Support**: Yes - Fully tested with examples
- **Generator Support**: Yes - Complete implementation
- **Specification**: `src/formats/x12/specs/transactions/997-functional-ack.json`
- **Examples**:
  - `examples/generate-997.js` - Generate 997 FA
  - `examples/parse-997.js` - Parse a sample 997
  - `examples/roundtrip-997.js` - Round-trip validation
  - `examples/sample-997.txt` - Sample generated 997 file

---

## How to Use

### Parsing EDI Files

```javascript
import { parseX12 } from '@bridgeflow/edi-library'

const ediText = '...' // Your X12 EDI text
const parsed = parseX12(ediText, { validate: true })

console.log(parsed.transactionSets[0].type) // '850', '810', etc.
```

### Generating EDI Files

```javascript
import { generateX12 } from '@bridgeflow/edi-library'

const data = {
  interchange: { /* ... */ },
  functionalGroups: [ /* ... */ ],
  transactionSets: [ /* ... */ ]
}

const ediText = generateX12(data, { prettyPrint: false })
```

### Round-trip Validation

```javascript
import { parseX12, generateX12 } from '@bridgeflow/edi-library'

const original = '...' // Original EDI
const parsed = parseX12(original)
const regenerated = generateX12(parsed)

// Should match perfectly
console.log(original === regenerated)
```

---

## Version Support

All transaction types support X12 version **004010** (and later versions as needed).

---

## Documentation

- **Parser Documentation**: See `src/formats/x12/parser.js`
- **Generator Documentation**: See `src/formats/x12/generator.js`
- **Transaction Specifications**: See `src/formats/x12/specs/transactions/`
- **Examples**: See `examples/` directory

---

## Getting Started

1. Install the library:
   ```bash
   npm install @bridgeflow/edi-library
   ```

2. Run examples:
   ```bash
   npm run example:parse      # Parse 850 PO
   npm run example:generate   # Generate 850 PO
   npm run example:roundtrip  # Validate round-trip
   ```

3. Check documentation in `/docs/edi/`

---

**Last Updated**: 2025-12-17
**Library Version**: 0.1.0
