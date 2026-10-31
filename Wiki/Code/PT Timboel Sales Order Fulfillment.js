const FULFILLMENT_CONFIG = {
	doctype: {
		sales_order: "Sales Order",
		material_request: "Material Request",
		material_request_item: "Material Request Item",
		stock_reservation: "Stock Reservation Entry",
		bin: "Bin",
		warehouse: "Warehouse",
		item: "Item",
	},

	field: {
		sales_order: {
			fulfillment_html: "custom_fulfillment_html",
			items: "items",
			company: "company",
			delivery_date: "delivery_date",
			project: "project",
		},

		sales_order_item: {
			item_code: "item_code",
			item_name: "item_name",
			image: "image",
			description: "description",
			warehouse: "warehouse",
			ordered_qty: "qty",
			delivered_qty: "delivered_qty",
			uom: "uom",
			stock_uom: "stock_uom",
			conversion_factor: "conversion_factor",
			delivery_date: "delivery_date",
			project: "project",
			bom: "bom_no",
			reserve_stock: "reserve_stock",
		},

		material_request: {
			items: "items",
			type: "material_request_type",
			status: "status",
			company: "company",
			schedule_date: "schedule_date",
		},

		material_request_item: {
			item_code: "item_code",
			item_name: "item_name",
			description: "description",
			qty: "qty",
			stock_qty: "stock_qty",
			uom: "uom",
			stock_uom: "stock_uom",
			conversion_factor: "conversion_factor",
			schedule_date: "schedule_date",
			target_warehouse: "warehouse",
			source_warehouse: "from_warehouse",
			sales_order: "sales_order",
			sales_order_item: "sales_order_item",
			project: "project",
			bom: "bom_no",
		},

		stock_reservation: {
			voucher_type: "voucher_type",
			voucher_no: "voucher_no",
			voucher_detail_no: "voucher_detail_no",
			warehouse: "warehouse",
			reserved_qty: "reserved_qty",
			delivered_qty: "delivered_qty",
			status: "status",
		},

		bin: {
			item_code: "item_code",
			warehouse: "warehouse",
			actual_qty: "actual_qty",
			reserved_stock: "reserved_stock",
		},

		warehouse: {
			company: "company",
			is_group: "is_group",
			disabled: "disabled",
		},

		item: {
			image: "image",
		},
	},

	method: {
		create_stock_reservation: "create_stock_reservation_entries",
	},

	value: {
		stock_reservation_voucher_type: "Sales Order",
		material_request_type: {
			manufacture: "Manufacture",
			purchase: "Purchase",
			transfer: "Material Transfer",
		},
		inactive_material_request_statuses: ["Stopped", "Cancelled"],
	},

	limit: {
		query_rows: 500,
	},
};

const CFG = FULFILLMENT_CONFIG;
const DT = CFG.doctype;
const F = CFG.field;

frappe.ui.form.on(DT.sales_order, {
	refresh(frm) {
		render_fulfillment(frm);
	},
});

async function render_fulfillment(frm) {
	const field = frm.fields_dict[F.sales_order.fulfillment_html];

	if (!field) {
		console.warn(`Fulfillment HTML field not found: ${F.sales_order.fulfillment_html}`);
		return;
	}

	const wrapper = field.$wrapper;
	wrapper.html(`<div class="text-muted">Memuat fulfillment...</div>`);

	try {
		const rows = await load_fulfillment_data(frm);
		draw_fulfillment(frm, wrapper, rows);
	} catch (error) {
		console.error(error);
		wrapper.html(`
			<div class="alert alert-danger">
				Gagal memuat data fulfillment.<br>
				<small>${escape_html(error.message || String(error))}</small>
			</div>
		`);
	}
}

