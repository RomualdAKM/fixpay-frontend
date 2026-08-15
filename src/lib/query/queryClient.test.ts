import { MutationObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { createQueryClient } from "@/lib/query/queryClient";
import { testUser } from "@/test/msw/handlers";

describe("createQueryClient global 401 handler", () => {
  it("flips me to null when a background query fails with 401", async () => {
    const client = createQueryClient();
    client.setQueryData(queryKeys.me, testUser);

    await expect(
      client.fetchQuery({
        queryKey: queryKeys.wallet,
        queryFn: () => {
          throw new ApiError(401, "Unauthenticated.");
        },
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(client.getQueryData(queryKeys.me)).toBeNull();
  });

  it("flips me to null when a mutation fails with 401", async () => {
    const client = createQueryClient();
    client.setQueryData(queryKeys.me, testUser);

    const observer = new MutationObserver(client, {
      mutationFn: () => {
        throw new ApiError(401, "Unauthenticated.");
      },
    });

    await expect(observer.mutate()).rejects.toBeInstanceOf(ApiError);

    expect(client.getQueryData(queryKeys.me)).toBeNull();
  });

  it("leaves me untouched on a non-401 error", async () => {
    const client = createQueryClient();
    client.setQueryData(queryKeys.me, testUser);

    await expect(
      client.fetchQuery({
        queryKey: queryKeys.wallet,
        queryFn: () => {
          throw new ApiError(500, "Server error.");
        },
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(client.getQueryData(queryKeys.me)).toEqual(testUser);
  });
});
