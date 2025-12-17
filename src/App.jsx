import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";

// styles
import "@/assets/styles/index.css";
import "@/assets/styles/layout.css";
import "@/assets/styles/animation.css";

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
