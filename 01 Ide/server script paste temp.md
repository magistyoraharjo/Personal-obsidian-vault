```
# Server Script: timboel_website_image_scrubber
# Type: Scheduler Event
# Cron: 0 2 * * *

BASE_URL = "https://is3.cloudhost.id/image-timboel/product-img/"

ITEM_INCLUDE_FIELD = "custom_include_in_website"

MAX_INDEX = 3

# Business limits
MAX_UPDATED_ITEMS = 10
MAX_CHECKED_ITEMS = 50

# Safety limit so the scheduled job does not become too heavy
MAX_REMOTE_PROBES = 300

storage_groups = {
    "depan": ["detail", "gallery", "box", "story"],
    "kiri": ["detail", "gallery", "box", "story"],
    "kanan": ["detail", "gallery", "box", "story"],
    "belakang": ["detail", "gallery", "box", "story"],
    "sudut": ["detail", "gallery", "box", "story", "hero", "thumbnail", "hbanner"],
    "interior": ["detail", "gallery", "hero"],
    "exterior": ["detail", "gallery", "hero"],
}


def image_exists(url):
    try:
        frappe.make_get_request(
            url,
            headers={"Range": "bytes=0-0"}
        )
        return True
    except Exception:
        return False


def get_expected_urls(item_code):
    urls = []

    for storage, resolutions in storage_groups.items():
        for res in resolutions:
            for i in range(0, MAX_INDEX + 1):
                nn = "" if i == 0 else str(i).zfill(2)

                url = BASE_URL + item_code + "_" + storage + nn + "_" + res + ".jpg"

                urls.append({
                    "storage": storage,
                    "res": res,
                    "nn": nn,
                    "url": url,
                })

    return urls


def get_attached_urls(item_name):
    rows = frappe.get_all(
        "File",
        filters={
            "attached_to_doctype": "Item",
            "attached_to_name": item_name,
        },
        fields=["file_url"],
        limit_page_length=1000,
    )

    attached = set()

    for row in rows:
        if row.file_url:
            attached.add(row.file_url)

    return attached


def attach_file(item_name, item_code, storage, res, nn, url):
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": item_code + " " + storage.title() + nn + " " + res.title() + ".jpg",
        "file_url": url,
        "is_private": 0,
        "attached_to_doctype": "Item",
        "attached_to_name": item_name,
    })

    # Optional File custom fields.
    # These only apply if the fields exist.
    file_meta = frappe.get_meta("File")

    if file_meta.has_field("custom_include_in_website"):
        file_doc.custom_include_in_website = 1

    if file_meta.has_field("custom_image_role"):
        if res == "thumbnail":
            file_doc.custom_image_role = "Thumbnail"
        elif res == "hero":
            file_doc.custom_image_role = "Hero"
        elif res == "hbanner":
            file_doc.custom_image_role = "HBanner"
        elif res == "gallery":
            file_doc.custom_image_role = "Gallery"
        elif storage == "sudut" and res in ["detail", "box", "story"]:
            file_doc.custom_image_role = "Main"
        else:
            file_doc.custom_image_role = "Detail"

    file_doc.insert(ignore_permissions=True)


# 1. Get website Items
items = frappe.get_all(
    "Item",
    filters={
        ITEM_INCLUDE_FIELD: 1,
        "disabled": 0,
    },
    fields=["name", "item_code"],
    order_by="item_code asc",
    limit_page_length=5000,
)

total_items = len(items)

if total_items == 0:
    frappe.log_error(
        "No website Items found.",
        "Website Image Scrubber"
    )

else:
    # 2. Deterministic nightly rotation
    today = frappe.utils.getdate(frappe.utils.today())
    day_of_year = int(today.strftime("%j"))

    start_index = (day_of_year * MAX_CHECKED_ITEMS) % total_items

    updated_items = 0
    checked_items = 0
    remote_probes = 0
    attached_total = 0
    failed_total = 0

    # Wraparound scan order
    ordered_items = items[start_index:] + items[:start_index]

    for item in ordered_items:
        if updated_items >= MAX_UPDATED_ITEMS:
            break

        if checked_items >= MAX_CHECKED_ITEMS:
            break

        if remote_probes >= MAX_REMOTE_PROBES:
            break

        item_name = item.name
        item_code = item.item_code

        checked_items += 1

        expected = get_expected_urls(item_code)
        attached_urls = get_attached_urls(item_name)

        item_attached_count = 0

        for image in expected:
            if remote_probes >= MAX_REMOTE_PROBES:
                break

            url = image["url"]

            # Already attached; no need to probe S3
            if url in attached_urls:
                continue

            remote_probes += 1

            # Missing image is normal. Do not log it.
            if not image_exists(url):
                continue

            # Race-condition protection:
            # another process may have attached it after attached_urls was loaded.
            if frappe.db.exists("File", {
                "attached_to_doctype": "Item",
                "attached_to_name": item_name,
                "file_url": url,
            }):
                continue

            try:
                attach_file(
                    item_name=item_name,
                    item_code=item_code,
                    storage=image["storage"],
                    res=image["res"],
                    nn=image["nn"],
                    url=url,
                )
```
frappe.log_error(    "Scheduler fired at " + frappe.utils.now(),    "TIMBOEL SCHEDULER TEST")
```
                item_attached_count += 1
                attached_total += 1

            except Exception as e:
                failed_total += 1

                frappe.log_error(
                    "Item: " + item_name
                    + "\nItem Code: " + item_code
                    + "\nURL: " + url
                    + "\nError: " + str(e),
                    "Website Image Scrubber Attach Failed"
                )

        if item_attached_count > 0:
            updated_items += 1

    frappe.log_error(
        "Checked Items: " + str(checked_items)
        + "\nUpdated Items: " + str(updated_items)
        + "\nAttached Files: " + str(attached_total)
        + "\nRemote Probes: " + str(remote_probes)
        + "\nFailed Inserts: " + str(failed_total)
        + "\nStart Index: " + str(start_index)
        + "\nTotal Website Items: " + str(total_items),
        "Website Image Scrubber Result"
    )
```