import Dex from "@/components/Dex";
import { getAniimo } from "@/lib/aniimo";

export const revalidate = 300;

export default async function Page() {
  return <Dex aniimo={await getAniimo()} />;
}
