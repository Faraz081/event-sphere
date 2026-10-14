import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";

const statusStyles = { pending: "bg-yellow-500", approved: "bg-green-500", rejected: "bg-red-500" };

const getList = (data, key) => (Array.isArray(data) ? data : data?.[key] ?? data?.data ?? []);
const expoName = (e) => e?.title ?? e?.name ?? "Expo";

const ExhibitorRegistration = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [appsRes, exposRes] = await Promise.allSettled([
      api.get("/api/exhibitor-profile/applications"),
      api.get("/api/exhibitor-profile/expos"),
    ]);

    if (appsRes.status === "fulfilled") setApplications(getList(appsRes.value.data, "applications"));
    else toast.error("Could not load your applications");

    if (exposRes.status === "fulfilled") setExpos(getList(exposRes.value.data, "expos"));
    else toast.error("Could not load expos");

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const appliedExpoIds = applications.map((a) => a.expo?._id ?? a.expo);
  const availableExpos = expos.filter((e) => !appliedExpoIds.includes(e._id));

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage title="Registration" description="Apply for an expo and track your approval status.">
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <>
           <div className="mb-6 flex w-full justify-end">
  <button
    onClick={() => navigate("/exhibitor/registration/new")}
    disabled={availableExpos.length === 0}
    className="w-fit rounded-xl bg-[#d4a62a] px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
  >
    {availableExpos.length === 0 ? "No expos available to apply" : "Apply for an expo"}
  </button>
</div>

            <div className="space-y-4">
              {applications.length === 0 && (
                <p className="text-sm text-muted">You haven't applied for any expo yet.</p>
              )}

              {applications.map((a) => (
                <div key={a._id} className="rounded-3xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">{expoName(a.expo)}</h2>
                    <span className={`rounded-full px-4 py-1 text-sm font-bold capitalize text-black ${statusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted">
                    <p><b className="text-foreground">Company:</b> {a.companyName}</p>
                    <p><b className="text-foreground">Products/Services:</b> {a.productsServices}</p>
                    <p><b className="text-foreground">Description:</b> {a.description || "-"}</p>
                    <p><b className="text-foreground">Documents uploaded:</b> {a.documents?.length ?? 0}</p>
                    {a.status === "rejected" && a.adminNote && (
                      <p className="text-red-400"><b>Reason:</b> {a.adminNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorRegistration;