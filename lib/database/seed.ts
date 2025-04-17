import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashPassword } from "../password";
import type { User, Organization, Role, Category, Transaction } from "@prisma/client";

const prisma = new PrismaClient();

// Configuration
const USERS_COUNT = 50;
const ORGANIZATIONS_PER_USER = 1;
const ROLES_PER_ORGANIZATION = 3;
const USERS_PER_ORGANIZATION = 5;
const CATEGORIES_PER_ORGANIZATION = 10;
const TRANSACTIONS_PER_ORGANIZATION = 30;
const APPROVALS_PER_TRANSACTION = 2;

async function main() {
	console.log('🌱 Starting seed process...');

	// Clear existing data (optional - remove if you want to keep existing data)
	await clearDatabase();

	// Create users
	console.log('Creating users...');
	const users = await createUsers(USERS_COUNT);

	// Create organizations
	console.log('Creating organizations...');
	const organizations = await createOrganizations(users);

	// Create roles for each organization
	console.log('Creating roles...');
	const roles = await createRoles(organizations);

	// Create user-organization relationships
	console.log('Creating user-organization relationships...');
	await createUserOrganizations(users, organizations, roles);

	// Create categories
	console.log('Creating categories...');
	const categories = await createCategories(organizations);

	// Create transactions
	console.log('Creating transactions...');
	const transactions = await createTransactions(users, organizations, categories);

	// Create approvals
	console.log('Creating approvals...');
	await createApprovals(transactions, users);

	console.log('✅ Seed completed successfully!');
}

async function clearDatabase() {
	// Delete in reverse order of dependencies
	await prisma.approval.deleteMany({});
	await prisma.transaction.deleteMany({});
	await prisma.category.deleteMany({});
	await prisma.userOrganization.deleteMany({});
	await prisma.role.deleteMany({});
	await prisma.organization.deleteMany({});
	await prisma.user.deleteMany({});
}

async function createUsers(count: number): Promise<User[]> {
	const users: User[] = [];

	const uniqueEmails = faker.helpers.uniqueArray(faker.internet.email, count);
	const password = await hashPassword('password');

	for (let i = 0; i < count; i++) {
		const user = await prisma.user.create({
			data: {
				name: faker.person.fullName(),
				email: uniqueEmails[i],
				password: password,
				avatar: faker.image.avatar(),
				createdAt: faker.date.past(),
				updatedAt: faker.date.recent(),
			},
		});
		users.push(user as unknown as User);
	}

	return users;
}