async function load_fulfillment_data(frm) {
	const so = F.sales_order;
	const soi = F.sales_order_item;
	const items = frm.doc[so.items] || [];

	if (!items.length) {
		return [];
	}

	const item_codes = [...new Set(items.map((row) => row[soi.item_code]).filter(Boolean))];
	const warehouses = await load_company_warehouses(frm.doc[so.company]);

	const [reservations, material_requests, bins, item_details] = await Promise.all([
		load_stock_reservations(frm.doc.name),
		load_material_requests(frm.doc.name),
		load_bins(item_codes, warehouses),
		load_item_details(item_codes),
	]);

	return items.map((item) => {
		const conversion_factor = flt(item[soi.conversion_factor]) || 1;
		const item_reservations = reservations.filter(
			(row) => row[F.stock_reservation.voucher_detail_no] === item.name
		);

		const reserved_stock_qty = item_reservations.reduce((total, reservation) => {
			const reserved = flt(reservation[F.stock_reservation.reserved_qty]);
			const delivered = flt(reservation[F.stock_reservation.delivered_qty]);
			return total + Math.max(reserved - delivered, 0);
		}, 0);

		const item_requests = [];
		for (const material_request of material_requests) {
			for (const request_item of material_request[F.material_request.items] || []) {
				if (request_item[F.material_request_item.sales_order_item] !== item.name) {
					continue;
				}

				const request_conversion =
					flt(request_item[F.material_request_item.conversion_factor]) || 1;
				const stock_qty =
					flt(request_item[F.material_request_item.stock_qty]) ||
					flt(request_item[F.material_request_item.qty]) * request_conversion;

				item_requests.push({
					name: material_request.name,
					type: material_request[F.material_request.type],
					status: material_request[F.material_request.status],
					docstatus: material_request.docstatus,
					stock_qty,
				});
			}
		}

		const draft_requested_stock_qty = item_requests
			.filter((row) => row.docstatus === 0)
			.reduce((total, row) => total + row.stock_qty, 0);

		const submitted_requested_stock_qty = item_requests
			.filter(
				(row) =>
					row.docstatus === 1 &&
					!CFG.value.inactive_material_request_statuses.includes(row.status)
			)
			.reduce((total, row) => total + row.stock_qty, 0);

		const ordered_qty = flt(item[soi.ordered_qty]);
		const delivered_qty = flt(item[soi.delivered_qty]);
		const outstanding_qty = Math.max(ordered_qty - delivered_qty, 0);
		const reserved_qty = reserved_stock_qty / conversion_factor;
		const draft_requested_qty = draft_requested_stock_qty / conversion_factor;
		const submitted_requested_qty = submitted_requested_stock_qty / conversion_factor;
		const planned_qty = reserved_qty + draft_requested_qty + submitted_requested_qty;
		const unplanned_qty = Math.max(outstanding_qty - planned_qty, 0);
		const overplanned_qty = Math.max(planned_qty - outstanding_qty, 0);
		const item_bins = bins.filter((row) => row[F.bin.item_code] === item[soi.item_code]);
		const bin = item_bins.find(
			(row) =>
				row[F.bin.warehouse] === item[soi.warehouse]
		);
		const available_stock_qty = bin
			? Math.max(flt(bin[F.bin.actual_qty]) - flt(bin[F.bin.reserved_stock]), 0)
			: 0;
		const item_detail = item_details.find((row) => row.name === item[soi.item_code]);
		const free_stock = item_bins
			.map((row) => ({
				warehouse: row[F.bin.warehouse],
				qty:
					Math.max(
						flt(row[F.bin.actual_qty]) - flt(row[F.bin.reserved_stock]),
						0
					) / conversion_factor,
			}))
			.filter((row) => row.qty > 0)
			.sort((a, b) => {
				if (a.warehouse === item[soi.warehouse]) return -1;
				if (b.warehouse === item[soi.warehouse]) return 1;
				return b.qty - a.qty;
			});

		return {
			item,
			image: item[soi.image] || item_detail?.[F.item.image] || "",
			conversion_factor,
			ordered_qty,
			delivered_qty,
			outstanding_qty,
			reserved_qty,
			draft_requested_qty,
			submitted_requested_qty,
			unplanned_qty,
			overplanned_qty,
			available_qty: available_stock_qty / conversion_factor,
			free_stock,
			reservations: item_reservations,
			requests: item_requests,
		};
	});
}

