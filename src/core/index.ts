import { IGun } from "../../types/gun/IGun.d.ts";
import { IGunInstance } from "../../types/gun/IGunInstance.d.ts";
import { GunOptions } from "../../types/gun/GunOptions.d.ts";

// Import core modules
import "./shim.js";
import "./onto.js";
import "./book.js";
import "./valid.js";
import "./state.js";
import "./dup.js";
import "./ask.js";
import "./core.js";
import "./on.js";
import "./map.js";
import "./set.js";
import "./mesh.js";
import "./websocket.js";
import "./localStorage.js";

// Import the root Gun implementation
import GunImpl from "./root.js";

// Export the Gun implementation with proper types
export const Gun: IGun = GunImpl as unknown as IGun;

// Re-export types
export type { IGun, IGunInstance, GunOptions }; 