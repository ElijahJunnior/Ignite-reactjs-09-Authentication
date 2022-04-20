import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

type UseCanProps = {
  permissions?: string[],
  roles?: string[]
}

export function useCan({ permissions, roles }: UseCanProps) {

  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  if (permissions?.length > 0) {

    const hasAllPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission);
    })

    if (!hasAllPermissions) {
      return false;
    }

  }

  if (roles?.length > 0) {

    const hasRole = roles.some((role) => {
      return user.roles.includes(role);
    })

    if (!hasRole) {
      return false;
    }

  }

  return true;

}