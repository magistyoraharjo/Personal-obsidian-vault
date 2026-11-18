const MATERIAL_REQUEST_CONFIG = {
  warehouse: "Warehouse Produksi Tirto - TIM",
  source_type: "Material Transfer",
  target_type: "Manufacture",
  button_label: "Make Manufacture Request",
  button_group: "Create",
  enough_stock_message: "Enough stock is available.",
  shortage_message: "These items are not available in the requested quantity:",
  confirm_message: "Create a Manufacture Request?"
};

frappe.ui.form.on("Material Request", {
  refresh(frm) {
    if (
      frm.doc.docstatus !== 1 ||
      frm.doc.material_request_type !== MATERIAL_REQUEST_CONFIG.source_type
    ) {
      return;
    }

    frm.add_custom_button(
      MATERIAL_REQUEST_CONFIG.button_label,
      () => make_manufacture_request(frm),
      MATERIAL_REQUEST_CONFIG.button_group
    );
  }
});

async function make_manufacture_request(frm) {
  const shortages = [];

  for (const item of frm.doc.items) {
    const result = await frappe.db.get_value(
      "Bin",
      {
        item_code: item.item_code,
        warehouse: MATERIAL_REQUEST_CONFIG.warehouse
      },
      "actual_qty"
    );

    const available_qty = flt(result.message?.actual_qty);
    const pending_qty = Math.max(
      flt(item.qty) - flt(item.ordered_qty),
      0
    );
    const shortage_qty = Math.max(pending_qty - available_qty, 0);

    if (shortage_qty > 0) {
      shortages.push({
        item_code: item.item_code,
        qty: shortage_qty,
        warehouse: MATERIAL_REQUEST_CONFIG.warehouse,
        schedule_date: item.schedule_date || frappe.datetime.get_today()
      });
    }
  }

  if (!shortages.length) {
    frappe.msgprint(MATERIAL_REQUEST_CONFIG.enough_stock_message);
    return;
  }

  const item_list = shortages
    .map(item => `<li>${item.item_code}: ${item.qty}</li>`)
    .join("");

  frappe.confirm(
    `${MATERIAL_REQUEST_CONFIG.shortage_message}
      <ul>${item_list}</ul>
      ${MATERIAL_REQUEST_CONFIG.confirm_message}`,
    () => open_manufacture_request(frm, shortages)
  );
}

function open_manufacture_request(frm, shortages) {
  frappe.model.with_doctype("Material Request", () => {
    const request = frappe.model.get_new_doc("Material Request");

    request.company = frm.doc.company;
    request.material_request_type = MATERIAL_REQUEST_CONFIG.target_type;

    for (const shortage of shortages) {
      const row = frappe.model.add_child(
        request,
        "Material Request Item",
        "items"
      );

      Object.assign(row, shortage);
    }

    frappe.set_route("Form", "Material Request", request.name);
  });
}
