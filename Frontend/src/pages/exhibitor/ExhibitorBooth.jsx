import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import ExhibitorLayout from "@/layouts/DashboardLayout/ExhibitorLayout";
import DashboardSectionPage from "@/components/DashboardSectionPage";
import { fetchExpos, fetchAvailableBooths, reserveBooth, fetchMyBooth, releaseBooth, updateBoothDetails } from "@/features/boothSlice";

const ExhibitorBooth = () => {
  const dispatch = useDispatch();
  const { expos, booths, myBooth, loading } = useSelector((state) => state.booth);
  const [selectedExpo, setSelectedExpo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [productInput, setProductInput] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");

  useEffect(() => {
    dispatch(fetchExpos());
    dispatch(fetchMyBooth());
  }, [dispatch]);

  useEffect(() => {
    if(selectedExpo) dispatch(fetchAvailableBooths(selectedExpo));
  }, [selectedExpo, dispatch]);

  const handleReserve = async (boothId) => {
    const result = await dispatch(reserveBooth(boothId));
    if(reserveBooth.fulfilled.match(result)){
      toast.success("Booth requested, waiting for admin approval");
    } else {
      toast.error(result.payload?.error || "Could not request booth");
    }
  };

  const handleRelease = async (boothId) => {
    const result = await dispatch(releaseBooth(boothId));
    if(releaseBooth.fulfilled.match(result)){
      toast.success("Booth released successfully");
      if(selectedExpo) dispatch(fetchAvailableBooths(selectedExpo));
    } else {
      toast.error(result.payload?.error || "Could not release booth");
    }
  };

  const openModal = () => {
    setProducts(myBooth?.products ?? []);
    setStaff(myBooth?.staff ?? []);
    setModalOpen(true);
  };

  const addProduct = () => {
    if(!productInput.trim()) return;
    setProducts([...products, productInput.trim()]);
    setProductInput("");
  };

  const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));

  const addStaff = () => {
    if(!staffName.trim() || !staffRole.trim()) return;
    setStaff([...staff, {name: staffName.trim(), role: staffRole.trim()}]);
    setStaffName("");
    setStaffRole("");
  };

  const removeStaff = (index) => setStaff(staff.filter((_, i) => i !== index));

  const handleSaveDetails = async () => {
    const result = await dispatch(updateBoothDetails({boothId: myBooth._id, products, staff}));
    if(updateBoothDetails.fulfilled.match(result)){
      toast.success("Booth details updated");
      setModalOpen(false);
    } else {
      toast.error(result.payload?.error || "Could not update details");
    }
  };

  const isPending = myBooth?.status === "pending";

  return (
    <ExhibitorLayout>
      <DashboardSectionPage
        title="My Booth"
        description="Reserve a booth space and manage your presence on the expo floor."
      >
        {myBooth && (
          <div className={`relative rounded-3xl border ${isPending ? "border-border" : "border-gold/40"} bg-surface p-6 md:p-8 overflow-hidden mb-6`}>
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border border-border" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border border-border" />
            <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${isPending ? "text-muted" : "text-gold"}`}>
              {isPending ? "Pending Admin Approval" : "Reserved Booth"}
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="font-display text-3xl md:text-4xl font-bold text-foreground">Booth {myBooth.boothNumber}</p>
                <p className="mt-1 text-sm text-muted">{myBooth.location}</p>
              </div>
              <div className="flex gap-6 font-mono">
                <div>
                  <p className="text-xs text-muted mb-1">Size</p>
                  <p className="text-lg text-foreground">{myBooth.size}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Rate</p>
                  <p className="text-lg text-emerald">PKR {myBooth.price}</p>
                </div>
              </div>
            </div>

            {isPending && (
              <p className="mt-4 text-sm text-muted">Your booth request is awaiting admin confirmation. You'll be able to manage details once approved.</p>
            )}

            {!isPending && (myBooth.products?.length > 0 || myBooth.staff?.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {myBooth.products?.map((p, i) => (
                  <span key={i} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">{p}</span>
                ))}
                {myBooth.staff?.map((s, i) => (
                  <span key={i} className="rounded-full border border-gold/30 bg-background px-3 py-1 text-xs text-gold">{s.name} · {s.role}</span>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {!isPending && (
                <button onClick={openModal} className="rounded-lg border border-gold/40 px-6 py-2 text-sm font-medium text-gold hover:bg-gold/10">Manage Details</button>
              )}
              <button onClick={() => handleRelease(myBooth._id)} className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-gold/40">
                {isPending ? "Cancel Request" : "Release Booth"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {myBooth ? "Browse other expos" : "Select an expo to reserve a booth"}
          </h2>

          <select value={selectedExpo} onChange={(e) => setSelectedExpo(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2 text-foreground">
            <option value="">Select an expo</option>
            {expos.map((expo) => (
              <option key={expo._id} value={expo._id}>{expo.title}</option>
            ))}
          </select>

          {loading && <p className="text-sm text-muted">Loading...</p>}

          {!loading && selectedExpo && booths.length === 0 && (
            <p className="text-sm text-muted">No available booths for this expo.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {booths.map((booth) => (
              <div key={booth._id} className="rounded-2xl border border-border bg-background p-4 space-y-2">
                <p className="font-semibold text-foreground">Booth {booth.boothNumber}</p>
                <p className="text-sm text-muted">{booth.size} · {booth.location}</p>
                <p className="text-sm text-muted font-mono">PKR {booth.price}</p>
                <button onClick={() => handleReserve(booth._id)} className="w-full rounded-lg bg-gold text-background py-2 text-sm font-medium">Reserve</button>
              </div>
            ))}
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground">Manage Booth Details</h3>
                <button onClick={() => setModalOpen(false)} className="text-muted hover:text-foreground"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Products / Services</p>
                  <div className="flex gap-2 mb-3">
                    <input value={productInput} onChange={(e) => setProductInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addProduct()} placeholder="e.g. Wireless earbuds" className="flex-1 rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
                    <button onClick={addProduct} className="rounded-lg bg-gold text-background px-3"><Plus size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products.map((p, i) => (
                      <span key={i} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
                        {p}
                        <button onClick={() => removeProduct(i)}><Trash2 size={12} className="text-muted hover:text-red-400" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Staff</p>
                  <div className="flex gap-2 mb-3">
                    <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Name" className="flex-1 rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
                    <input value={staffRole} onChange={(e) => setStaffRole(e.target.value)} placeholder="Role" className="flex-1 rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
                    <button onClick={addStaff} className="rounded-lg bg-gold text-background px-3"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-2">
                    {staff.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <span className="text-foreground">{s.name} <span className="text-muted">· {s.role}</span></span>
                        <button onClick={() => removeStaff(i)}><Trash2 size={14} className="text-muted hover:text-red-400" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted">Cancel</button>
                <button onClick={handleSaveDetails} className="flex-1 rounded-lg bg-gold text-background py-2 text-sm font-medium">Save</button>
              </div>
            </div>
          </div>
        )}
      </DashboardSectionPage>
    </ExhibitorLayout>
  );
};

export default ExhibitorBooth;