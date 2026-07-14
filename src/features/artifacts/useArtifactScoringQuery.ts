import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  parseArtifactScoringQuery,
  serializeArtifactScoringQuery,
  type ArtifactScoringQuery,
} from "./scoringQuery";

export const useArtifactScoringQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(
    () => parseArtifactScoringQuery(searchParams),
    [searchParams]
  );

  const updateQuery = useCallback(
    (
      update:
        | Partial<ArtifactScoringQuery>
        | ((current: ArtifactScoringQuery) => Partial<ArtifactScoringQuery>)
    ) => {
      const patch = typeof update === "function" ? update(query) : update;
      const next = { ...query, ...patch };
      setSearchParams(serializeArtifactScoringQuery(next), { replace: true });
    },
    [query, setSearchParams]
  );

  return [query, updateQuery] as const;
};
