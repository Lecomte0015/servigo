"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { JobStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Chat from "@/components/ui/Chat";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Job {
  id: string;
  status: string;
  description: string;
  address: string;
  city: string;
  urgencyLevel: string;
  estimatedPrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: { name: string; icon: string | null };
  assignment?: {
    artisan: {
      companyName: string;
      ratingAverage: number;
      photoUrl: string | null;
      user: { firstName: string; lastName: string; phone: string | null };
    };
    finalPrice: number | null;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  review?: {
    rating: number;
    comment: string | null;
  } | null;
}

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  { value: "MATCHING", label: "En recherche" },
  { value: "ASSIGNED", label: "Assignées" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<{
    jobId: string;
    rating: number;
    comment: string;
    submitting: boolean;
  } | null>(null);

  const limit = 10;

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/jobs?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setJobs(j.data?.jobs ?? []);
        setTotal(j.data?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, page]);

  const handleComplete = async (jobId: string) => {
    setCompleting(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, { method: "POST" });
      if (res.ok) {
        fetchJobs();
        if (selectedJob?.id === jobId) {
          setSelectedJob((prev) =>
            prev ? { ...prev, status: "COMPLETED" } : null
          );
        }
      }
    } finally {
      setCompleting(null);
    }
  };

  const handleCancel = async (jobId: string) => {
    setCancelling(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
      if (res.ok) {
        fetchJobs();
        if (selectedJob?.id === jobId) {
          setSelectedJob((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
        }
      }
    } finally {
      setCancelling(null);
    }
  };

  const handleReview = async () => {
    if (!reviewState) return;
    const { jobId, rating, comment } = reviewState;
    setReviewState((s) => s && { ...s, submitting: true });
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, rating, comment }),
      });
      if (res.ok) {
        fetchJobs();
        setReviewState(null);
      }
    } finally {
      setReviewState((s) => s && { ...s, submitting: false });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Historique des demandes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} demande{total !== 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/dashboard/new-job" className="shrink-0">
          <Button size="sm">+ Nouvelle demande</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? "bg-[#1CA7A6] text-white border-[#1CA7A6]"
                : "bg-white text-gray-600 border-[#D1E5E5] hover:border-[#1CA7A6] hover:text-[#1CA7A6]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List + Detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* List */}
        <div className="flex-1 min-w-0">
          <Card padding="none">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
              </div>
            ) : !jobs.length ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Aucune demande trouvée</p>
                <Link href="/dashboard/new-job" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">Créer une demande</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E6F2F2]">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className={`w-full text-left p-4 hover:bg-[#F4F7F7] transition-colors ${
                      selectedJob?.id === job.id ? "bg-[#E6F2F2]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#1F2937]">
                            {job.category.name}
                          </span>
                          {job.urgencyLevel === "URGENT" && (
                            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{job.description}</p>
                        <p className="text-xs text-gray-400">
                          {job.city} · {format(new Date(job.createdAt), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <JobStatusBadge status={job.status} />
                        {job.estimatedPrice && (
                          <span className="text-sm font-semibold text-[#1CA7A6]">
                            {job.estimatedPrice.toFixed(0)} CHF
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6F2F2]">
                <span className="text-xs text-gray-500">
                  Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        {selectedJob && (
          <div className="w-full lg:w-72 lg:shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{selectedJob.category.name}</CardTitle>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <JobStatusBadge status={selectedJob.status} />
              </CardHeader>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Description</p>
                  <p className="text-[#1F2937]">{selectedJob.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                  <p className="text-[#1F2937]">{selectedJob.address}, {selectedJob.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Urgence</p>
                  <p className="text-[#1F2937]">{selectedJob.urgencyLevel === "URGENT" ? "Urgente" : "Standard"}</p>
                </div>
                {selectedJob.estimatedPrice && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prix estimé</p>
                    <p className="text-[#1CA7A6] font-semibold">{selectedJob.estimatedPrice.toFixed(0)} CHF</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Créée le</p>
                  <p className="text-[#1F2937]">
                    {format(new Date(selectedJob.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>

                {selectedJob.assignment && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    <p className="text-xs text-gray-400 mb-1.5">Artisan assigné</p>
                    <div className="bg-[#F4F7F7] rounded-[8px] p-2.5 flex items-start gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {selectedJob.assignment.artisan.photoUrl ? (
                          <img
                            src={selectedJob.assignment.artisan.photoUrl}
                            alt={selectedJob.assignment.artisan.companyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (selectedJob.assignment.artisan.user.firstName[0] || "") +
                          (selectedJob.assignment.artisan.user.lastName[0] || "")
                        )}
                      </div>
                      <div className="min-w-0">
                      <p className="font-semibold text-[#1F2937] text-xs">
                        {selectedJob.assignment.artisan.companyName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedJob.assignment.artisan.user.firstName} {selectedJob.assignment.artisan.user.lastName}
                      </p>
                      {selectedJob.assignment.artisan.user.phone && (
                        <a
                          href={`tel:${selectedJob.assignment.artisan.user.phone}`}
                          className="text-xs text-[#1CA7A6] hover:underline mt-0.5 block"
                        >
                          📞 {selectedJob.assignment.artisan.user.phone}
                        </a>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs text-gray-600">
                          {selectedJob.assignment.artisan.ratingAverage.toFixed(1)}
                        </span>
                      </div>
                      </div>
                    </div>
                    {selectedJob.assignment.finalPrice && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-0.5">Prix final</p>
                        <p className="text-[#1CA7A6] font-semibold">{selectedJob.assignment.finalPrice.toFixed(0)} CHF</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Messagerie in-app */}
                {selectedJob.assignment && user && (
                  <div className="border-t border-[#E6F2F2] pt-3 -mx-4 -mb-4">
                    <div style={{ height: "360px", display: "flex", flexDirection: "column" }}>
                      <Chat
                        jobId={selectedJob.id}
                        currentUserId={user.id}
                        jobStatus={selectedJob.status}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedJob.status === "IN_PROGRESS" && (
                  <Button
                    size="sm"
                    loading={completing === selectedJob.id}
                    onClick={() => handleComplete(selectedJob.id)}
                    className="mt-1"
                  >
                    ✓ Confirmer la fin de la mission
                  </Button>
                )}

                {(selectedJob.status === "MATCHING" || selectedJob.status === "ASSIGNED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={cancelling === selectedJob.id}
                    onClick={() => handleCancel(selectedJob.id)}
                    className="mt-1 text-red-500 border-red-200 hover:border-red-400"
                  >
                    ✗ Annuler la mission
                  </Button>
                )}

                {/* Review */}
                {selectedJob.status === "COMPLETED" && !selectedJob.review && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    {reviewState?.jobId === selectedJob.id ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-[#1F2937]">Votre avis</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewState((s) => s && { ...s, rating: star })}
                              className={`text-xl transition-colors ${
                                star <= reviewState.rating ? "text-amber-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewState.comment}
                          onChange={(e) =>
                            setReviewState((s) => s && { ...s, comment: e.target.value })
                          }
                          placeholder="Commentaire (optionnel)"
                          className="w-full text-xs border border-[#D1E5E5] rounded-[6px] px-2 py-1.5 resize-none h-16 focus:outline-none focus:border-[#1CA7A6]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={reviewState.submitting}
                            onClick={handleReview}
                            disabled={reviewState.rating === 0}
                          >
                            Envoyer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReviewState(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setReviewState({
                            jobId: selectedJob.id,
                            rating: 5,
                            comment: "",
                            submitting: false,
                          })
                        }
                      >
                        ★ Laisser un avis
                      </Button>
                    )}
                  </div>
                )}

                {selectedJob.review && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    <p className="text-xs text-gray-400 mb-1">Votre avis</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= selectedJob.review!.rating ? "text-amber-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {selectedJob.review.comment && (
                      <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{selectedJob.review.comment}&rdquo;</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
