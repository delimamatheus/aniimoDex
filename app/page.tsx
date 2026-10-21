import Dex from "@/components/Dex";
import { getAniimo } from "@/lib/aniimo";

export default async function Page() {
  return <Dex aniimo={await getAniimo()} />;
}