async function load_stock_reservations(sales_order) {
	const fields = F.stock_reservation;
	return frappe.db.get_list(DT.stock_reservation, {
		filters: {
			[fields.voucher_type]: CFG.value.stock_reservation_voucher_type,
			[fields.voucher_no]: sales_order,
			docstatus: 1,
		},
		fields: [
			"name",
			fields.voucher_detail_no,
			fields.warehouse,
			fields.reserved_qty,
			fields.delivered_qty,
			fields.status,
		],
		limit_page_length: CFG.limit.query_rows,
	});
}

async function load_material_requests(sales_order) {
	const mr = F.material_request;
	const mri = F.material_request_item;
	const parents = await frappe.db.get_list(DT.material_request, {
		filters: [
			[DT.material_request, "docstatus", "<", 2],
			[DT.material_request_item, mri.sales_order, "=", sales_order],
		],
		fields: ["name", mr.type, mr.status, "docstatus"],
		limit_page_length: CFG.limit.query_rows,
	});
	const names = [...new Set(parents.map((row) => row.name))];
	return Promise.all(names.map((name) => frappe.db.get_doc(DT.material_request, name)));
}

async function load_bins(item_codes, warehouses) {
	if (!item_codes.length || !warehouses.length) {
		return [];
	}

	const fields = F.bin;
	return frappe.db.get_list(DT.bin, {
		filters: [
			[fields.item_code, "in", item_codes],
			[fields.warehouse, "in", warehouses],
		],
		fields: [fields.item_code, fields.warehouse, fields.actual_qty, fields.reserved_stock],
		limit_page_length: CFG.limit.query_rows,
	});
}

async function load_company_warehouses(company) {
	const warehouses = await frappe.db.get_list(DT.warehouse, {
		filters: {
			[F.warehouse.company]: company,
			[F.warehouse.is_group]: 0,
			[F.warehouse.disabled]: 0,
		},
		fields: ["name"],
		limit_page_length: CFG.limit.query_rows,
	});

	return warehouses.map((row) => row.name);
}

async function load_item_details(item_codes) {
	if (!item_codes.length) {
		return [];
	}

	return frappe.db.get_list(DT.item, {
		filters: [["name", "in", item_codes]],
		fields: ["name", F.item.image],
		limit_page_length: CFG.limit.query_rows,
	});
}

