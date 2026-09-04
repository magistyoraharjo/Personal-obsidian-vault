# PT Timboel ERPNext Operations

PT Timboel's ERPNext operations use projects, tasks, material requests, stock entries, bills of materials, and Work Orders to manage production. A Work Order is the authoritative trigger to start production. [[PT Timboel production starts with a Work Order]]

## Operational Model

Projects are grouped as custom orders, product development, or business development. Project completion is handled manually, while tasks are used to track execution. [[Timboel ERPNext Workflow]]

The proposed daily task-administration routine prioritizes blocked tasks, then actionable tasks, then work in progress, followed by cleanup of project and task dates. [[Wednesday, 17-6-2026 09꞉47꞉50]]

## Production And Materials

Production starts only when a Work Order is created. [[PT Timboel production starts with a Work Order]]

Materials needed for a project are requested through Material Requests. [[Timboel ERPNext Workflow]] The required process between Sales Order confirmation, Material Requests, stock movements, and Work Order creation is not yet established. [[Friday, 03-4-2026 15꞉31꞉13 pembenaran system erpnext wiki]]

## Inventory

The defined warehouses are Showroom Tanli, Molding, Packing, Finished Goods, Raw Material, and Production. [[Timboel ERPNext Workflow]]

Stock Entries distinguish material receipt, material issue, material transfer, and manufacture. A project material issue requires both accounting dimensions and a recipient. [[Timboel ERPNext Workflow]]

## Bills Of Materials

A BOM should record materials that cost at least 3% of HPP or that materially affect rework risk. Lower-value consumables and labor are consolidated as operational cost. [[Creating Items Bill of material]]

Product families have multi-step and outsourced-processing BOM patterns. [[How the bom should be made]]

Intermediate-item naming is unresolved. One source proposes `MTH` codes for unfinished goods, while another uses `KAY`, `COR`, and `FRM` prefixes by product or process. [[How the bom should be made]] [[Creating Items Bill of material]]

## Molding Codes

Molding codes follow a `3-8-3` structure: process prefix, ERPNext model code, and an orientation or size suffix. [[Menentukan format kode molding]]

## Open Decisions

- After a Sales Order is confirmed, the required sequence for stock transfer versus delivery, Material Requests, production readiness, and Work Order creation remains undefined. The Work Order is confirmed as the production trigger, but its prerequisites are not yet established. [[Friday, 03-4-2026 15꞉31꞉13 pembenaran system erpnext wiki]] [[PT Timboel production starts with a Work Order]]
- The standard prefix for intermediate items remains unresolved. [[How the bom should be made]] [[Creating Items Bill of material]]
- Task scheduling policy remains unsettled between assigning an Expected Start Date only to the next actionable task or to every task. [[Wednesday, 17-6-2026 09꞉47꞉50]]

## Sources

- [[PT Timboel production starts with a Work Order]]
- [[Timboel ERPNext Workflow]]
- [[Friday, 03-4-2026 15꞉31꞉13 pembenaran system erpnext wiki]]
- [[Creating Items Bill of material]]
- [[How the bom should be made]]
- [[Menentukan format kode molding]]
- [[Wednesday, 17-6-2026 09꞉47꞉50]]
