import { MockDataService } from "./MockDataService";
import type { DataService } from "./DataService";

// The single db instance used everywhere in the app.
// To switch to NeonDB: replace MockDataService with NeonDataService here.
// No other file needs to change.
export const db: DataService = new MockDataService();
