import { Suspense } from "react";
import { GuestMenu } from "./guest-menu";

export default function Page() {
  return (
    <main>
      <Suspense fallback={<p className="muted">Loading menu…</p>}>
        <GuestMenu />
      </Suspense>
    </main>
  );
}
