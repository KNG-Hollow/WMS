// SPDX-License-Identifier: GPL-3.0

import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("../components/Home.tsx"),
  route("login", "../components/utility/LoginForm.tsx"),
  route("logout", "../components/utility/Logout.tsx"),
  route("error", "../features/errors/Error.tsx"),

  ...prefix("accounts", [
    index("../features/accounts/AllAccounts.tsx"),
    route("create", "../features/accounts/CreateAccount.tsx"),
    route(":id", "../features/accounts/Account.tsx"),
    route(":id/edit", "../features/accounts/EditAccount.tsx"),
  ]),

  ...prefix("items", [
    index("../features/items/AllItems.tsx"),
    route("create", "../features/items/CreateItem.tsx"),
    route(":id", "../features/items/Item.tsx"),
    route(":id/edit", "../features/items/EditItem.tsx"),
  ]),

  ...prefix("boxes", [
    index("../features/boxes/AllBoxes.tsx"),
    route("create", "../features/boxes/CreateBox.tsx"),
    route(":id", "../features/boxes/Box.tsx"),
    route(":id/edit", "../features/boxes/EditBox.tsx"),
  ]),

  ...prefix("inventory", [
    index("../features/inventory/AllInventory.tsx"),
    route("create", "../features/inventory/CreateInventory.tsx"),
    route(":id", "../features/inventory/Inventory.tsx"),
    route(":id/edit", "../features/inventory/EditInventory.tsx"),
  ]),

  ...prefix("orders", [
    index("../features/orders/AllOrders.tsx"),
    route("create", "../features/orders/CreateOrder.tsx"),
    route(":id", "../features/orders/Order.tsx"),
    route(":id/edit", "../features/orders/EditOrder.tsx"),
  ]),

  ...prefix("shipments", [
    index("../features/shipments/AllShipments.tsx"),
    route("create", "../features/shipments/CreateShipment.tsx"),
    route(":id", "../features/shipments/Shipment.tsx"),
    route(":id/edit", "../features/shipments/EditShipment.tsx"),
  ]),
] satisfies RouteConfig;
