import { db, users } from "./index";
import { hash } from "bcryptjs";

async function seedAdmin() {
  console.log("Creating admin user...");

  const email = process.env.ADMIN_EMAIL || "admin@archivia.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrateur";

  const hashedPassword = await hash(password, 12);

  try {
    await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: "admin",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          password: hashedPassword,
          name,
          role: "admin",
        },
      });

    console.log(`Admin user created successfully!`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`\nYou can now login at /login`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
