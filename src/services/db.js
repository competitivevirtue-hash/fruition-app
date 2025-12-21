import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);

let dbConnection = null;

export const initDB = async () => {
    try {
        if (dbConnection) return dbConnection;

        // Create connection
        const dbName = 'fruitcyclopedia';
        const ret = await sqlite.createConnection(dbName, false, 'no-encryption', 1, false);
        dbConnection = ret.sqlite;

        // Open
        await dbConnection.open();

        // Schema
        const schema = `
        CREATE TABLE IF NOT EXISTS fruits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER,
            unit TEXT,
            storageMethod TEXT,
            purchaseDate TEXT,
            expiryDate TEXT,
            status TEXT,
            image TEXT,
            synced INTEGER DEFAULT 0
        );
        `;

        await dbConnection.execute(schema);
        console.log("sqlite: Database initialized");
        return dbConnection;

    } catch (err) {
        console.error("sqlite: Initialization failed", err);
        return null;
    }
};

export const saveFruitsToCache = async (fruits) => {
    if (!dbConnection) return;

    try {
        // Transaction for bulk save
        const statements = fruits.map(f => {
            return {
                statement: `INSERT OR REPLACE INTO fruits (id, name, quantity, unit, storageMethod, purchaseDate, expiryDate, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                values: [
                    f.id,
                    f.name,
                    f.quantity,
                    f.unit,
                    f.storageMethod,
                    f.purchaseDate,
                    f.expiryDate,
                    f.status,
                    f.image
                ]
            };
        });

        if (statements.length > 0) {
            await dbConnection.executeSet(statements);
            console.log(`sqlite: Cached ${fruits.length} fruits`);
        }
    } catch (err) {
        console.error("sqlite: Save failed", err);
    }
};

export const getFruitsFromCache = async () => {
    if (!dbConnection) return [];
    try {
        const result = await dbConnection.query("SELECT * FROM fruits");
        return result.values || [];
    } catch (err) {
        console.error("sqlite: Read failed", err);
        return [];
    }
};
