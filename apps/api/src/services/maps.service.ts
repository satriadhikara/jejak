import db from "@/db";
import { MapsAnalyzeBody } from "@/validators/maps.validator";

type MapsServiceDependencies = {
  db: typeof db;
};

export const createMapsService = ({ db }: MapsServiceDependencies) => {
  const analyze = async (body: MapsAnalyzeBody) => {
    return {};
  };

  return {
    analyze,
  };
};

const mapsService = createMapsService({ db });

export async function analyze(body: MapsAnalyzeBody) {
  return mapsService.analyze(body);
}
