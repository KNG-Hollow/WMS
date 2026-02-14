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
    route("", "../features/accounts/AllAccounts.tsx"),
    route(":id", "../features/accounts/Account.tsx"),
    route(":id/edit", "../features/accounts/EditAccount.tsx"),
  ]),
] satisfies RouteConfig;
