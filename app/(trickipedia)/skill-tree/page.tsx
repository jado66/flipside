import { SkillTree } from "@/components/skill-tree";

export default function Home() {
  return (
    <main className="min-h-screen  p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold  mb-2 ">Trick Skill Tree</h1>
          <p className=" text-lg">
            Master tricks by unlocking prerequisites and following branching
            paths
          </p>
        </div>
        <SkillTree />
      </div>
    </main>
  );
}
