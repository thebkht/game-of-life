import Game from "@/components/game";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <ModeToggle className="absolute top-4 right-4" />
      <Game />
    </main>
  );
}
