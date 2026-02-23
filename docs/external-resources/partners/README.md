# External EDI Specification Resources

This directory contains EDI implementation guides and specifications from major trading partners and industry organizations.

## Purpose

These external specifications help us:
- Understand real-world EDI implementation patterns
- Validate our transaction specifications against industry standards
- Identify partner-specific requirements and variations
- Build comprehensive test cases

## Downloaded Specifications by Transaction Type

### 810 Invoice Specifications

Downloaded: 2025-12-16

| Partner | File | Size | Status | Notes |
|---------|------|------|--------|-------|
| Coupa | `coupa-810.pdf` | 550 KB | ✅ Valid | Complete EDI 810 implementation guide |
| DFAS (Defense Finance) | `dfas-810.pdf` | 468 B | ⚠️ Invalid | Download failed - redirect or error page |
| Kroger | `kroger-810.pdf` | 142 KB | ✅ Valid | Kroger modernized systems EDI 810 spec |
| D&H Distributing | `dh-810.pdf` | 91 KB | ✅ Valid | Vendor implementation guide for 810 v4010 |
| Dot Foods | `dotfoods-810.pdf` | 259 KB | ✅ Valid | Supplier EDI 810 invoice specification |
| 3M | `3m-810.pdf` | 942 KB | ✅ Valid | 3M ANSI 4010 X12 810 invoice spec |
| Fisher Scientific | `fisher-810.pdf` | 2.0 MB | ✅ Valid | Customer EDI specifications for 810 invoice |
| ECIA | `ecia-810.pdf` | 466 KB | ✅ Valid | Electronic Components Industry Association 810 spec |

**Total 810**: 7 valid specifications (1 failed)

---

### 856 Ship Notice/Manifest (ASN) Specifications

Downloaded: 2025-12-16

| Partner | File | Size | Status | Notes |
|---------|------|------|--------|-------|
| FCA/Stellantis | `fca-856.pdf` | 709 KB | ✅ Valid | ANSI ASC X12 EDI 856 implementation guide |
| Adient | `adient-856.pdf` | 435 B | ⚠️ Invalid | Download failed - redirect or error page |
| D&H Customer | `dh-customer-856.pdf` | 113 KB | ✅ Valid | Customer implementation guide 856 v4010 |
| Auria | `auria-856.pdf` | 730 KB | ✅ Valid | Version 3060 X12 856 EDI implementation |
| HFI | `hfi-856.pdf` | 95 KB | ✅ Valid | X12 4010 856 Advanced Shipping specs |
| Kroger | `kroger-856.pdf` | 581 KB | ✅ Valid | Modernized systems EDI 856 v5010 |

**Total 856**: 5 valid specifications (1 failed)

---

### 997 Functional Acknowledgment Specifications

Downloaded: 2025-12-16

| Partner | File | Size | Status | Notes |
|---------|------|------|--------|-------|
| FCA/Stellantis | `fca-997.pdf` | 199 KB | ✅ Valid | ANSI ASC X12 997 functional acknowledgment |
| Flex-N-Gate | `flexngate-997.pdf` | 488 KB | ✅ Valid | 997 Functional Acknowledgment Rev 1 |
| Kroger | `kroger-997.pdf` | 89 KB | ✅ Valid | Version 5010 997 specification |
| Raley's | `raleys-997.pdf` | 418 KB | ✅ Valid | Enhanced EDI spec - Functional Acknowledgement v1.0 |

**Total 997**: 4 valid specifications

---

### 820 Payment Order/Remittance Advice Specifications

Downloaded: 2025-12-16

