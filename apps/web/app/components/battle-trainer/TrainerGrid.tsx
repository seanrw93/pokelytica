import { TrainerCard } from "./TrainerCard";

type Trainer = {
  id: string;
  name: string;
  title: string;
  generation: number;
  spriteId: string;
};

type TrainerGridProps = {
  trainers: Trainer[];
};

export const TrainerGrid = ({ trainers }: TrainerGridProps) => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Battle a Trainer</h1>
      <p className="text-muted-light">
        Pick an opponent — their team loads straight into the builder so you only need to build your own.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            name={trainer.name}
            title={trainer.title}
            spriteId={trainer.spriteId}
          />
        ))}
      </div>
    </div>
  );
};
