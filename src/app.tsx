import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { PageTransition } from "./components/PageTransition";
import "../styled-system/styles.css";
import "./view-transition.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <PageTransition />
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
