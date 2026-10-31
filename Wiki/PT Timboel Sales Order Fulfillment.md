# PT Timboel Sales Order Fulfillment

PT Timboel will plan customer-order fulfillment inside each Sales Order. Custom Fulfillment tab shows demand, reserved stock, supply requests, and work still unplanned. Tab is interface only. Native ERPNext documents remain source of truth. [[PT Timboel Sales Order is the customer demand master]] [[PT Timboel fulfillment uses native ERPNext records]]

## Core Flow

```text
Sales Order
  -> reserve available stock
     -> Stock Reservation Entry
  -> request missing supply
     -> Material Request
        -> Manufacture -> Production Plan -> Work Order
        -> Purchase -> Purchase Order
        -> Material Transfer -> Stock Entry
  -> Delivery Note
```

Sales Order holds customer demand. Material Request holds supply need. Stock Reservation assigns available stock to one customer. Delivery Note records dispatch. [[PT Timboel Sales Order is the customer demand master]] [[PT Timboel Material Request is the supply requirement master]] [[PT Timboel uses stock reservation instead of a shipping warehouse]]

## Fulfillment Tab

Each Sales Order row should show:

- ordered quantity;
- delivered quantity;
- reserved quantity;
- draft-requested quantity;
- submitted-requested quantity;
- unplanned quantity;
- linked Material Requests;
- linked Stock Reservations.

Main actions:

- **Reserve Stock:** create native Stock Reservation Entry for available quantity.
- **Create Material Request:** create draft Manufacture, Purchase, or Material Transfer request.

Partial planning is required. Example: order 10, reserve 3, request manufacture 5, request purchase 2. One Sales Order row is not locked to one supply method. [[PT Timboel fulfillment supports mixed supply methods]] [[PT Timboel Sales Order Fulfillment tab is the next ERPNext build]]

## Stock Allocation

Finished goods stay in actual warehouse. Reservation says which customer owns available quantity. No virtual Shipping warehouse. Warehouse transfer happens only when goods physically move. [[PT Timboel uses stock reservation instead of a shipping warehouse]]

New manufactured or purchased stock may need later manual reservation. Automatic reservation, Pick List behavior, and Delivery Note behavior need testing on PT Timboel's ERPNext v15 system. [[PT Timboel fulfillment quantity reconciliation remains unresolved]]

## Supply Requests

Material Request is common start for missing supply:

- **Manufacture:** feeds Production Plan, then Work Order.
- **Purchase:** feeds Purchase Order.
- **Material Transfer:** feeds Stock Entry when stock must move.

Draft request means tentative plan. Submitted request means approved need. Neither means item is complete or available. Cancelled request does not count. [[PT Timboel Material Request is the supply requirement master]]

Production Plan should source Manufacture Material Requests, not Sales Orders. It keeps native BOM explosion, material planning, consolidation, and Work Order creation. Work Order remains actual production trigger. [[PT Timboel manufacturing planning starts from Material Requests]] [[PT Timboel production starts with a Work Order]]

Restricting Production Plan's source selector to Material Request is proposed, not built. Client Script can restrict UI. Server validation is needed if API and integration calls must also obey rule.

## Quantity Logic

Current concept:

```text
Outstanding demand = ordered - delivered
Unplanned = outstanding demand - reserved stock - active supply requests
```

This formula is not final. Correct calculation must:

- use Sales Order Item row ID, not item code alone;
- separate draft and submitted requests;
- handle partial request fulfillment;
- exclude cancelled, stopped, or closed demand;
- avoid counting Material Requests and their downstream documents twice;
- avoid counting delivered quantity twice;
- account for stock reserved elsewhere;
- protect against two users planning same quantity.

Exact ERPNext v15 fields and native behavior must be checked on staging. [[PT Timboel fulfillment quantity reconciliation remains unresolved]]

## Build Scope

Next build uses:

- Sales Order custom HTML field `custom_fulfillment_html`;
- Sales Order Client Script for display and actions;
- API Server Script for loading, reconciliation, draft Material Request creation, and native stock reservation;
- optional Production Plan Client Script to prefer Material Request;
- optional server validation against overplanning and unsupported Production Plan sources.

Do not auto-submit purchase or manufacturing documents. Keep native permissions. Test on staging first. Old `timboel_fulfillment_v0_1.zip` must not be installed unchanged. [[PT Timboel Sales Order Fulfillment tab is the next ERPNext build]]

## Outside Current Decision

Subcontracting path is still open. Simplified Purchase Order buttons may hide steps, but native Subcontracting Order, stock movement, receipt, and accounting records must remain. [[PT Timboel subcontracting fulfillment flow remains unresolved]]

## Open Technical Questions

- Which ERPNext v15 fields link Material Request Item to Sales Order Item?
- Can native Stock Reservation support required scripted creation flow?
- How should completed supply reduce active requested quantity without double-counting?
- When should new finished stock become reserved?
- How do Stock Reservations interact with Pick Lists and Delivery Notes?
- What cleanup is needed after Sales Order cancellation or amendment?
- How should subcontracting enter Material Request-based planning?

## Sources

- [[PT Timboel Sales Order is the customer demand master]]
- [[PT Timboel Material Request is the supply requirement master]]
- [[PT Timboel uses stock reservation instead of a shipping warehouse]]
- [[PT Timboel fulfillment supports mixed supply methods]]
- [[PT Timboel manufacturing planning starts from Material Requests]]
- [[PT Timboel fulfillment uses native ERPNext records]]
- [[PT Timboel fulfillment quantity reconciliation remains unresolved]]
- [[PT Timboel subcontracting fulfillment flow remains unresolved]]
- [[PT Timboel Sales Order Fulfillment tab is the next ERPNext build]]
