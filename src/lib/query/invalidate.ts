import type { QueryClient } from "@tanstack/react-query";

/** Invalidate herd-linked caches after any module mutation. */
export function invalidateFarmModules(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["cattle"] });
  void queryClient.invalidateQueries({ queryKey: ["husbandry"] });
  void queryClient.invalidateQueries({ queryKey: ["milk"] });
  void queryClient.invalidateQueries({ queryKey: ["health"] });
  void queryClient.invalidateQueries({ queryKey: ["breeding"] });
  void queryClient.invalidateQueries({ queryKey: ["finance"] });
  void queryClient.invalidateQueries({ queryKey: ["alerts"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
