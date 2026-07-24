import { getTrainers } from "@/lib/data";
import { TrainerGrid } from "../components/battle-trainer/TrainerGrid";

export const dynamic = "force-dynamic";

const Page = async () => {
  const trainers = await getTrainers();

  return <TrainerGrid trainers={trainers} />;
};

export default Page;
