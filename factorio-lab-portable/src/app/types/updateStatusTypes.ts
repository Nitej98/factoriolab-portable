export type UpdateStatus =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; progress: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };
