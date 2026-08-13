import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import KycReviewPage from "./page";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const QUEUE = `${ADMIN_BASE}/api/admin/kyc`;

function queueItem(uuid: string, userId: number) {
  return {
    uuid,
    user_id: userId,
    status: "pending",
    submitted_at: "2026-08-10T09:00:00+00:00",
  };
}

function detail(uuid: string, userId: number, docUuid = "doc-1") {
  return {
    uuid,
    user_id: userId,
    status: "pending",
    level: 0,
    submitted_at: "2026-08-10T09:00:00+00:00",
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    documents: [
      {
        uuid: docUuid,
        type: "id_front",
        mime: "image/png",
        size: 24680,
        sha256: "abc",
        uploaded_at: "2026-08-10T09:00:00+00:00",
      },
    ],
  };
}

describe("KycReviewPage — permission + review flow", () => {
  beforeEach(() => {
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:mock-kyc-doc"),
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("refuses a user without kyc.review", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));
    renderWithAuth(<KycReviewPage />);
    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Aucun dossier/i)).not.toBeInTheDocument();
  });

  it("shows the queue for a kyc.review user", async () => {
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    server.use(
      http.get(QUEUE, () =>
        HttpResponse.json(envelope({ items: [queueItem("k1", 42)] })),
      ),
    );
    renderWithAuth(<KycReviewPage />);
    expect(await screen.findByText("#42")).toBeInTheDocument();
  });

  it("approving a dossier refreshes the queue (item disappears)", async () => {
    let queueCalls = 0;
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    server.use(
      http.get(QUEUE, () => {
        queueCalls += 1;
        const items = queueCalls === 1 ? [queueItem("k1", 42)] : [];
        return HttpResponse.json(envelope({ items }));
      }),
      http.get(`${QUEUE}/k1`, () => HttpResponse.json(envelope(detail("k1", 42)))),
      http.post(`${QUEUE}/k1/approve`, () =>
        HttpResponse.json(
          envelope({ ...detail("k1", 42), status: "approved" }, "kyc_approved"),
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<KycReviewPage />);

    await user.click(await screen.findByRole("button", { name: "Examiner" }));
    await user.click(await screen.findByRole("button", { name: "Approuver" }));

    await waitFor(() =>
      expect(
        screen.getByText("Aucun dossier KYC en attente."),
      ).toBeInTheDocument(),
    );
    expect(queueCalls).toBeGreaterThanOrEqual(2);
  });

  it("rejecting requires a reason (empty is refused, no request sent)", async () => {
    let rejectCalls = 0;
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    server.use(
      http.get(QUEUE, () =>
        HttpResponse.json(envelope({ items: [queueItem("k1", 42)] })),
      ),
      http.get(`${QUEUE}/k1`, () => HttpResponse.json(envelope(detail("k1", 42)))),
      http.post(`${QUEUE}/k1/reject`, async ({ request }) => {
        rejectCalls += 1;
        const body = (await request.json()) as { reason?: string };
        return HttpResponse.json(
          envelope(
            { ...detail("k1", 42), status: "rejected", rejection_reason: body.reason },
            "kyc_rejected",
          ),
        );
      }),
    );

    const user = userEvent.setup();
    renderWithAuth(<KycReviewPage />);

    await user.click(await screen.findByRole("button", { name: "Examiner" }));
    await user.click(await screen.findByRole("button", { name: "Rejeter" }));

    const dialog = await screen.findByRole("dialog");
    // Confirm with an empty reason → blocked client-side, no network call.
    await user.click(
      within(dialog).getByRole("button", { name: "Confirmer le rejet" }),
    );
    expect(
      within(dialog).getByText(/motif d'au moins 3 caractères est obligatoire/i),
    ).toBeInTheDocument();
    expect(rejectCalls).toBe(0);

    // Provide a reason → request is sent.
    await user.type(within(dialog).getByLabelText(/Motif/i), "Document illisible");
    await user.click(
      within(dialog).getByRole("button", { name: "Confirmer le rejet" }),
    );
    await waitFor(() => expect(rejectCalls).toBe(1));
  });

  it("fetches a document via an authenticated request, never a public URL", async () => {
    let docCalls = 0;
    let sawXhrHeader = false;
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    server.use(
      http.get(QUEUE, () =>
        HttpResponse.json(envelope({ items: [queueItem("k1", 42)] })),
      ),
      http.get(`${QUEUE}/k1`, () => HttpResponse.json(envelope(detail("k1", 42)))),
      http.get(`${QUEUE}/k1/documents/doc-1`, ({ request }) => {
        docCalls += 1;
        sawXhrHeader =
          request.headers.get("X-Requested-With") === "XMLHttpRequest";
        return new HttpResponse("PNGDATA", {
          headers: { "Content-Type": "image/png" },
        });
      }),
    );

    const user = userEvent.setup();
    const { container } = renderWithAuth(<KycReviewPage />);

    await user.click(await screen.findByRole("button", { name: "Examiner" }));
    await user.click(
      await screen.findByRole("button", { name: "Voir le document" }),
    );

    await waitFor(() => expect(docCalls).toBe(1));
    expect(sawXhrHeader).toBe(true);
    // The stream is never referenced by a public/raw API URL in the DOM.
    expect(container.innerHTML).not.toContain("/api/admin/kyc/k1/documents");
    // It is rendered from the authenticated blob object URL.
    const img = await screen.findByRole("img");
    expect(img.getAttribute("src")).toBe("blob:mock-kyc-doc");
  });

  it("previews a PDF in a sandboxed iframe (no scripts allowed)", async () => {
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    const pdfDetail = {
      ...detail("k1", 42, "doc-pdf"),
      documents: [
        {
          uuid: "doc-pdf",
          type: "id_front",
          mime: "application/pdf",
          size: 24680,
          sha256: "abc",
          uploaded_at: "2026-08-10T09:00:00+00:00",
        },
      ],
    };
    server.use(
      http.get(QUEUE, () =>
        HttpResponse.json(envelope({ items: [queueItem("k1", 42)] })),
      ),
      http.get(`${QUEUE}/k1`, () => HttpResponse.json(envelope(pdfDetail))),
      http.get(`${QUEUE}/k1/documents/doc-pdf`, () =>
        new HttpResponse("%PDF-1.4", {
          headers: { "Content-Type": "application/pdf" },
        }),
      ),
    );

    const user = userEvent.setup();
    const { container } = renderWithAuth(<KycReviewPage />);
    await user.click(await screen.findByRole("button", { name: "Examiner" }));
    await user.click(
      await screen.findByRole("button", { name: "Voir le document" }),
    );

    const iframe = await waitFor(() => {
      const el = container.querySelector("iframe");
      expect(el).not.toBeNull();
      return el as HTMLIFrameElement;
    });
    // The backend serves the doc with `sandbox`; the preview must not discard it.
    expect(iframe.hasAttribute("sandbox")).toBe(true);
    expect(iframe.getAttribute("sandbox")).toBe("");
  });

  it("still errors honestly (no fabricated data) on an unauthorized doc", async () => {
    seedMe(adminUser(["kyc.review"], ["kyc_officer"]));
    server.use(
      http.get(QUEUE, () =>
        HttpResponse.json(envelope({ items: [queueItem("k1", 42)] })),
      ),
      http.get(`${QUEUE}/k1`, () => HttpResponse.json(envelope(detail("k1", 42)))),
      http.get(`${QUEUE}/k1/documents/doc-1`, () =>
        HttpResponse.json(errorEnvelope("forbidden"), { status: 403 }),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<KycReviewPage />);
    await user.click(await screen.findByRole("button", { name: "Examiner" }));
    await user.click(
      await screen.findByRole("button", { name: "Voir le document" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
