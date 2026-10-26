import { useParams } from "@solidjs/router";
import { HomeView } from "../index";
import { parsePage } from "../../content";

export default function HomePaged() {
  const params = useParams();
  const page = () => parsePage(params.page) ?? 0;

  return <HomeView page={page()} />;
}
