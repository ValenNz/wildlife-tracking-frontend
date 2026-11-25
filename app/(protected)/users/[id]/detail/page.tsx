"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/button";
import { StatusBadge } from "@/components/status";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Panel, SectionHeader } from "@/components/ui/panel";
import {
  useUserActivity,
  useUserById,
  useUserTokenRevoke,
  useUserTokens,
} from "@/hooks/use-users";
import { formatApiError, toApiErrorState } from "@/services/api";
import { TYPE_USER_STATUS_LABELS } from "@/types/user.type";
import { formatDateTime } from "@/utils/format";

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-0.5 text-sm text-ink">{value}</dd>
  </div>
);

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const { showToast } = useToast();
  const userQuery = useUserById(userId);
  const tokensQuery = useUserTokens(userId);
  const activityQuery = useUserActivity(userId);
  const revokeMutation = useUserTokenRevoke(userId);

  if (userQuery.isPending) return <Loading label="Memuat pengguna..." />;

  if (userQuery.isError) {
    const error = toApiErrorState(userQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void userQuery.refetch()}
      />
    );
  }

  const user = userQuery.data?.data;

  if (!user) return <EmptyState title={`Pengguna #${userId} tidak ditemukan`} />;

  const tokens = tokensQuery.data?.data ?? [];
  const activity = activityQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/users" className="text-xs font-medium text-muted underline-offset-2 hover:underline">
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-ink">{user.full_name}</h2>
          <p className="text-sm text-ink-soft">@{user.username}</p>
        </div>
        <StatusBadge
          label={TYPE_USER_STATUS_LABELS[user.status] ?? user.status}
          variant={user.status === "aktif" ? "success" : "neutral"}
        />
      </div>

      <section className="ui-panel p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <DetailField label="Email" value={user.email} />
          <DetailField label="Role" value={user.role?.name_role.replaceAll("_", " ") ?? "-"} />
          <DetailField label="Telepon" value={user.phone ?? "-"} />
          <DetailField label="Terdaftar" value={formatDateTime(user.created_at)} />
        </dl>
      </section>

      <Panel>
        <SectionHeader
          title="Sesi Login Aktif"
          description="Cabut sesi bila perangkat hilang atau akun dipakai orang lain."
        />
        {tokens.length === 0 ? (
          <p className="text-sm text-muted">Tidak ada sesi aktif.</p>
        ) : (
          <ul className="divide-y divide-line">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="text-ink-soft">
                  Masuk {formatDateTime(token.created_at)} · terakhir dipakai {formatDateTime(token.last_used_at)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<KeyRound className="size-3.5" />}
                  loading={revokeMutation.isPending && revokeMutation.variables === token.id}
                  onClick={() =>
                    revokeMutation.mutate(token.id, {
                      onSuccess: () => showToast("Sesi dicabut.", "success"),
                      onError: (error) => showToast(formatApiError(error, "Gagal mencabut sesi."), "error"),
                    })
                  }
                >
                  Cabut Sesi
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <SectionHeader title="Aktivitas Terakhir" description="50 aktivitas terbaru pengguna ini." />
        {activity.length === 0 ? (
          <p className="text-sm text-muted">Belum ada aktivitas.</p>
        ) : (
          <ul className="divide-y divide-line">
            {activity.slice(0, 50).map((item) => (
              <li key={item.log_id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-ink">{item.action}</span>
                <span className="text-xs text-muted">{formatDateTime(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
