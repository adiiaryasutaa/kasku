"use server";

import { Organization, Role, RolePermission } from "@prisma/client";
import { RoleCreateInput, RoleWithPermissionCreateInput } from "@/types/role";
import prisma from "@/lib/prisma";

export async function createRole(input: RoleCreateInput): Promise<Role> {
	return await prisma.role.create({
		data: {
			organizationId: input.organization.id,
			name: input.name,
			description: input.description,
			isDefault: input.isDefault,
			permanent: input.permanent,
		},
	});
}

export async function createRoles(inputs: RoleCreateInput[]): Promise<Role[]> {
	return await prisma.role.createManyAndReturn({
		data: inputs.map((role: RoleCreateInput) => ({
			organizationId: role.organization.id,
			name: role.name,
			description: role.description,
			isDefault: role.isDefault,
			permanent: role.permanent,
		})),
	});
}

export async function createRolesWithPermissions(inputs: RoleWithPermissionCreateInput[]): Promise<Role[]> {
	return await Promise.all(
		inputs.map(async (role: RoleWithPermissionCreateInput) =>
			await prisma.role.create({
				data: {
					organizationId: role.organization.id,
					name: role.name,
					description: role.description,
					isDefault: role.isDefault,
					permanent: role.permanent,
					permissions: {
						create: role.permissions.map((permission) => ({
							permission: permission.permission
						})),
					}
				}
			})
		)
	);
}

export async function getCurrentRolesWithPermissionOrganization(organization: Organization): Promise<Role[]> {
	return await prisma.role.findMany({
		where: {
			organizationId: organization.id,
		},
		include: {
			permissions: true,
		},
	})
}

export type RoleWithPermissions = Role & {
	permissions: RolePermission[]
}

export async function findOrganizationRoles(organizationId: string | number): Promise<RoleWithPermissions[]> {
	return await prisma.role.findMany({
		where: {
			organizationId: typeof organizationId === "string" ? BigInt(organizationId) : organizationId,
			deletedAt: null,
		},
		include: {
			permissions: true,
		},
	})
}

export async function findRoleById(id: string | number): Promise<RoleWithPermissions | null> {
	return await prisma.role.findUnique({
		where: {
			id: typeof id === "string" ? BigInt(id) : id,
		},
		include: {
			permissions: true,
		},
	})
}

export async function updateRole(
	id: string | number,
	data: {
		name?: string
		description?: string
		isDefault?: boolean
		permissions?: number[]
	},
): Promise<RoleWithPermissions> {
	const roleId = typeof id === "string" ? BigInt(id) : id

	// If permissions are provided, update them
	if (data.permissions) {
		// Delete existing permissions
		await prisma.rolePermission.deleteMany({
			where: { roleId },
		})

		// Create new permissions
		await Promise.all(
			data.permissions.map((permission) =>
				prisma.rolePermission.create({
					data: {
						roleId,
						permission,
					},
				}),
			),
		)
	}

	// Update the role
	return await prisma.role.update({
		where: { id: roleId },
		data: {
			name: data.name,
			description: data.description,
			isDefault: data.isDefault,
			updatedAt: new Date(),
		},
		include: {
			permissions: true,
		},
	})
}

export async function deleteRole(id: string | number): Promise<void> {
	const roleId = typeof id === "string" ? BigInt(id) : id

	// Check if this is a permanent role
	const role = await prisma.role.findUnique({
		where: { id: roleId },
	})

	if (role?.permanent) {
		throw new Error("Cannot delete a permanent role")
	}

	// Soft delete the role
	await prisma.role.update({
		where: { id: roleId },
		data: {
			deletedAt: new Date(),
			updatedAt: new Date(),
		},
	})
}
