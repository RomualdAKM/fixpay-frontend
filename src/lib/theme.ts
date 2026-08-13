/**
 * Theme constants shared by the server (pre-paint script in the root layout)
 * and the client (ThemeProvider). Kept in a neutral module — importing them
 * from a `"use client"` file would turn them into client references on the
 * server and corrupt the inlined script.
 */

export type Theme = "dark" | "light";

/** localStorage key holding the user's explicit choice. */
export const THEME_STORAGE_KEY = "fixpay-theme";

/** `data-theme` attribute name, mirrored in globals.css selectors. */
export const THEME_ATTRIBUTE = "data-theme";
