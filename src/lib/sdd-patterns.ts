const TYPES =
	"BL|SUR|CON|INV|POL|DEL|DLT|NFR|REQ|MIG|CST|SCN|LCN|GAR|EXT";

export const COVERS = "@covers\\s+\\S+(?:\\s+\\w+=\\S+)*";
export const FULL_ID = `\\b[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)*:(?:${TYPES})-\\d+\\b`;
export const SHORT_ID = `\\b(?:${TYPES})-\\d+\\b`;
export const MILESTONE = "\\bM\\d+[A-Z]+-\\d+\\b";

/* Order is significant: a full id is consumed before the bare TYPE-NNN that is
   its suffix, so stripping a marker line leaves no partition fragment behind. */
export const SDD_PROTECTED_PATTERNS: readonly string[] = [
	COVERS,
	FULL_ID,
	SHORT_ID,
	MILESTONE,
];
