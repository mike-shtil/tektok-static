import { useParams } from "@solidjs/router";
import { parsePage } from "../../../../content";
import { CategoryView } from "../../../../components/CategoryView";

export default function CategoryPaged() {
  const params = useParams();
  const page = () => parsePage(params.page) ?? 0;

  return <CategoryView page={page()} />;
}
