# PT Timboel ERPNext Operations

PT Timboel's ERPNext operations use Sales Orders, stock reservations, Material Requests, Production Plans, Work Orders, stock entries, projects, tasks, and bills of materials. A Work Order is the authoritative trigger to start production. [[PT Timboel production starts with a Work Order]]

## Operational Model

Projects are grouped as custom orders, product development, or business development. Project completion is handled manually, while tasks are used to track execution. [[Timboel ERPNext Workflow]]

The proposed daily task-administration routine prioritizes blocked tasks, then actionable tasks, then work in progress, followed by cleanup of project and task dates. [[Wednesday, 17-6-2026 09꞉47꞉50]]

## Production And Materials

For the Work Order route, production starts only when a Work Order is created. ERPNext v15 Manufacture Stock Entry permits one distinct main finished Item; other incoming outputs are treated as scrap or by-products. Repack technically supports several distinct finished Item codes, but PT Timboel's route for processes with several outputs remains unresolved. [[PT Timboel production starts with a Work Order]] [[PT Timboel production can yield multiple distinct Item codes]]

Materials needed for a project are requested through Material Requests. [[Timboel ERPNext Workflow]]

Customer-order fulfillment now has a planned architecture. Sales Order holds demand. Stock Reservation assigns available goods. Material Request records missing supply. Production Plan gets submitted Manufacture Material Requests and may batch demand from several Sales Orders, while production execution must remain customer-specific. ERPNext does not natively preserve the Sales Order Item identity through this entire Material Request-sourced path, so custom server-side mapping and splitting are required before customer-specific Work Orders can be treated as enforced. [[PT Timboel Sales Order Fulfillment]] [[PT Timboel Production Plans source Manufacture Material Requests only]] [[PT Timboel Work Orders retain customer identity]]

## Inventory

The defined warehouses are Showroom Tanli, Molding, Packing, Finished Goods, Raw Material, and Production. [[Timboel ERPNext Workflow]]

Stock Entries distinguish material receipt, material issue, material transfer, and manufacture. A project material issue requires both accounting dimensions and a recipient. [[Timboel ERPNext Workflow]]

Finished goods stay in real warehouses. Stock Reservation, not a virtual Shipping warehouse, assigns stock to a customer Sales Order. [[PT Timboel uses stock reservation instead of a shipping warehouse]]

One accepted option is to move major materials from Raw Material to a pooled **Production Floor** Warehouse rather than expense them or force daily returns. Employees may leave them at scattered work areas overnight; ERPNext would record only that they remain somewhere on the production floor. PT Timboel considers a weekly count of major Production Floor materials feasible. Physically returned material would be transferred back; cheap consumables may remain operational cost under the existing BOM policy. [[PT Timboel materials remain scattered on production floor between jobs]] [[PT Timboel can use pooled Production Floor stock with weekly counts]] [[Creating Items Bill of material]]

This pooled model could give total floor inventory but not exact per-job consumption. Finished output would consume estimated or measured quantities from Production Floor. Weekly count differences would reveal a pooled variance whose posting and accounting treatment still need design; they must not be presented as exact Sales Order material usage.

## Bills Of Materials

A BOM should record materials that cost at least 3% of HPP or that materially affect rework risk. Lower-value consumables and labor are consolidated as operational cost. [[Creating Items Bill of material]]

Legacy product BOM creation is constrained mainly by quantity accuracy, not by identifying major materials. Many products predate ERPNext, and consumption such as paint per pot was never measured. Low-value unmeasured consumables can remain operational cost under the existing inclusion policy. [[PT Timboel legacy products lack verified material quantities]]

**Shell**, **Provisional**, and **Validated** are PT Timboel custom learning states, not native ERPNext BOM states. Native BOMs separately remain Draft, Submitted, or Cancelled and may be Active and Default.

The accepted bootstrap is a system-generated submitted **Shell BOM** containing one dedicated zero-cost non-stock placeholder. It permits Production Plan and Work Order creation before material quantities are known. ERPNext excludes that placeholder from Work Order required materials, so the first Work Order has no useful component planning or tracking. It has operation scheduling only if valid operations or routing are added separately. [[PT Timboel uses one-run Shell BOM before automated Provisional BOM]]

Server validation must prevent submission of the Shell Work Order's Manufacture Stock Entry unless it contains real stock-material source rows. The placeholder must never enter stock or valuation. The first submitted Manufacture Stock Entry creates one Provisional BOM draft immediately. Later partial entries from the same Work Order update that same draft; it cannot be approved until the Work Order run is complete. The process must remain idempotent. Cancellation of a source Stock Entry invalidates an unapproved proposal and blocks silent use of a submitted derived BOM until reviewed. [[PT Timboel BOM learning uses Manufacture Stock Entries]] [[PT Timboel staff record consumption but do not build BOMs manually]]

Once approved, the Provisional BOM becomes Active and Default for new work. New Shell Work Orders are blocked, while existing draft Production Plans and Work Orders using the Shell BOM require explicit review. The Shell BOM is deactivated only after its open Work Order ends.

Every Manufacture Stock Entry using a Provisional BOM enters **Actual Consumption Review**. Expected quantities remain visible, while staff retype actual quantities. Server validation, not Client Script alone, enforces this review. Requiring explanations for additions, removals, or large variances is a proposed control. Retyping proves deliberate review but does not prove physical measurement. [[PT Timboel provisional BOM runs require quantity re-entry]]

Only controlled measured runs may teach quantities. A qualifying run needs isolated material or a complete stock equation covering opening quantity, all receipts and transfers in, all returns and transfers out, adjustments, closing quantity, and any concurrent consumption. Normal shared-stock runs and weekly pooled variance may support operations and accounting but cannot honestly teach one Item's BOM. Separate Material Consumption for Manufacture entries must either be forbidden for learning runs or included in the measurement source.

Automatic multi-run averaging is part of the current intended scope, superseding the earlier plan to defer it. Automation creates a revised Draft BOM after enough eligible comparable measured runs; Production Head still reviews and submits it. The exact formula, minimum run count, fixed-versus-proportional materials, output denominator, outlier threshold, UOM precision, substitutions, scrap, process loss, and route matching remain unresolved. [[PT Timboel current BOM learning scope includes automatic multi-run revisions]] [[PT Timboel BOM learning averages several production runs]]

The current learning design is defined only for internal Manufacture entries with one main output Item. Multi-output learning remains unresolved and needs its own yield and cost-allocation design. Multi-level BOMs, stockable subassemblies, and subcontracted routes must not be pooled with simple single-level runs. [[PT Timboel production can yield multiple distinct Item codes]] [[Creating Items Bill of material]]

The intended implementation uses enabled ERPNext Server Scripts for integrity and document events, plus Client Scripts for review interfaces. This remains a preference, not proven feasibility. Restricted APIs, permissions, transaction behavior, cancellation, rollback, and upgrade behavior require staging tests. Keeping canonical script copies outside ERPNext is a recommended safeguard. [[PT Timboel prefers Server and Client Scripts for BOM learning]]

Product families have multi-step and outsourced-processing BOM patterns. [[How the bom should be made]]

Intermediate items use type-specific prefixes: `KAY-`, `COR-`, and `FRM-`. [[PT Timboel intermediate item prefixes are type-specific]]

## Molding Codes

Molding codes follow a `3-8-3` structure: process prefix, ERPNext model code, and an orientation or size suffix. [[Menentukan format kode molding]]

## Open Decisions

- Fulfillment quantity reconciliation, ERPNext v15 Stock Reservation behavior, Sales Order cancellation cleanup, and subcontracting integration still need testing or design. [[PT Timboel Sales Order Fulfillment]]
- Staging must verify Shell Work Order creation, manual real-material rows in its Manufacture Stock Entry, finished-good valuation, partial completion and cancellation, and safe switching from Shell to Provisional BOM. [[PT Timboel uses one-run Shell BOM before automated Provisional BOM]] [[PT Timboel BOM learning uses Manufacture Stock Entries]]
- Staging must verify mandatory quantity re-entry, controlled-run measurement, and automatic proposal generation. The averaging formula, minimum run count, and variance threshold remain unresolved. [[PT Timboel provisional BOM runs require quantity re-entry]] [[PT Timboel current BOM learning scope includes automatic multi-run revisions]]
- The document route, yield model, and cost-allocation method for several distinct output Item codes remain unresolved. [[PT Timboel production can yield multiple distinct Item codes]]
- Adopting pooled Production Floor stock remains optional. If adopted, weekly counts need an operating procedure and accounting treatment for pooled variance. [[PT Timboel can use pooled Production Floor stock with weekly counts]]
- Task scheduling policy remains unsettled between assigning an Expected Start Date only to the next actionable task or to every task. [[Wednesday, 17-6-2026 09꞉47꞉50]]

## Historical Context

An earlier proposal called unfinished goods `MTH-` codes. It has been superseded by the confirmed type-specific convention. [[How the bom should be made]] [[PT Timboel intermediate item prefixes are type-specific]]

An older note left the Sales Order-to-production flow undefined. Current plan resolves main document roles but keeps technical reconciliation open. [[Friday, 03-4-2026 15꞉31꞉13 pembenaran system erpnext wiki]] [[PT Timboel Sales Order Fulfillment]]

## Sources

- [[PT Timboel production starts with a Work Order]]
- [[Timboel ERPNext Workflow]]
- [[Friday, 03-4-2026 15꞉31꞉13 pembenaran system erpnext wiki]]
- [[Creating Items Bill of material]]
- [[How the bom should be made]]
- [[Menentukan format kode molding]]
- [[Wednesday, 17-6-2026 09꞉47꞉50]]
- [[PT Timboel intermediate item prefixes are type-specific]]
- [[PT Timboel Sales Order Fulfillment]]
- [[PT Timboel Production Plans source Manufacture Material Requests only]]
- [[PT Timboel Work Orders retain customer identity]]
- [[PT Timboel legacy products lack verified material quantities]]
- [[PT Timboel BOM learning averages several production runs]]
- [[PT Timboel BOM learning uses Manufacture Stock Entries]]
- [[PT Timboel uses one-run Shell BOM before automated Provisional BOM]]
- [[PT Timboel staff record consumption but do not build BOMs manually]]
- [[PT Timboel provisional BOM runs require quantity re-entry]]
- [[PT Timboel prefers Server and Client Scripts for BOM learning]]
- [[PT Timboel materials remain scattered on production floor between jobs]]
- [[PT Timboel can use pooled Production Floor stock with weekly counts]]
- [[PT Timboel current BOM learning scope includes automatic multi-run revisions]]
- [[PT Timboel production can yield multiple distinct Item codes]]
