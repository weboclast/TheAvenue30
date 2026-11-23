import { rememberDepartment } from '@/lib/departments'

/*
 * Records the department a shopper opened, for `RememberDepartment`, and
 * answers whether that switched it. A Route Handler rather than a Server
 * Action: an action that sets a cookie re-renders the page, and only a switch
 * changes anything on it.
 */

export async function POST(request: Request) {
  const { demo, slug } = await request.json().catch(() => ({}))

  return Response.json({ switched: await rememberDepartment(demo, slug) })
}
