import { setAuthTokenGetter } from "@workspace/api-client-react";
import { auth } from "./firebase";

setAuthTokenGetter(async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
});
