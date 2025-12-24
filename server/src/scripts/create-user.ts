/**
 * @file server/src/scripts/create-user.ts
 * @description CLI script to create an admin user in Firebase Auth and Firestore
 */

import { auth, db } from "../services/firebase.js";

async function createAdminUser() {
    const email = "admin@example.com";
    const password = "admin123";
    const displayName = "Admin User";

    try {
        // 1. Create Auth User
        console.log(`Creating user ${email}...`);
        let uid;
        try {
            const user = await auth.getUserByEmail(email);
            uid = user.uid;
            console.log("User already exists, updating...");
            await auth.updateUser(uid, { password, displayName });
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                const user = await auth.createUser({
                    email,
                    password,
                    displayName
                });
                uid = user.uid;
                console.log("User created.");
            } else {
                throw e;
            }
        }

        // 2. Set Role in Firestore
        console.log(`Setting role for ${uid}...`);
        await db.collection("organizations").doc("default").collection("users").doc(uid).set({
            role: "admin",
            email,
            name: displayName
        }, { merge: true });

        console.log("Success! Login with:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

createAdminUser();
