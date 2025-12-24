/**
 * @file server/src/scripts/create-viewer.ts
 * @description CLI script to create a viewer user in Firebase Auth and Firestore
 */

import { auth, db } from "../services/firebase.js";

async function createViewerUser() {
    const email = "viewer@example.com";
    const password = "viewer123";
    const displayName = "Viewer User";

    try {
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

        console.log(`Setting role for ${uid}...`);
        await db.collection("organizations").doc("default").collection("users").doc(uid).set({
            role: "viewer",
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

createViewerUser();
