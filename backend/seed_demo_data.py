from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

import bcrypt

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.database import get_db


def make_password_hash(plain_text: str) -> str:
    return bcrypt.hashpw(plain_text.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


DEMO_USER_IDS = {
    "manager": "11111111-1111-4111-8111-111111111111",
    "staff": "22222222-2222-4222-8222-222222222222",
}

DEMO_CATEGORY_IDS = {
    "motors": "31000000-0000-4000-8000-000000000001",
    "sensors": "31000000-0000-4000-8000-000000000002",
    "electronics": "31000000-0000-4000-8000-000000000003",
    "consumables": "31000000-0000-4000-8000-000000000004",
}

DEMO_WAREHOUSE_IDS = {
    "main": "32000000-0000-4000-8000-000000000001",
    "north": "32000000-0000-4000-8000-000000000002",
    "overflow": "32000000-0000-4000-8000-000000000003",
}

DEMO_PRODUCT_IDS = {
    "servo": "33000000-0000-4000-8000-000000000001",
    "sensor": "33000000-0000-4000-8000-000000000002",
    "pcb": "33000000-0000-4000-8000-000000000003",
    "paste": "33000000-0000-4000-8000-000000000004",
    "bearing": "33000000-0000-4000-8000-000000000005",
    "orings": "33000000-0000-4000-8000-000000000006",
}

DEMO_OPERATION_IDS = {
    "receipt_done": "34000000-0000-4000-8000-000000000001",
    "delivery_ready": "34000000-0000-4000-8000-000000000002",
    "transfer_waiting": "34000000-0000-4000-8000-000000000003",
    "adjustment_done": "34000000-0000-4000-8000-000000000004",
    "receipt_draft": "34000000-0000-4000-8000-000000000005",
    "delivery_canceled": "34000000-0000-4000-8000-000000000006",
}


def seed_demo_data() -> None:
    now = datetime.now(timezone.utc)
    otp_expires_at = now + timedelta(minutes=30)

    users = [
        {
            "id": DEMO_USER_IDS["manager"],
            "email": "manager.demo@advancedims.local",
            "password": make_password_hash("DemoManager123!"),
            "name": "Ayesha Khan",
            "role": "MANAGER",
            "otp": "582314",
            "otpexpiry": otp_expires_at,
            "createdat": now - timedelta(days=14),
            "updatedat": now - timedelta(hours=6),
        },
        {
            "id": DEMO_USER_IDS["staff"],
            "email": "staff.demo@advancedims.local",
            "password": make_password_hash("DemoStaff123!"),
            "name": "Rafay Ali",
            "role": "WAREHOUSE_STAFF",
            "otp": None,
            "otpexpiry": None,
            "createdat": now - timedelta(days=10),
            "updatedat": now - timedelta(hours=2),
        },
    ]

    categories = [
        {"id": DEMO_CATEGORY_IDS["motors"], "name": "Demo Motors", "createdat": now - timedelta(days=9), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_CATEGORY_IDS["sensors"], "name": "Demo Sensors", "createdat": now - timedelta(days=9), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_CATEGORY_IDS["electronics"], "name": "Demo Electronics", "createdat": now - timedelta(days=9), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_CATEGORY_IDS["consumables"], "name": "Demo Consumables", "createdat": now - timedelta(days=9), "updatedat": now - timedelta(days=1)},
    ]

    warehouses = [
        {"id": DEMO_WAREHOUSE_IDS["main"], "name": "Main Distribution Center", "location": "Karachi South Hub", "createdat": now - timedelta(days=8), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_WAREHOUSE_IDS["north"], "name": "North Annex", "location": "Lahore Logistics Park", "createdat": now - timedelta(days=8), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_WAREHOUSE_IDS["overflow"], "name": "Overflow Storage", "location": "Islamabad Backup Facility", "createdat": now - timedelta(days=8), "updatedat": now - timedelta(days=1)},
    ]

    products = [
        {"id": DEMO_PRODUCT_IDS["servo"], "sku": "DEMO-SRV-001", "name": "Demo Servo Motor A12", "categoryid": DEMO_CATEGORY_IDS["motors"], "uom": "pcs", "initialstock": 18, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_PRODUCT_IDS["sensor"], "sku": "DEMO-SNS-001", "name": "Demo Industrial Sensor Pro X", "categoryid": DEMO_CATEGORY_IDS["sensors"], "uom": "pcs", "initialstock": 12, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_PRODUCT_IDS["pcb"], "sku": "DEMO-PCB-001", "name": "Demo PCB Board Rev.4", "categoryid": DEMO_CATEGORY_IDS["electronics"], "uom": "pcs", "initialstock": 40, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_PRODUCT_IDS["paste"], "sku": "DEMO-CNS-001", "name": "Demo Thermal Paste TG-7", "categoryid": DEMO_CATEGORY_IDS["consumables"], "uom": "tubes", "initialstock": 24, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_PRODUCT_IDS["bearing"], "sku": "DEMO-MTR-002", "name": "Demo Bearing Assembly BA-44", "categoryid": DEMO_CATEGORY_IDS["motors"], "uom": "pcs", "initialstock": 6, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_PRODUCT_IDS["orings"], "sku": "DEMO-CNS-002", "name": "Demo O-Ring Kit ORK-15", "categoryid": DEMO_CATEGORY_IDS["consumables"], "uom": "kits", "initialstock": 15, "createdat": now - timedelta(days=7), "updatedat": now - timedelta(days=1)},
    ]

    operations = [
        {"id": DEMO_OPERATION_IDS["receipt_done"], "type": "RECEIPT", "status": "DONE", "reference": "DEMO-RCPT-001", "suppliername": "Atlas Components Ltd.", "sourcewarehouseid": None, "destinationwarehouseid": DEMO_WAREHOUSE_IDS["main"], "requestedby": DEMO_USER_IDS["manager"], "createdat": now - timedelta(days=5), "updatedat": now - timedelta(days=5)},
        {"id": DEMO_OPERATION_IDS["delivery_ready"], "type": "DELIVERY", "status": "READY", "reference": "DEMO-DEL-001", "suppliername": "Metro Industrial Customer", "sourcewarehouseid": DEMO_WAREHOUSE_IDS["main"], "destinationwarehouseid": None, "requestedby": DEMO_USER_IDS["staff"], "createdat": now - timedelta(days=3), "updatedat": now - timedelta(days=2)},
        {"id": DEMO_OPERATION_IDS["transfer_waiting"], "type": "TRANSFER", "status": "WAITING", "reference": "DEMO-TRF-001", "suppliername": None, "sourcewarehouseid": DEMO_WAREHOUSE_IDS["main"], "destinationwarehouseid": DEMO_WAREHOUSE_IDS["north"], "requestedby": DEMO_USER_IDS["staff"], "createdat": now - timedelta(days=2), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_OPERATION_IDS["adjustment_done"], "type": "ADJUSTMENT", "status": "DONE", "reference": "DEMO-ADJ-001", "suppliername": "Cycle Count Reconciliation", "sourcewarehouseid": DEMO_WAREHOUSE_IDS["overflow"], "destinationwarehouseid": None, "requestedby": DEMO_USER_IDS["manager"], "createdat": now - timedelta(days=1), "updatedat": now - timedelta(days=1)},
        {"id": DEMO_OPERATION_IDS["receipt_draft"], "type": "RECEIPT", "status": "DRAFT", "reference": "DEMO-RCPT-002", "suppliername": "Precision Boards Inc.", "sourcewarehouseid": None, "destinationwarehouseid": DEMO_WAREHOUSE_IDS["north"], "requestedby": DEMO_USER_IDS["manager"], "createdat": now - timedelta(hours=18), "updatedat": now - timedelta(hours=18)},
        {"id": DEMO_OPERATION_IDS["delivery_canceled"], "type": "DELIVERY", "status": "CANCELED", "reference": "DEMO-DEL-002", "suppliername": "Northern Service Partner", "sourcewarehouseid": DEMO_WAREHOUSE_IDS["north"], "destinationwarehouseid": None, "requestedby": DEMO_USER_IDS["staff"], "createdat": now - timedelta(hours=10), "updatedat": now - timedelta(hours=6)},
    ]

    operation_items = [
        {"id": "35000000-0000-4000-8000-000000000001", "operationid": DEMO_OPERATION_IDS["receipt_done"], "productid": DEMO_PRODUCT_IDS["servo"], "quantity": 25},
        {"id": "35000000-0000-4000-8000-000000000002", "operationid": DEMO_OPERATION_IDS["receipt_done"], "productid": DEMO_PRODUCT_IDS["sensor"], "quantity": 40},
        {"id": "35000000-0000-4000-8000-000000000003", "operationid": DEMO_OPERATION_IDS["delivery_ready"], "productid": DEMO_PRODUCT_IDS["pcb"], "quantity": 12},
        {"id": "35000000-0000-4000-8000-000000000004", "operationid": DEMO_OPERATION_IDS["delivery_ready"], "productid": DEMO_PRODUCT_IDS["paste"], "quantity": 8},
        {"id": "35000000-0000-4000-8000-000000000005", "operationid": DEMO_OPERATION_IDS["transfer_waiting"], "productid": DEMO_PRODUCT_IDS["bearing"], "quantity": 5},
        {"id": "35000000-0000-4000-8000-000000000006", "operationid": DEMO_OPERATION_IDS["transfer_waiting"], "productid": DEMO_PRODUCT_IDS["orings"], "quantity": 10},
        {"id": "35000000-0000-4000-8000-000000000007", "operationid": DEMO_OPERATION_IDS["adjustment_done"], "productid": DEMO_PRODUCT_IDS["bearing"], "quantity": 2},
        {"id": "35000000-0000-4000-8000-000000000008", "operationid": DEMO_OPERATION_IDS["receipt_draft"], "productid": DEMO_PRODUCT_IDS["pcb"], "quantity": 16},
        {"id": "35000000-0000-4000-8000-000000000009", "operationid": DEMO_OPERATION_IDS["delivery_canceled"], "productid": DEMO_PRODUCT_IDS["sensor"], "quantity": 3},
    ]

    stock_movements = [
        {"id": "36000000-0000-4000-8000-000000000001", "productid": DEMO_PRODUCT_IDS["servo"], "warehouseid": DEMO_WAREHOUSE_IDS["main"], "quantity": 25, "type": "IN", "operationid": DEMO_OPERATION_IDS["receipt_done"], "createdat": now - timedelta(days=5)},
        {"id": "36000000-0000-4000-8000-000000000002", "productid": DEMO_PRODUCT_IDS["sensor"], "warehouseid": DEMO_WAREHOUSE_IDS["main"], "quantity": 40, "type": "IN", "operationid": DEMO_OPERATION_IDS["receipt_done"], "createdat": now - timedelta(days=5)},
        {"id": "36000000-0000-4000-8000-000000000003", "productid": DEMO_PRODUCT_IDS["bearing"], "warehouseid": DEMO_WAREHOUSE_IDS["overflow"], "quantity": 2, "type": "OUT", "operationid": DEMO_OPERATION_IDS["adjustment_done"], "createdat": now - timedelta(days=1)},
    ]

    demo_emails = [user["email"] for user in users]
    demo_category_names = [category["name"] for category in categories]
    demo_warehouse_names = [warehouse["name"] for warehouse in warehouses]
    demo_product_skus = [product["sku"] for product in products]
    demo_operation_refs = [operation["reference"] for operation in operations]
    demo_operation_ids = [operation["id"] for operation in operations]
    demo_product_ids = [product["id"] for product in products]
    demo_item_ids = [item["id"] for item in operation_items]
    demo_movement_ids = [movement["id"] for movement in stock_movements]

    with get_db() as conn:
        cur = conn.cursor()

        cur.execute('DELETE FROM "StockMovement" WHERE id = ANY(%s::uuid[]) OR operationid = ANY(%s::uuid[]) OR productid = ANY(%s::uuid[])', (demo_movement_ids, demo_operation_ids, demo_product_ids))
        cur.execute('DELETE FROM "OperationItem" WHERE id = ANY(%s::uuid[]) OR operationid = ANY(%s::uuid[])', (demo_item_ids, demo_operation_ids))
        cur.execute('DELETE FROM "Operation" WHERE reference = ANY(%s) OR id = ANY(%s::uuid[])', (demo_operation_refs, demo_operation_ids))
        cur.execute('DELETE FROM "Product" WHERE sku = ANY(%s) OR id = ANY(%s::uuid[])', (demo_product_skus, demo_product_ids))
        cur.execute('DELETE FROM "Category" WHERE name = ANY(%s) OR id = ANY(%s::uuid[])', (demo_category_names, list(DEMO_CATEGORY_IDS.values())))
        cur.execute('DELETE FROM "Warehouse" WHERE name = ANY(%s) OR id = ANY(%s::uuid[])', (demo_warehouse_names, list(DEMO_WAREHOUSE_IDS.values())))
        cur.execute('DELETE FROM "User" WHERE email = ANY(%s) OR id = ANY(%s::uuid[])', (demo_emails, list(DEMO_USER_IDS.values())))

        cur.executemany(
            '''
            INSERT INTO "User" (id, email, password, name, role, otp, otpexpiry, createdat, updatedat)
            VALUES (%(id)s, %(email)s, %(password)s, %(name)s, %(role)s, %(otp)s, %(otpexpiry)s, %(createdat)s, %(updatedat)s)
            ''',
            users,
        )
        cur.executemany(
            '''
            INSERT INTO "Category" (id, name, createdat, updatedat)
            VALUES (%(id)s, %(name)s, %(createdat)s, %(updatedat)s)
            ''',
            categories,
        )
        cur.executemany(
            '''
            INSERT INTO "Warehouse" (id, name, location, createdat, updatedat)
            VALUES (%(id)s, %(name)s, %(location)s, %(createdat)s, %(updatedat)s)
            ''',
            warehouses,
        )
        cur.executemany(
            '''
            INSERT INTO "Product" (id, sku, name, categoryid, uom, initialstock, createdat, updatedat)
            VALUES (%(id)s, %(sku)s, %(name)s, %(categoryid)s, %(uom)s, %(initialstock)s, %(createdat)s, %(updatedat)s)
            ''',
            products,
        )
        cur.executemany(
            '''
            INSERT INTO "Operation" (id, type, status, reference, suppliername, sourcewarehouseid, destinationwarehouseid, requestedby, createdat, updatedat)
            VALUES (%(id)s, %(type)s, %(status)s, %(reference)s, %(suppliername)s, %(sourcewarehouseid)s, %(destinationwarehouseid)s, %(requestedby)s, %(createdat)s, %(updatedat)s)
            ''',
            operations,
        )
        cur.executemany(
            '''
            INSERT INTO "OperationItem" (id, operationid, productid, quantity)
            VALUES (%(id)s, %(operationid)s, %(productid)s, %(quantity)s)
            ''',
            operation_items,
        )
        cur.executemany(
            '''
            INSERT INTO "StockMovement" (id, productid, warehouseid, quantity, type, operationid, createdat)
            VALUES (%(id)s, %(productid)s, %(warehouseid)s, %(quantity)s, %(type)s, %(operationid)s, %(createdat)s)
            ''',
            stock_movements,
        )

    print("Demo seed inserted successfully.")
    print("Manager login: manager.demo@advancedims.local / DemoManager123!")
    print("Staff login: staff.demo@advancedims.local / DemoStaff123!")


if __name__ == "__main__":
    seed_demo_data()