async function createOrganizations(users: User[]): Promise<Organization[]> {
	const organizations: Organization[] = [];

	for (const user of users) {
		const orgCount = Math.floor(Math.random() * ORGANIZATIONS_PER_USER) + 1;

		for (let i = 0; i < orgCount; i++) {
			const organization = await prisma.organization.create({
				data: {
					userId: user.id,
					name: faker.company.name(),
					description: faker.company.catchPhrase(),
					avatar: faker.image.urlLoremFlickr({ category: 'business' }),
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
			organizations.push(organization as unknown as Organization);
		}
	}

	return organizations;
}

async function createRoles(organizations: Organization[]): Promise<Role[]> {
	const roles: Role[] = [];
	const defaultRoleNames = ['Admin', 'Member', 'Viewer'];

	for (const organization of organizations) {
		// Create default roles
		for (const roleName of defaultRoleNames) {
			const role = await prisma.role.create({
				data: {
					organizationId: organization.id,
					name: roleName,
					permanent: true,
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
			roles.push(role as unknown as Role);
		}

		// Create additional custom roles
		const additionalRolesCount = Math.floor(Math.random() * (ROLES_PER_ORGANIZATION - defaultRoleNames.length));

		for (let i = 0; i < additionalRolesCount; i++) {
			const role = await prisma.role.create({
				data: {
					organizationId: organization.id,
					name: faker.person.jobTitle(),
					permanent: false,
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
			roles.push(role as unknown as Role);
		}
	}

	return roles;
}

async function createUserOrganizations(users: User[], organizations: Organization[], roles: Role[]) {
	for (const organization of organizations) {
		// Get roles for this organization
		const organizationRoles = roles.filter(role => role.organizationId === organization.id);

		// Get owner user (who created the organization)
		const ownerUser = users.find(user => user.id === organization.userId);

		// Add owner to organization with Admin role
		const adminRole = organizationRoles.find(role => role.name === 'Admin');

		if (ownerUser && adminRole) {
			await prisma.userOrganization.create({
				data: {
					userId: ownerUser.id,
					organizationId: organization.id,
					roleId: adminRole.id,
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
		}

		// Add random users to organization with random roles
		const availableUsers = users.filter(user => user.id !== organization.userId);
		const usersToAdd = faker.helpers.arrayElements(
			availableUsers,
			Math.min(USERS_PER_ORGANIZATION, availableUsers.length)
		);

		for (const user of usersToAdd) {
			const randomRole = faker.helpers.arrayElement(organizationRoles);

			await prisma.userOrganization.create({
				data: {
					userId: user.id,
					organizationId: organization.id,
					roleId: randomRole.id,
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
		}
	}
}

async function createCategories(organizations: Organization[]): Promise<Category[]> {
	const categories: Category[] = [];
	const incomeCategories = ['Salary', 'Investment', 'Sales', 'Consulting', 'Royalties'];
	const expenseCategories = ['Office Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Travel', 'Software', 'Hardware'];

	for (const organization of organizations) {
		// Create income categories
		for (const name of incomeCategories) {
			if (Math.random() > 0.3) { // 70% chance to include each category
				const category = await prisma.category.create({
					data: {
						name,
						type: 1, // income
						description: faker.lorem.sentence(),
						organizationId: organization.id,
						createdAt: faker.date.past(),
						updatedAt: faker.date.recent(),
					},
				});
				categories.push(category as unknown as Category);
			}
		}

		// Create expense categories
		for (const name of expenseCategories) {
			if (Math.random() > 0.3) { // 70% chance to include each category
				const category = await prisma.category.create({
					data: {
						name,
						type: 2, // expense
						description: faker.lorem.sentence(),
						organizationId: organization.id,
						createdAt: faker.date.past(),
						updatedAt: faker.date.recent(),
					},
				});
				categories.push(category as unknown as Category);
			}
		}

		// Create additional custom categories
		const additionalCategoriesCount = CATEGORIES_PER_ORGANIZATION -
			categories.filter(c => c.organizationId === organization.id).length;

		for (let i = 0; i < additionalCategoriesCount; i++) {
			const type = Math.random() > 0.5 ? 1 : 2; // 1: income, 2: expense
			const category = await prisma.category.create({
				data: {
					name: type === 1 ?
						`${faker.commerce.productAdjective()} Income` :
						`${faker.commerce.productAdjective()} Expense`,
					type,
					description: faker.lorem.sentence(),
					organizationId: organization.id,
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
			categories.push(category as unknown as Category);
		}
	}

	return categories;
}

async function createTransactions(users: User[], organizations: Organization[], categories: Category[]): Promise<Transaction[]> {
	const transactions: Transaction[] = [];

	for (const organization of organizations) {
		// Get categories for this organization
		const organizationCategories = categories.filter(
			category => category.organizationId === organization.id
		);

		// Get users in this organization
		const organizationUsers = await prisma.userOrganization.findMany({
			where: { organizationId: organization.id },
			select: { userId: true },
		});

		const userIds = organizationUsers.map(ou => ou.userId);

		// Create transactions
		for (let i = 0; i < TRANSACTIONS_PER_ORGANIZATION; i++) {
			if (organizationCategories.length === 0 || userIds.length === 0) continue;

			const randomCategory = faker.helpers.arrayElement(organizationCategories);
			const randomUserId = faker.helpers.arrayElement(userIds);

			// Generate amount based on category type (income/expense)
			const amount = randomCategory.type === 1
				? faker.number.int({ min: 100000, max: 10000000 }) // income (larger amounts)
				: faker.number.int({ min: 10000, max: 5000000 });  // expense

			// Generate random date within the last year
			const date = faker.date.between({
				from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
				to: new Date()
			});

			const transaction = await prisma.transaction.create({
				data: {
					organizationId: organization.id,
					amount: amount, // Note: Changed from BigInt to number based on the type definition
					description: faker.lorem.paragraph(),
					userId: randomUserId,
					attachments: Array(Math.floor(Math.random() * 3)).fill(0).map(() =>
						faker.image.urlLoremFlickr({ category: 'business' })
					),
					categoryId: randomCategory.id,
					date,
					createdAt: date,
					updatedAt: date,
				},
			});

			transactions.push(transaction as unknown as Transaction);
		}
	}

	return transactions;
}

async function createApprovals(transactions: Transaction[], users: User[]) {
	for (const transaction of transactions) {
		// Get organization for this transaction
		const organization = await prisma.organization.findUnique({
			where: { id: transaction.organizationId },
		});

		if (!organization) continue;

		// Get users in this organization excluding the transaction creator
		const organizationUsers = await prisma.userOrganization.findMany({
			where: {
				organizationId: transaction.organizationId,
				userId: { not: transaction.userId },
			},
			select: { userId: true },
		});

		const userIds = organizationUsers.map(ou => ou.userId);

		// Create approvals
		const approvalsCount = Math.min(
			Math.floor(Math.random() * APPROVALS_PER_TRANSACTION) + 1,
			userIds.length
		);

		const selectedUserIds = faker.helpers.arrayElements(userIds, approvalsCount);

		for (const userId of selectedUserIds) {
			// Random status: 1: pending, 2: approved, 3: rejected
			const status = faker.helpers.arrayElement([1, 2, 2, 2, 3]); // 60% approved, 20% rejected, 20% pending

			await prisma.approval.create({
				data: {
					transactionId: transaction.id,
					userId: userId,
					status,
					reason: status === 3 ? faker.lorem.sentence() : null, // Only add reason for rejections
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				},
			});
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});