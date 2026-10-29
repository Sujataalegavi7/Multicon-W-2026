import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "My submissions · TCET CRR" };

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="dashboard-page">
          <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
            <span className="spinner" />
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
