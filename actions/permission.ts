import { PrismaClient, Role, RolePermission } from "@prisma/client";
import { PermissionCreateInput } from "@/types/permission";

const prisma = new PrismaClient();

export async function createPermissions(inputs: PermissionCreateInput[]): Promise<RolePermission[]> {
	const permissions: RolePermission[] = await prisma.rolePermission.createManyAndReturn({
		data: inputs.map((permission: PermissionCreateInput) => ({
			roleId: permission.role.id,
			permission: permission.permission,
		})),
	});

	return permissions;
}