# Departments

Which half of the store a shopper is in: Women or Men in a clothing store, and
nothing at all in a store that sells to everybody at once.

- **The store's departments are commerce data, and the shopper's is not.**
  `getCommerce(demo).getDepartments()` returns them in the order the header
  offers them. This module only remembers which one was opened.
- **The first department is the default**: where a first visit lands, and what a
  stale cookie falls back to.
- **Every department's home has a URL**, `/<demo>/<slug>`, and the header's
  switch is a pair of plain links. The bare `/<demo>` redirects to the remembered
  department. Link to a department's home, never to the bare `/<demo>`: met on a
  client navigation, the redirect renders an empty page first.
- **A page a department owns nests under its home**, like
  `/<demo>/<slug>/collections`. Its bare counterpart redirects the same way, and
  is the page itself in a store without departments.
- **The cookie remembers, and never decides a page.** A department's home and its
  catalog pages record it through `RememberDepartment`, which posts to the
  `/remember-department` Route Handler rather than calling a Server Action: an
  action that sets a cookie re-renders the page, and a first visit changes
  nothing on it. The client refreshes only when the department switched, so the
  footer follows. That is why this module has no `actions.ts`. The cookie
  answers only where the URL is silent (the bare `/<demo>`, and the chrome
  around a product, the cart, or About), resolved through `getDepartment`,
  which checks it against the store's own list.
- **Chrome reads the URL first**, through `useCurrentDepartment` (a department's
  home, a page under it, or any category in it), and falls back to the cookie.
- **Not in `proxy.ts`.** Next.js strips the prefetch header there, so a prefetch
  of a department would look like a visit and flip the cookie.
- **Switching lands on the department's home**, never on an equivalent of the
  page in view: a dress has no counterpart in Men. The menu drawer's tabs do the
  same, and keep the drawer open.
- **A slug must not match a route of the storefront's own.** `[department]` sits
  beside `about`, `cart`, and `catalog`, and the static route wins.
- **A store without departments returns `null`**, and every component reading it
  renders its undivided version. Electronics is that store.
