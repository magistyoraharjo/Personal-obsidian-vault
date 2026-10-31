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

Legacy product BOM creation is constrained mainly by quantity accuracy, not by identifying major materials. Many products predate ERPNext, and consumption such as paint per pot was never measured. Reliable major-material quantities generally must be learned from a production run. This requires a provisional first-run BOM and a feedback step that revises the BOM from observed consumption. Low-value unmeasured consumables can remain operational cost under the existing inclusion policy. The exact first-run recording method remains unresolved. [[PT Timboel legacy products lack verified material quantities]]

Product families have multi-step and outsourced-processing BOM patterns. [[How the bom should be made]]

Intermediate items use type-specific prefixes: `KAY-`, `COR-`, and `FRM-`. [[PT Timboel intermediate item prefixes are type-specific]]

## Molding Codes

Molding codes follow a `3-8-3` structure: process prefix, ERPNext model code, and an orientation or size suffix. [[Menentukan format kode molding]]

## Open Decisions

- Fulfillment quantity reconciliation, ERPNext v15 Stock Reservation behavior, Sales Order cancellation cleanup, and subcontracting integration still need testing or design. [[PT Timboel Sales Order Fulfillment]]
- Legacy BOM rollout still needs a method for recording actual major-material consumption during the first production run. [[PT Timboel legacy products lack verified material quantities]]
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
