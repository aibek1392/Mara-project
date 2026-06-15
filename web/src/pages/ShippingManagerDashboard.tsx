import { Navigate } from "react-router-dom";

/** Legacy route — shipping managers now use the owner platform. */
export function ShippingManagerDashboard() {
  return <Navigate to="/owner?tab=shipping" replace />;
}
