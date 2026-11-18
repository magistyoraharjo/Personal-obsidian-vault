# PT Timboel Sales Order Fulfillment

PT Timboel plans customer-order fulfillment inside each Sales Order. Sales Order stays demand master. Native ERPNext records stay truth. Fulfillment tab only reads state and starts actions. No separate Fulfillment Plan DocType. [[PT Timboel Sales Order is the customer demand master]] [[PT Timboel fulfillment uses native ERPNext records]]

## Core Model

Two questions. Keep separate:

1. **Demand covered?** Stock reserved anywhere, or active Purchase/Manufacture request exists.
2. **Ready to ship?** Stock reserved in Sales Order Item Warehouse.

Reservation means customer owns stock. Reservation alone does not mean ready. Warehouse location decides readiness. [[PT Timboel shipping readiness uses Sales Order warehouse]]

## Flow

```text
Sales Order
  -> reserve existing stock
     -> Stock Reservation Entry
     -> transfer when reserved elsewhere
        -> Material Request: Material Transfer
        -> Stock Entry
  -> request missing supply
     -> Material Request: Purchase
        -> Purchase Order
     -> Material Request: Manufacture
        -> Production Plan
        -> Work Order
  -> Delivery Note
```

One Sales Order Item may mix methods. Example: reserve 3, manufacture 5, purchase 2. [[PT Timboel fulfillment supports mixed supply methods]]

## Fulfillment States

Each Sales Order Item shows:

- ordered;
- delivered;
- outstanding;
- ready to ship;
- reserved in source Warehouse;
- reserved in non-source Warehouse;
- transfer requested and waiting;
- Purchase/Manufacture Draft quantity;
- Purchase/Manufacture Submitted remaining quantity;
- unplanned quantity;
- overplanned quantity;
- linked Material Requests and Stock Reservations.

Clear state words matter:

- **Ready to ship:** reservation already in Sales Order Item Warehouse.
- **Needs transfer request:** reservation elsewhere. No active transfer request.
- **Waiting for stock movement:** transfer already requested. Physical transfer not done.
- **Needs decision:** demand still unplanned.

Free-stock suggestions matter only while quantity remains unplanned. Once demand fully planned, hide that noise. Stock status and procurement status stay separate. [[PT Timboel fulfillment UI separates stock and procurement status]]

## Stock And Transfer

Finished goods stay in real Warehouses. No virtual Shipping Warehouse. [[PT Timboel uses stock reservation instead of a shipping warehouse]]

Sales Order Item `warehouse` is source Warehouse for shipping:

- reservation there = ready;
- reservation elsewhere = covered, not ready;
- Material Transfer moves stock, but adds no supply;
- completed physical movement makes stock ready.

PT Timboel automation moves reservation with stock. It unreserves source location. Then re-reserves target location. [[PT Timboel shipping readiness uses Sales Order warehouse]]

Transfer request must target Sales Order Item Warehouse. While request remains open, UI says wait for actual movement.

## Purchase And Manufacture

Material Request is missing-supply master. Types:

- **Purchase:** feeds Purchase Order.
- **Manufacture:** feeds Production Plan, then Work Order.
- **Material Transfer:** moves existing reserved stock. Not new supply.

Draft means tentative. Submitted means approved internal need. Neither means supply exists. Cancelled or stopped requests do not count. [[PT Timboel Material Request is the supply requirement master]]

Procurement UI rules:

- open demand: show Draft and Submitted remaining quantities, including zero;
- active Purchase/Manufacture requests: show their remaining quantities;
- demand fully covered by stock: say Purchase or Manufacture not required;
- transfer status stays under Stock, not Procurement.

[[PT Timboel fulfillment UI separates stock and procurement status]]

## Quantity Logic

```text
Outstanding = ordered - delivered
Reserved = active reserved quantity - reservation-delivered quantity
Active supply = remaining Purchase + remaining Manufacture
Planned = Reserved + Active supply
Unplanned = max(Outstanding - Planned, 0)
Overplanned = max(Planned - Outstanding, 0)

Ready = active reservation in Sales Order Item Warehouse
Reserved elsewhere = Reserved - Ready
```

Material Transfer excluded from `Active supply`. It moves covered stock. It does not cover more demand.

Use Sales Order Item row ID. Item code alone unsafe. Separate Draft and Submitted. Exclude cancelled, stopped, completed, or already-received quantity as appropriate. [[PT Timboel fulfillment quantity reconciliation remains unresolved]]

## Manufacturing Rules

Production Plan must source submitted Manufacture Material Requests. Never Sales Orders directly. This avoids duplicate demand. [[PT Timboel manufacturing planning starts from Material Requests]] [[PT Timboel Production Plans source Manufacture Material Requests only]]

One Production Plan may batch several Sales Orders. Work Orders must stay customer-specific. PT Timboel identifies work in progress by customer. [[PT Timboel Work Orders retain customer identity]] [[PT Timboel production starts with a Work Order]]

Sales Order Item identity must survive Material Request, Production Plan, and Work Order mapping. ERPNext v15 may need custom fields and server validation.

## Implementation

Current design uses:

- Sales Order HTML field `custom_fulfillment_html`;
- Sales Order Client Script;
- native Stock Reservation Entries;
- native Material Requests;
- reservation-moving automation;
- server validation for quantity and workflow safety.

Client UI helps planning. Server must prevent overplanning and race conditions. Do not auto-submit Purchase or Manufacture documents. Keep native permissions. Test on staging. [[PT Timboel Sales Order Fulfillment tab is the next ERPNext build]]

## Unresolved

- Exact partial fulfillment reconciliation against downstream documents.
- Concurrent users planning same Sales Order Item.
- New purchased or manufactured stock reservation timing.
- Pick List and Delivery Note behavior with reservations.
- Sales Order cancellation and amendment cleanup.
- Sales Order Item identity through manufacturing chain.
- Subcontracting flow. [[PT Timboel subcontracting fulfillment flow remains unresolved]]

## Sources

- [[PT Timboel Sales Order is the customer demand master]]
- [[PT Timboel Material Request is the supply requirement master]]
- [[PT Timboel uses stock reservation instead of a shipping warehouse]]
- [[PT Timboel shipping readiness uses Sales Order warehouse]]
- [[PT Timboel fulfillment UI separates stock and procurement status]]
- [[PT Timboel fulfillment supports mixed supply methods]]
- [[PT Timboel manufacturing planning starts from Material Requests]]
- [[PT Timboel Production Plans source Manufacture Material Requests only]]
- [[PT Timboel Work Orders retain customer identity]]
- [[PT Timboel fulfillment uses native ERPNext records]]
- [[PT Timboel fulfillment quantity reconciliation remains unresolved]]
- [[PT Timboel subcontracting fulfillment flow remains unresolved]]
- [[PT Timboel Sales Order Fulfillment tab is the next ERPNext build]]
