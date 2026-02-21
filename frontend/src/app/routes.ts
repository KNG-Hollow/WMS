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
    index("../features/accounts/Accounts.tsx"),
    route("create", "../features/accounts/CreateAccount.tsx"),
    route(":id", "../features/accounts/ViewAccount.tsx"),
    route(":id/edit", "../features/accounts/EditAccount.tsx"),
  ]),

  ...prefix("items", [
    index("../features/items/Items.tsx"),
    route("create", "../features/items/CreateItem.tsx"),
    route(":id", "../features/items/ViewItem.tsx"),
    route(":id/edit", "../features/items/EditItem.tsx"),
  ]),

  ...prefix("boxes", [
    index("../features/boxes/Boxes.tsx"),
    route("create", "../features/boxes/CreateBox.tsx"),
    route(":id", "../features/boxes/ViewBox.tsx"),
    route(":id/edit", "../features/boxes/EditBox.tsx"),
  ]),

  ...prefix("inventory", [
    index("../features/inventory/Inventory.tsx"),
    route("create", "../features/inventory/CreateInventory.tsx"),
    route(":id", "../features/inventory/ViewInventory.tsx"),
    route(":id/edit", "../features/inventory/EditInventory.tsx"),
  ]),

  ...prefix("orders", [
    index("../features/orders/Orders.tsx"),
    route("create", "../features/orders/CreateOrder.tsx"),
    route(":id", "../features/orders/ViewOrder.tsx"),
    route(":id/edit", "../features/orders/EditOrder.tsx"),
  ]),

  ...prefix("shipments", [
    index("../features/shipments/Shipments.tsx"),
    route("create", "../features/shipments/CreateShipment.tsx"),
    route(":id", "../features/shipments/ViewShipment.tsx"),
    route(":id/edit", "../features/shipments/EditShipment.tsx"),
  ]),
] satisfies RouteConfig;
