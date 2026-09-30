import React, { useState } from 'react'
import AdminLayout from "@/layouts/DashboardLayout/AdminLayout"
import ResponsiveTable from "@/components/ui/ResponsiveTable"
import { mockExpos } from "@/data/mockData"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'

const statusStyles = {
  upcoming: "bg-gold/30 text-gold-200",
  ongoing: "bg-emerald/30 text-emerald-300",
  completed: "bg-muted/30 text-muted-200",
}

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const AdminExpos = () => {
  const [expos, setExpos] = useState(mockExpos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    theme: "",
    status: "upcoming",
  })
  const [editingId, setEditingId] = useState(null)
  const [expoToDelete, setExpoToDelete] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      title: "",
      date: "",
      location: "",
      description: "",
      theme: "",
      status: "upcoming",
    })
  }

 const handleSaveExpo = () => {
  if (editingId) {
    setExpos((prev) =>
      prev.map((expo) => (expo.id === editingId ? { ...formData, id: editingId } : expo))
    )
    toast.success("Expo updated successfully")
  } else {
    const newExpo = {
      id: expos.length + 1,
      ...formData,
    }
    setExpos((prev) => [...prev, newExpo])
    toast.success("Expo created successfully")
  }

  closeModal()
}

  const handleDeleteExpo = () => {
  setExpos((prev) => prev.filter((expo) => expo.id !== expoToDelete.id))
  toast.success(`"${expoToDelete.title}" deleted successfully`)
  setExpoToDelete(null)
}

  const handleEditClick = (expo) => {
    setFormData(expo)
    setEditingId(expo.id)
    setIsModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Expos
            </h1>
            <p className="text-muted text-sm md:text-base">Manage your expo events here.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-background font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            + Create Expo
          </button>
        </div>

        <ResponsiveTable>
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-3 text-sm text-muted font-medium">Title</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Date</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Location</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
  {expos.map((expo) => (
    <tr key={expo.id} className="border-b border-border last:border-0">
      <td data-label="Title" className="px-6 py-4 text-foreground font-medium">{expo.title}</td>
      <td data-label="Date" className="px-6 py-4 text-muted font-mono text-sm">{formatDate(expo.date)}</td>
      <td data-label="Location" className="px-6 py-4 text-muted">{expo.location}</td>
      <td data-label="Status" className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[expo.status]}`}>
          {expo.status}
        </span>
      </td>
      <td className="px-6 py-4 flex gap-3">
        <button
          onClick={() => handleEditClick(expo)}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => setExpoToDelete(expo)}
          className="text-muted hover:text-gold transition-colors text-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </ResponsiveTable>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                {editingId ? "Edit Expo" : "Create Expo"}
              </h2>

              <div className="flex flex-col gap-4">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Expo Title"
                  className="bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted"
                />
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="bg-background border border-border rounded-md px-3 py-2 text-foreground"
                />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExpo}
                  className="bg-gold text-background font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Save Expo
                </button>
              </div>
            </div>
          </div>
        )}
        <AlertDialog open={!!expoToDelete} onOpenChange={(open) => !open && setExpoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{expoToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-border text-muted hover:text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteExpo}
                className="bg-gold text-background hover:opacity-90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}

export default AdminExpos