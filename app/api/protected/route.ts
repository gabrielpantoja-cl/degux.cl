import { auth } from "auth"

interface AuthenticatedRequest extends Request {
  auth?: boolean;
}

export const GET = auth((req: AuthenticatedRequest) => {
  if (req.auth) {
    return Response.json({ data: "Protected data" })
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 })
}) as any // TODO: Fix `auth()` return type