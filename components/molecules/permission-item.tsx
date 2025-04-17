import { Checkbox } from "@/components/ui/checkbox"

interface PermissionItemProps {
  id: string
  name: string
  description: string
  isGranted: boolean
  onToggle: (id: string, isGranted: boolean) => void
}

export function PermissionItem({ id, name, description, isGranted, onToggle }: PermissionItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={`permission-${id}`}
        checked={isGranted}
        onCheckedChange={(checked) => onToggle(id, checked === true)}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={`permission-${id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {name}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}
