interface PermissionCountProps {
  granted: number
  total: number
}

export function PermissionCount({ granted, total }: PermissionCountProps) {
  return (
    <span>
      {granted}/{total} permissions granted
    </span>
  )
}
