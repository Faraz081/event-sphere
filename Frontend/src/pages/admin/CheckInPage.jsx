import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "@/api/api";

const AdminCheckIn = () => {
  const { passCode } = useParams();
  const calledRef = useRef(false);
  const [state, setState] = useState({ status: "loading" });

    useEffect(() => {
  if (calledRef.current) return;
  calledRef.current = true;

  api.post(`/api/public/check-in/${encodeURIComponent(passCode)}`)
    .then((res) => setState({ status: "success", attendee: res.data.attendee }))
    .catch((err) =>
      setState({
        status: err.response?.status === 409 ? "used" : "error",
        message: err.response?.data?.error || "Could not check in this pass.",
        attendee: err.response?.data?.attendee,
      })
    );
}, [passCode]);

  const a = state.attendee;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        {state.status === "loading" && (
          <>
            <Loader2 className="mx-auto animate-spin text-gold" size={40} />
            <p className="mt-3 text-muted">Checking pass...</p>
          </>
        )}

        {state.status === "success" && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-400" size={52} />
            <h1 className="mt-3 text-2xl font-bold text-foreground">Approved</h1>
            <p className="text-muted">Check-in successful</p>
          </>
        )}

        {state.status === "used" && (
          <>
            <XCircle className="mx-auto text-gold" size={52} />
            <h1 className="mt-3 text-2xl font-bold text-foreground">Already checked in</h1>
            {a?.checkedInAt && (
              <p className="text-muted">at {new Date(a.checkedInAt).toLocaleString()}</p>
            )}
          </>
        )}

        {state.status === "error" && (
          <>
            <XCircle className="mx-auto text-red-400" size={52} />
            <h1 className="mt-3 text-2xl font-bold text-foreground">Cannot check in</h1>
            <p className="text-muted">{state.message}</p>
          </>
        )}

        {a && (
          <div className="mt-4 space-y-1 text-sm text-foreground">
            <p className="font-semibold">{a.user?.name}</p>
            <p className="text-muted">{a.user?.email}</p>
            <p className="text-muted">{a.expo?.title}</p>
            <p className="font-mono text-xs text-gold">{a.passCode}</p>
          </div>
        )}

        <Link to="/admin/attendees" className="mt-6 inline-block text-sm text-gold underline">
          Back to attendees
        </Link>
      </div>
    </div>
  );
};

export default AdminCheckIn;