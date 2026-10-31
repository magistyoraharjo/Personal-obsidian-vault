# PT Timboel ERPNext Operations

PT Timboel's ERPNext operations use Sales Orders, stock reservations, Material Requests, Production Plans, Work Orders, stock entries, projects, tasks, and bills of materials. A Work Order is the authoritative trigger to start production. [[PT Timboel production starts with a Work Order]]

## Operational Model

Projects are grouped as custom orders, product development, or business development. Project completion is handled manually, while tasks are used to track execution. [[Timboel ERPNext Workflow]]

The proposed daily task-administration routine prioritizes blocked tasks, then actionable tasks, then work in progress, followed by cleanup of project and task dates. [[Wednesday, 17-6-2026 09꞉47꞉50]]

## Production And Materials

Production starts only when a Work Order is created. [[PT Timboel production starts with a Work Order]]

Materials needed for a project are requested through Material Requests. [[Timboel ERPNext Workflow]]

Customer-order fulfillment now has a planned architecture. Sales Order holds demand. Stock Reservation assigns available goods. Material Request records missing supply. Production Plan gets submitted Manufacture Material Requests, may batch several Sales Orders, and creates customer-specific Work Orders. Work Order starts production, while Manufacture Stock Entry records material consumption and finished stock. [[PT Timboel Sales Order Fulfillment]] [[PT Timboel Production Plans source Manufacture Material Requests only]] [[PT Timboel Work Orders retain customer identity]]

## Inventory

The defined warehouses are Showroom Tanli, Molding, Packing, Finished Goods, Raw Material, and Production. [[Timboel ERPNext Workflow]]

Stock Entries distinguish material receipt, material issue, material transfer, and manufacture. A project material issue requires both accounting dimensions and a recipient. [[Timboel ERPNext Workflow]]

Finished goods stay in real warehouses. Stock Reservation, not a virtual Shipping warehouse, assigns stock to a customer Sales Order. [[PT Timboel uses stock reservation instead of a shipping warehouse]]

## Bills Of Materials

A BOM should record materials that cost at least 3% of HPP or that materially affect rework risk. Lower-value consumables and labor are consolidated as operational cost. [[Creating Items Bill of material]]

Legacy product BOM creation is constrained mainly by quantity accuracy, not by identifying major materials. Many products predate ERPNext, and consumption such as paint per pot was never measured. Reliable major-material quantities generally must be learned from production runs. This requires a provisional first-run BOM and a feedback step that revises the BOM from observed consumption. Low-value unmeasured consumables can remain operational cost under the existing inclusion policy. [[PT Timboel legacy products lack verified material quantities]]

The accepted bootstrap is a system-generated submitted **Shell BOM** containing one dedicated zero-cost non-stock placeholder material and an explicit Shell status. It exists only to let the first Production Plan and customer-specific Work Order exist. Because ERPNext excludes the non-stock placeholder from Work Order material requirements, this first Work Order supports scheduling and customer identity but not useful material planning, generated component transfers, or normal component tracking. [[PT Timboel uses one-run Shell BOM before automated Provisional BOM]]

Server validation must prevent submission of the Shell Work Order's Manufacture Stock Entry unless it contains real raw-material source rows. The placeholder must never enter stock or valuation. The actual rows become the learning input and should immediately generate a real **Provisional BOM** draft. Production Head reviews and submits that draft; staff record actual consumption but do not construct BOMs manually. Once the Provisional BOM becomes active and default, new Work Orders must stop using the Shell BOM. Deactivate the Shell BOM after its open Work Order finishes. [[PT Timboel BOM learning uses Manufacture Stock Entries]] [[PT Timboel staff record consumption but do not build BOMs manually]]

Subsequent Work Orders use the Provisional BOM with real material identities. Future BOM-learning automation should read actual raw-material quantities from submitted Manufacture Stock Entries, normalize them by accepted finished quantity, and average several comparable runs. It then creates a revised Draft BOM for Production Head review rather than modifying an active BOM automatically. Partial runs, cancellations, substitutions, abnormal waste, process loss, different variants, and different production routes must not be averaged blindly. [[PT Timboel BOM learning uses Manufacture Stock Entries]] [[PT Timboel BOM learning averages several production runs]]

This lifecycle needs a custom app for durable validation, cancellation handling, duplicate prevention, audit provenance, BOM default switching, and automated draft creation. Server Scripts may prototype the submission guard, but should not own the permanent learning system.

Product families have multi-step and outsourced-processing BOM patterns. [[How the bom should be made]]

Intermediate items use type-specific prefixes: `KAY-`, `COR-`, and `FRM-`. [[PT Timboel intermediate item prefixes are type-specific]]

## Molding Codes

Molding codes follow a `3-8-3` structure: process prefix, ERPNext model code, and an orientation or size suffix. [[Menentukan format kode molding]]

## Open Decisions

- Fulfillment quantity reconciliation, ERPNext v15 Stock Reservation behavior, Sales Order cancellation cleanup, and subcontracting integration still need testing or design. [[PT Timboel Sales Order Fulfillment]]
- Staging must verify Shell Work Order creation, manual real-material rows in its Manufacture Stock Entry, finished-good valuation, partial completion and cancellation, and safe switching from Shell to Provisional BOM. [[PT Timboel uses one-run Shell BOM before automated Provisional BOM]] [[PT Timboel BOM learning uses Manufacture Stock Entries]]
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
