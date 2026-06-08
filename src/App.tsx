import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CustomerScan from "@/pages/CustomerScan";
import FollowUpCheck from "@/pages/FollowUpCheck";
import OpportunityScore from "@/pages/OpportunityScore";
import Reminders from "@/pages/Reminders";
import LeadAssignment from "@/pages/LeadAssignment";
import ExceptionSummary from "@/pages/ExceptionSummary";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customer-scan" element={<CustomerScan />} />
          <Route path="follow-up-check" element={<FollowUpCheck />} />
          <Route path="opportunity-score" element={<OpportunityScore />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="lead-assignment" element={<LeadAssignment />} />
          <Route path="exception-summary" element={<ExceptionSummary />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