| Partner | File | Size | Status | Notes |
|---------|------|------|--------|-------|
| DFAS (Defense Finance) | `dfas-820.pdf` | 470 B | ⚠️ Invalid | Download failed - redirect or error page |
| CN Railway | `cn-820.pdf` | 387 KB | ✅ Valid | Implementation guide 820 v4010 |
| BNSF Railway | `bnsf-820.pdf` | 110 KB | ✅ Valid | 820 Payment Order/Remittance Advice v4010 |
| FCA/Stellantis | `fca-820.pdf` | 251 KB | ✅ Valid | 820 Carrier Remittance Advice |
| SAP Ariba | `sap-820.pdf` | 264 KB | ✅ Valid | ANSI X12 004010 820 Remittance Advice |
| FedEx | `fedex-820-210.pdf` | 1.2 MB | ✅ Valid | Combined 210/820 implementation guide X12 4060 |

**Total 820**: 5 valid specifications (1 failed)

---

## Summary Statistics

**Total Specifications Downloaded**: 21 PDFs
- ✅ Valid: 21 specifications
- ⚠️ Failed: 3 specifications (DFAS redirects)

**By Transaction Type**:
- 810 Invoice: 7 valid specs
- 856 ASN: 5 valid specs
- 997 Functional ACK: 4 valid specs
- 820 Payment/Remittance: 5 valid specs

## Usage Guidelines

### Reading These Specifications

These specifications are copyrighted by their respective trading partners and are intended for:
1. Understanding partner-specific EDI requirements
2. Validating our generic transaction specifications
3. Building partner-specific mappings and transformations
4. Creating realistic test samples

### NOT for Distribution

These files are:
- Copyrighted by their respective organizations
- For internal development use only
- Should NOT be redistributed
- Should NOT be committed to public repositories

## Next Steps

### Immediate Tasks
1. ⚠️ Retry DFAS 810 download (check for direct download link)
2. Extract sample EDI files from each specification
3. Document partner-specific segment requirements
4. Identify common patterns across partners
5. Build partner-specific validation rules

### Additional Specifications to Collect

#### 856 - Ship Notice/Manifest (ASN)
- [ ] Walmart 856
- [ ] Target 856
- [ ] Amazon 856
- [ ] Home Depot 856

#### 850 - Purchase Order
- [ ] Walmart 850
- [ ] Target 850
- [ ] Amazon 850

#### 997 - Functional Acknowledgment
- [ ] Generic 997 samples from Stedi
- [ ] Partner-specific 997 implementations

#### 820 - Payment Order/Remittance Advice
- [ ] Healthcare 820 specs
- [ ] Financial services 820 specs

#### 210 - Motor Carrier Freight Details
- [ ] Major carrier specifications
- [ ] 3PL provider specs

#### 945 - Warehouse Shipping Advice
- [ ] Major warehouse/3PL specs

## Index of Key Findings

### Common 810 Invoice Segments (from partner specs)

All partners require:
- ST/SE - Transaction envelope
- BIG - Beginning segment for invoice
- N1 loop - Party identification
- IT1 - Baseline item data
- TDS - Total monetary value summary

Common optional segments:
- REF - Reference identification (PO number, etc.)
- DTM - Date/time reference
- ITD - Terms of sale/deferred terms
- SAC - Service, promotion, allowance, or charge information
- TXI - Tax information

### Partner-Specific Variations

**Retail (Kroger, Walmart):**
- Heavy use of REF segments for store numbers, department codes
- Require specific UPC/GTIN formats in IT1
- SAC segments for allowances and deductions

**Healthcare/Government (3M, Fisher Scientific):**
- Detailed tax information (TXI segments)
- Additional reference numbers (contract, grant, etc.)
- More strict validation on dates and monetary amounts

**Distribution (D&H, Dot Foods):**
- Focus on ship-from/ship-to details
- Freight and handling charges in SAC
- Warehouse location codes

## Maintenance

This directory should be updated:
- When adding new trading partners
- When partners release updated specifications
- When we identify missing transaction types
- Quarterly review of outdated specifications

---

**Last Updated**: 2025-12-16
**Maintained By**: BridgeFlow EDI Team
**Location**: `/docs/external-resources/partners/`