function draw_fulfillment(frm, wrapper, rows) {
	if (!rows.length) {
		wrapper.html(`<div class="text-muted">Tidak ada item Sales Order.</div>`);
		return;
	}

	const soi = F.sales_order_item;
	const submitted = frm.doc.docstatus === 1;
	const has_unplanned = rows.some((row) => row.unplanned_qty > 0);
	const can_reserve = rows.some(
		(row) => row.item[soi.reserve_stock] && row.outstanding_qty - row.reserved_qty > 0
	);

	const cards = rows
		.map((row) => {
			const item = row.item;
			const uom = escape_html(item[soi.uom] || "");
			const free_stock = row.free_stock.length
				? row.free_stock
						.map(
							(stock) =>
								`<small>Tersedia ${format_qty(stock.qty)} ${uom} di ${escape_html(
									stock.warehouse
								)}</small>`
						)
						.join("")
				: `<small>Tidak ada stok tersedia</small>`;
			const image = row.image
				? `<img src="${escape_html(row.image)}" alt="${escape_html(
						item[soi.item_name] || item[soi.item_code]
				  )}" loading="lazy">`
				: `<div class="tf-no-image">Tidak ada gambar</div>`;
			const warning = row.overplanned_qty
				? `<div class="text-danger small">Kelebihan rencana: ${format_qty(
						row.overplanned_qty
				  )} ${uom}</div>`
				: "";

			return `
				<article class="tf-item-card">
					<div class="tf-item-heading">
						<div class="tf-item-image">${image}</div>
						<div class="tf-item-title">
							<strong>${escape_html(item[soi.item_code])}</strong>
							<div>${escape_html(item[soi.item_name] || "")}</div>
							<div class="text-muted small">${escape_html(
								item[soi.warehouse] || "Warehouse belum dipilih"
							)}</div>
						</div>
					</div>

					<div class="tf-metrics">
						<div class="tf-metric">
							<span>Kebutuhan</span>
							<strong>${format_qty(row.outstanding_qty)} ${uom} belum terpenuhi</strong>
							<small>Dipesan ${format_qty(row.ordered_qty)} · Dikirim ${format_qty(
								row.delivered_qty
							)}</small>
						</div>

						<div class="tf-metric">
							<span>Stok</span>
							<strong>${format_qty(row.reserved_qty)} ${uom} direservasi</strong>
							${free_stock}
						</div>

						<div class="tf-metric">
							<span>Material Request</span>
							<strong>Submitted ${format_qty(row.submitted_requested_qty)} ${uom}</strong>
							<small>Draft ${format_qty(row.draft_requested_qty)} ${uom}</small>
						</div>

						<div class="tf-metric tf-decision ${
							row.unplanned_qty > 0 ? "tf-needs-plan" : "tf-planned"
						}">
							<span>Perlu Keputusan</span>
							<strong>${format_qty(row.unplanned_qty)} ${uom}</strong>
							${warning}
						</div>
					</div>

					<details class="tf-documents">
						<summary>Dokumen terkait</summary>
						<div>${render_document_links(row)}</div>
					</details>
				</article>
			`;
		})
		.join("");

	wrapper.html(`
		<style>
			.timboel-fulfillment { display: grid; gap: 10px; margin-top: 12px; }
			.timboel-fulfillment-header {
				display: flex; justify-content: space-between; align-items: flex-start;
				flex-wrap: wrap; gap: 12px; margin-bottom: 10px;
			}
			.timboel-fulfillment-actions { display: flex; flex-wrap: wrap; gap: 6px; }
			.tf-item-card {
				border: 1px solid var(--border-color, #d1d8dd); border-radius: 8px;
				padding: 12px; background: var(--card-bg, #fff);
			}
			.tf-item-heading { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
			.tf-item-image {
				width: 76px; height: 76px; flex: 0 0 76px; overflow: hidden;
				border: 1px solid var(--border-color, #d1d8dd); border-radius: 6px;
				background: var(--subtle-fg, #f7f7f7);
			}
			.tf-item-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
			.tf-no-image {
				display: grid; place-items: center; width: 100%; height: 100%;
				font-size: 11px; color: var(--text-muted, #6c7680);
			}
			.tf-item-title { min-width: 0; }
			.tf-item-title strong, .tf-item-title div { overflow-wrap: anywhere; }
			.tf-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
			.tf-metric {
				padding: 9px; border-radius: 6px; background: var(--subtle-fg, #f7f7f7);
				display: flex; flex-direction: column; gap: 2px;
			}
			.tf-metric > span { color: var(--text-muted, #6c7680); font-size: 11px; text-transform: uppercase; }
			.tf-metric > strong { font-size: 13px; }
			.tf-metric > small { color: var(--text-muted, #6c7680); }
			.tf-decision.tf-needs-plan { background: var(--alert-bg-danger, #fff0f0); }
			.tf-decision.tf-planned { background: var(--alert-bg-green, #edf9f0); }
			.tf-documents { margin-top: 10px; font-size: 12px; }
			.tf-documents summary { cursor: pointer; color: var(--text-muted, #6c7680); }
			.tf-documents > div { margin-top: 6px; }
			@media (max-width: 600px) {
				.tf-metrics { grid-template-columns: 1fr; }
				.timboel-fulfillment-actions { width: 100%; }
				.timboel-fulfillment-actions .btn { flex: 1 1 calc(50% - 6px); }
			}
		</style>

		<div class="timboel-fulfillment-header">
			<div>
				<strong>Fulfillment Sales Order</strong>
				<div class="text-muted small">Reservasi stok dahulu. Lalu buat Material Request untuk sisanya.</div>
			</div>
			<div class="timboel-fulfillment-actions">
				<button class="btn btn-default btn-sm tf-refresh">Refresh</button>
				<button class="btn btn-primary btn-sm tf-reserve" ${
					submitted && can_reserve ? "" : "disabled"
				}>Reservasi Stok</button>
				<button class="btn btn-default btn-sm tf-manufacture" ${
					submitted && has_unplanned ? "" : "disabled"
				}>Buat Material Request Manufacture</button>
				<button class="btn btn-default btn-sm tf-purchase" ${
					submitted && has_unplanned ? "" : "disabled"
				}>Buat Material Request Purchase</button>
				<button class="btn btn-default btn-sm tf-transfer" ${
					submitted && has_unplanned ? "" : "disabled"
				}>Buat Material Request Transfer</button>
			</div>
		</div>

		<div class="timboel-fulfillment">${cards}</div>
	`);

	wrapper.off(".timboel_fulfillment");
	wrapper.on("click.timboel_fulfillment", ".tf-refresh", () => render_fulfillment(frm));
	wrapper.on("click.timboel_fulfillment", ".tf-reserve", () =>
		show_bulk_reservation_dialog(frm, rows)
	);
	wrapper.on("click.timboel_fulfillment", ".tf-manufacture", () =>
		show_bulk_material_request_dialog(frm, rows, CFG.value.material_request_type.manufacture)
	);
	wrapper.on("click.timboel_fulfillment", ".tf-purchase", () =>
		show_bulk_material_request_dialog(frm, rows, CFG.value.material_request_type.purchase)
	);
	wrapper.on("click.timboel_fulfillment", ".tf-transfer", () =>
		show_bulk_material_request_dialog(frm, rows, CFG.value.material_request_type.transfer)
	);
}

