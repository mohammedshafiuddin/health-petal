import { pgTable, integer, varchar, date, unique, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable(
	"profiles",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		email: varchar({ length: 255 }).unique(),
		mobile: varchar({ length: 255 }).notNull().unique(),
		joinDate: date("join_date").notNull().default("now()"),
		address: varchar({ length: 500 }),
		profilePicUrl: varchar("profile_pic_url", { length: 255 }),
	},
	(t) => ({
		unq_mobile: unique("unique_mobile").on(t.mobile),
		unq_email: unique("unique_email").on(t.email),
	})
);

export const roleInfoTable = pgTable(
	"role_info",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		description: varchar({ length: 500 }),
	}
);

export const userRolesTable = pgTable(
	"user_roles",
	{
		userId: integer("user_id").notNull().references(() => usersTable.id),
		roleId: integer("role_id").notNull().references(() => roleInfoTable.id),
		addDate: date("add_date").notNull().default("now()"),
	},
	(t) => ({
		pk: unique("user_role_pk").on(t.userId, t.roleId),
	})
);

export const usersTableRelations = relations(usersTable, ({ many }) => ({
	roles: many(userRolesTable),
	doctorSecretaries: many(doctorSecretariesTable, {
		relationName: "doctor",
	}),
	secretaryForDoctors: many(doctorSecretariesTable, {
		relationName: "secretary",
	}),
	tokens: many(tokenInfoTable),
}));


export const hospitalTable = pgTable(
	"hospital",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		address: varchar({ length: 500 }).notNull(),
		description: varchar({ length: 1000 }),
	}
);

export const specializationsTable = pgTable(
	"specializations",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull().unique(),
		description: varchar({ length: 1000 }),
	}
);

export const hospitalSpecializationsTable = pgTable(
	"hospital_specializations",
	{
		hospitalId: integer("hospital_id").notNull().references(() => hospitalTable.id),
		specializationId: integer("specialization_id").notNull().references(() => specializationsTable.id),
	},
	(t) => ({
		pk: unique("hospital_specialization_pk").on(t.hospitalId, t.specializationId),
	})
);

export const hospitalTableRelations = relations(hospitalTable, ({ many }) => ({
	specializations: many(hospitalSpecializationsTable),
	employees: many(hospitalEmployeesTable),
}));

export const hospitalEmployeesTable = pgTable(
	"hospital_employees",
	{
		hospitalId: integer("hospital_id").notNull().references(() => hospitalTable.id),
		userId: integer("user_id").notNull().references(() => usersTable.id),
		designation: varchar({ length: 255 }).notNull(),
	},
	(t) => ({
		pk: unique("hospital_employee_pk").on(t.hospitalId, t.userId),
	})
);

export const doctorInfoTable = pgTable(
	"doctor_info",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
		qualifications: varchar({ length: 1000 }),
		dailyTokenCount: integer("daily_token_count").notNull().default(0),
	}
);

export const doctorSpecializationsTable = pgTable(
	"doctor_specializations",
	{
		doctorId: integer("doctor_id").notNull().references(() => doctorInfoTable.id),
		specializationId: integer("specialization_id").notNull().references(() => specializationsTable.id),
	},
	(t) => ({
		pk: unique("doctor_specialization_pk").on(t.doctorId, t.specializationId),
	})
);

export const doctorInfoTableRelations = relations(doctorInfoTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [doctorInfoTable.userId],
		references: [usersTable.id],
	}),
	specializations: many(doctorSpecializationsTable),
	availability: many(doctorAvailabilityTable),
	tokens: many(tokenInfoTable),
	counters: many(runningCounterTable),
}));

export const doctorSecretariesTable = pgTable(
	"doctor_secretaries",
	{
		doctorId: integer("doctor_id").notNull().references(() => usersTable.id),
		secretaryId: integer("secretary_id").notNull().references(() => usersTable.id),
	},
	(t) => ({
		pk: unique("doctor_secretary_pk").on(t.doctorId, t.secretaryId),
	})
);

export const doctorSecretariesRelations = relations(doctorSecretariesTable, ({ one }) => ({
	doctor: one(usersTable, {
		fields: [doctorSecretariesTable.doctorId],
		references: [usersTable.id],
	}),
	secretary: one(usersTable, {
		fields: [doctorSecretariesTable.secretaryId],
		references: [usersTable.id],
	}),
}));

export const doctorAvailabilityTable = pgTable(
	"doctor_availability",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		doctorId: integer("doctor_id").notNull().references(() => doctorInfoTable.id),
		date: date("date").notNull(),
		totalTokenCount: integer("total_token_count").notNull().default(0),
		filledTokenCount: integer("filled_token_count").notNull().default(0),
		isStopped: boolean("is_stopped").notNull().default(false),
	},
	(t) => ({
		unq_doctor_date: unique("unique_doctor_date").on(t.doctorId, t.date),
	})
);

export const doctorAvailabilityRelations = relations(doctorAvailabilityTable, ({ one }) => ({
	doctor: one(doctorInfoTable, {
		fields: [doctorAvailabilityTable.doctorId],
		references: [doctorInfoTable.id],
	}),
}));

export const tokenInfoTable = pgTable(
	"token_info",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		doctorId: integer("doctor_id").notNull().references(() => doctorInfoTable.id),
		userId: integer("user_id").notNull().references(() => usersTable.id),
		tokenDate: date("token_date").notNull(),
		queueNum: integer("queue_num").notNull(),
		description: varchar({ length: 1000 }),
		createdAt: date("created_at").notNull().default("now()"),
	},
	(t) => ({
		unq_doctor_date_queue: unique("unique_doctor_date_queue").on(
			t.doctorId, 
			t.tokenDate, 
			t.queueNum
		),
	})
);

export const tokenInfoRelations = relations(tokenInfoTable, ({ one }) => ({
	doctor: one(doctorInfoTable, {
		fields: [tokenInfoTable.doctorId],
		references: [doctorInfoTable.id],
	}),
	user: one(usersTable, {
		fields: [tokenInfoTable.userId],
		references: [usersTable.id],
	}),
}));

export const runningCounterTable = pgTable(
	"running_counter",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		date: date("date").notNull(),
		doctorId: integer("doctor_id").notNull().references(() => doctorInfoTable.id),
		count: integer("count").notNull().default(0),
		lastUpdated: date("last_updated").notNull().default("now()"),
	},
	(t) => ({
		unq_date_doctor: unique("unique_date_doctor").on(t.date, t.doctorId),
	})
);

export const runningCounterRelations = relations(runningCounterTable, ({ one }) => ({
	doctor: one(doctorInfoTable, {
		fields: [runningCounterTable.doctorId],
		references: [doctorInfoTable.id],
	}),
}));

