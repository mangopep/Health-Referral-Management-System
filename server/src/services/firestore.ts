/**
 * @file server/src/services/firestore.ts
 * @description Firestore utility - ChunkedBatchWriter for large batch operations
 *
 * @responsibility
 *   - Owns: Batch write chunking, automatic commit rotation
 *   - Does NOT own: Firestore initialization, business logic
 *
 * @lastReviewed 2024-12-24
 */

import { db } from "./firebase.js";
import { type WriteBatch } from "firebase-admin/firestore";

const MAX_BATCH_SIZE = 400; // Safe limit below 500

/**
 * Helper to execute large number of writes by chunking them into batches.
 * @param operations Array of operations to execute. keys: type ('set', 'update', 'delete'), ref, data
 */
export async function executeBatch(
    // Simple callback approach for flexibility
    builder: (batch: WriteBatch) => void
): Promise<void> {
    // Current approach assumes the caller manages the batch.
    // But for large inserts (e.g. 5000 events), we need a wrapper that automatically commits and creates new batch.

    // Actually, explicit control is better.
    // Let's provide a "ChunkedBatchWriter" class.

    const writer = new ChunkedBatchWriter();
    builder(writer as unknown as WriteBatch); // Use with caution, typing might be tricky if we don't implement full interface
    await writer.commit();
}

/**
 * A wrapper around Firestore WriteBatch that automatically commits and rotates batches
 * when they hit the size limit.
 */
export class ChunkedBatchWriter {
    private batch: WriteBatch;
    private count = 0;
    private promises: Promise<any>[] = [];

    constructor() {
        this.batch = db.batch();
    }

    // Wrap 'set'
    set(ref: any, data: any, options?: any) {
        this.batch.set(ref, data, options);
        this.increment();
        return this; // fluent interface
    }

    // Wrap 'update'
    update(ref: any, data: any, ...args: any[]) {
        // @ts-ignore - handling variadic args is tricky, simplified for this use case
        this.batch.update(ref, data, ...args);
        this.increment();
        return this;
    }

    // Wrap 'delete'
    delete(ref: any) {
        this.batch.delete(ref);
        this.increment();
        return this;
    }

    private increment() {
        this.count++;
        if (this.count >= MAX_BATCH_SIZE) {
            this.rotate();
        }
    }

    private rotate() {
        // Commit current batch and start new one
        const p = this.batch.commit();
        this.promises.push(p);
        this.batch = db.batch();
        this.count = 0;
    }

    async commit() {
        if (this.count > 0) {
            this.promises.push(this.batch.commit());
        }
        await Promise.all(this.promises);
    }
}
