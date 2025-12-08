import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import "@/assets/styles/index.css";
import "@/assets/styles/layout.css";

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
