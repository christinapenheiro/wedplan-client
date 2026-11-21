import { notFound } from "next/navigation";

/**
 * Catch-all route handler for any unmatched deep routes.
 * Directly triggers the not-found handler to show the custom 404 page.
 */
export default function CatchAllPage() {
  notFound();
}