function show_bulk_reservation_dialog(frm, rows) {
	const soi = F.sales_order_item;
	const data = rows
		.filter(
			(row) => row.item[soi.reserve_stock] && row.outstanding_qty - row.reserved_qty > 0
		)
		.map((row) => {
			const item = row.item;
			const maximum_qty = Math.max(row.outstanding_qty - row.reserved_qty, 0);
			const default_qty = Math.min(maximum_qty, row.available_qty);
			return {
				__checked: default_qty > 0 ? 1 : 0,
				sales_order_item: item.name,
				item_code: item[soi.item_code],
				item_name: item[soi.item_name],
				warehouse: item[soi.warehouse],
				uom: item[soi.uom],
				available_qty: row.available_qty,
				maximum_qty,
				qty_to_reserve: default_qty,
				conversion_factor: flt(item[soi.conversion_factor]) || 1,
			};
		});

	if (!data.length) {
		frappe.msgprint({
			title: __("Tidak Ada Stok yang Bisa Direservasi"),
			message: __("Tidak ada item yang bisa direservasi. Periksa Reserve Stock pada setiap item Sales Order."),
			indicator: "orange",
		});
		return;
	}

	const warehouse_query = () => ({
		filters: {
			[F.warehouse.is_group]: 0,
			[F.warehouse.company]: frm.doc[F.sales_order.company],
		},
	});

	const dialog = new frappe.ui.Dialog({
		title: __("Reservasi Stok"),
		size: "extra-large",
		fields: [
			{
				fieldname: "set_warehouse",
				fieldtype: "Link",
				label: __("Tentukan Warehouse"),
				options: DT.warehouse,
				get_query: warehouse_query,
				onchange: () => {
					const warehouse = dialog.get_value("set_warehouse");
					if (!warehouse) return;
					for (const row of dialog.fields_dict.items.df.data) row.warehouse = warehouse;
					dialog.fields_dict.items.grid.refresh();
				},
			},
			{ fieldtype: "Section Break" },
			{
				fieldname: "items",
				fieldtype: "Table",
				label: __("Item yang Akan Direservasi"),
				cannot_add_rows: true,
				cannot_delete_rows: true,
				in_place_edit: true,
				data,
				fields: [
					{ fieldname: "sales_order_item", fieldtype: "Data", hidden: 1 },
					{
						fieldname: "item_code", fieldtype: "Link", label: __("Item"),
						options: DT.item, read_only: 1, in_list_view: 1, columns: 2,
					},
					{
						fieldname: "item_name", fieldtype: "Data", label: __("Nama Item"),
						read_only: 1, in_list_view: 1, columns: 2,
					},
					{
						fieldname: "warehouse", fieldtype: "Link", label: __("Warehouse"),
						options: DT.warehouse, reqd: 1, in_list_view: 1, columns: 2,
						get_query: warehouse_query,
					},
					{
						fieldname: "available_qty", fieldtype: "Float", label: __("Stok Tersedia"),
						read_only: 1, in_list_view: 1, columns: 1,
					},
					{
						fieldname: "maximum_qty", fieldtype: "Float", label: __("Maksimum"),
						read_only: 1, in_list_view: 1, columns: 1,
					},
					{
						fieldname: "qty_to_reserve", fieldtype: "Float", label: __("Qty Reservasi"),
						reqd: 1, in_list_view: 1, columns: 1,
					},
					{
						fieldname: "uom", fieldtype: "Data", label: __("UOM"),
						read_only: 1, in_list_view: 1, columns: 1,
					},
				],
			},
		],
		primary_action_label: __("Reservasi yang Dipilih"),
		async primary_action() {
			const selected = dialog.fields_dict.items.grid.get_selected_children();
			if (!selected.length) frappe.throw(__("Pilih minimal satu item."));

			const items_details = selected.map((row) => {
				const qty = flt(row.qty_to_reserve);
				if (qty <= 0) {
					frappe.throw(__("Qty reservasi untuk {0} harus lebih dari nol.", [row.item_code]));
				}
				if (qty > flt(row.maximum_qty)) {
					frappe.throw(__("Qty reservasi untuk {0} tidak boleh melebihi {1}.", [
						row.item_code,
						format_qty(row.maximum_qty),
					]));
				}
				return {
					name: row.sales_order_item,
					sales_order_item: row.sales_order_item,
					warehouse: row.warehouse,
					qty_to_reserve: qty,
					conversion_factor: flt(row.conversion_factor) || 1,
				};
			});

			dialog.disable_primary_action();
			try {
				await frappe.call({
					doc: frm.doc,
					method: CFG.method.create_stock_reservation,
					args: { items_details, notify: true },
					freeze: true,
					freeze_message: __("Memproses reservasi stok..."),
				});
				dialog.hide();
				await frm.reload_doc();
			} finally {
				dialog.enable_primary_action();
			}
		},
	});

	dialog.show();
}

function show_bulk_material_request_dialog(frm, rows, material_request_type) {
	const so = F.sales_order;
	const soi = F.sales_order_item;
	const mr = F.material_request;
	const mri = F.material_request_item;
	const types = CFG.value.material_request_type;
	const is_transfer = material_request_type === types.transfer;

	const data = rows
		.filter((row) => row.unplanned_qty > 0)
		.map((row) => {
			const item = row.item;
			return {
				__checked: 1,
				sales_order_item: item.name,
				item_code: item[soi.item_code],
				item_name: item[soi.item_name],
				description: item[soi.description],
				uom: item[soi.uom],
				stock_uom: item[soi.stock_uom],
				conversion_factor: flt(item[soi.conversion_factor]) || 1,
				maximum_qty: row.unplanned_qty,
				qty: row.unplanned_qty,
				target_warehouse: item[soi.warehouse],
				source_warehouse: "",
				schedule_date:
					item[soi.delivery_date] || frm.doc[so.delivery_date] || frappe.datetime.get_today(),
				project: item[soi.project] || frm.doc[so.project],
				bom: item[soi.bom],
			};
		});

	if (!data.length) {
		frappe.msgprint(__("Tidak ada qty yang belum direncanakan."));
		return;
	}

	const warehouse_query = () => ({
		filters: {
			[F.warehouse.is_group]: 0,
			[F.warehouse.company]: frm.doc[so.company],
		},
	});

	const table_fields = [
		{ fieldname: "sales_order_item", fieldtype: "Data", hidden: 1 },
		{
			fieldname: "item_code", fieldtype: "Link", label: __("Item"), options: DT.item,
			read_only: 1, in_list_view: 1, columns: 2,
		},
		{
			fieldname: "item_name", fieldtype: "Data", label: __("Nama Item"),
			read_only: 1, in_list_view: 1, columns: 2,
		},
		{
			fieldname: "maximum_qty", fieldtype: "Float", label: __("Belum Direncanakan"),
			read_only: 1, in_list_view: 1, columns: 1,
		},
		{
			fieldname: "qty", fieldtype: "Float", label: __("Qty Material Request"),
			reqd: 1, in_list_view: 1, columns: 1,
		},
		{
			fieldname: "uom", fieldtype: "Data", label: __("UOM"),
			read_only: 1, in_list_view: 1, columns: 1,
		},
	];

	if (is_transfer) {
		table_fields.push({
			fieldname: "source_warehouse", fieldtype: "Link", label: __("Source Warehouse"),
			options: DT.warehouse, reqd: 1, in_list_view: 1, columns: 2,
			get_query: warehouse_query,
		});
	}

	table_fields.push({
		fieldname: "target_warehouse", fieldtype: "Link", label: __("Target Warehouse"),
		options: DT.warehouse, reqd: 1, in_list_view: 1, columns: 2,
		get_query: warehouse_query,
	});

	let dialog;
	const fields = [];
	if (is_transfer) {
		fields.push(
			{
				fieldname: "set_source_warehouse",
				fieldtype: "Link",
				label: __("Tentukan Source Warehouse"),
				options: DT.warehouse,
				get_query: warehouse_query,
				onchange: () => {
					const warehouse = dialog.get_value("set_source_warehouse");
					if (!warehouse) return;
					for (const row of dialog.fields_dict.items.df.data) row.source_warehouse = warehouse;
					dialog.fields_dict.items.grid.refresh();
				},
			},
			{ fieldtype: "Column Break" }
		);
	}

	fields.push(
		{
			fieldname: "set_target_warehouse",
			fieldtype: "Link",
			label: __("Tentukan Target Warehouse"),
			options: DT.warehouse,
			get_query: warehouse_query,
			onchange: () => {
				const warehouse = dialog.get_value("set_target_warehouse");
				if (!warehouse) return;
				for (const row of dialog.fields_dict.items.df.data) row.target_warehouse = warehouse;
				dialog.fields_dict.items.grid.refresh();
			},
		},
		{ fieldtype: "Section Break" },
		{
			fieldname: "items",
			fieldtype: "Table",
			label: __("Item"),
			cannot_add_rows: true,
			cannot_delete_rows: true,
			in_place_edit: true,
			data,
			fields: table_fields,
		}
	);

	dialog = new frappe.ui.Dialog({
		title: __(`Buat Material Request ${material_request_type}`),
		size: "extra-large",
		fields,
		primary_action_label: __("Buka Draft"),
		primary_action() {
			const selected = dialog.fields_dict.items.grid.get_selected_children();
			if (!selected.length) frappe.throw(__("Pilih minimal satu item."));

			for (const row of selected) {
				const qty = flt(row.qty);
				if (qty <= 0) {
					frappe.throw(__("Qty untuk {0} harus lebih dari nol.", [row.item_code]));
				}
				if (qty > flt(row.maximum_qty)) {
					frappe.throw(__("Qty untuk {0} tidak boleh melebihi qty belum direncanakan {1}.", [
						row.item_code,
						format_qty(row.maximum_qty),
					]));
				}
				if (!row.target_warehouse) {
					frappe.throw(__("Target Warehouse wajib diisi untuk {0}.", [row.item_code]));
				}
				if (is_transfer && !row.source_warehouse) {
					frappe.throw(__("Source Warehouse wajib diisi untuk {0}.", [row.item_code]));
				}
				if (is_transfer && row.source_warehouse === row.target_warehouse) {
					frappe.throw(__("Source dan Target Warehouse tidak boleh sama untuk {0}.", [
						row.item_code,
					]));
				}
			}

			const parent_schedule_date = frm.doc[so.delivery_date] || frappe.datetime.get_today();
			dialog.hide();

			frappe.new_doc(
				DT.material_request,
				{
					[mr.type]: material_request_type,
					[mr.company]: frm.doc[so.company],
					[mr.schedule_date]: parent_schedule_date,
				},
				(doc) => {
					for (const selected_row of selected) {
						const request_item = frappe.model.add_child(
							doc,
							DT.material_request_item,
							mr.items
						);
						const conversion_factor = flt(selected_row.conversion_factor) || 1;
						request_item[mri.item_code] = selected_row.item_code;
						request_item[mri.item_name] = selected_row.item_name;
						request_item[mri.description] = selected_row.description;
						request_item[mri.qty] = flt(selected_row.qty);
						request_item[mri.uom] = selected_row.uom;
						request_item[mri.stock_uom] = selected_row.stock_uom;
						request_item[mri.conversion_factor] = conversion_factor;
						request_item[mri.stock_qty] = flt(selected_row.qty) * conversion_factor;
						request_item[mri.schedule_date] = selected_row.schedule_date;
						request_item[mri.target_warehouse] = selected_row.target_warehouse;
						request_item[mri.source_warehouse] = is_transfer
							? selected_row.source_warehouse
							: null;
						request_item[mri.sales_order] = frm.doc.name;
						request_item[mri.sales_order_item] = selected_row.sales_order_item;
						request_item[mri.project] = selected_row.project;
						request_item[mri.bom] =
							material_request_type === types.manufacture ? selected_row.bom : null;
					}
				}
			);
		},
	});

	dialog.show();
}

function render_document_links(row) {
	const requests = [...new Map(row.requests.map((request) => [request.name, request])).values()];
	const request_links = requests.map((request) => {
		const status = request.docstatus === 0 ? "Draft" : request.status || "Submitted";
		return `
			<div>
				<a href="${get_form_link(DT.material_request, request.name)}">
					${escape_html(request.name)}
				</a>
				<small class="text-muted">${escape_html(request.type)} · ${escape_html(status)}</small>
			</div>
		`;
	});
	const reservation_links = row.reservations.map(
		(reservation) => `
			<div>
				<a href="${get_form_link(DT.stock_reservation, reservation.name)}">
					${escape_html(reservation.name)}
				</a>
				<small class="text-muted">${escape_html(
					reservation[F.stock_reservation.warehouse] || ""
				)}</small>
			</div>
		`
	);
	const links = [...request_links, ...reservation_links];
	return links.length ? links.join("") : `<span class="text-muted">None</span>`;
}

function get_form_link(doctype, name) {
	return `/app/${frappe.router.slug(doctype)}/${encodeURIComponent(name)}`;
}

function format_qty(value) {
	return format_number(flt(value), null, 2);
}

function escape_html(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
