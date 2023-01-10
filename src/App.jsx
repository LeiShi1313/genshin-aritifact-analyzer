import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Build } from "./genshin/build";
import { loadPresets } from "./store/reducers/presets";


const Layout = lazy(() => import("./Layout"));
const Main = lazy(() => import("./features/Main"));
const BuildEditor = lazy(() => import("./features/builds/BuildEditor"));
const BuildsEditor = lazy(() => import("./features/builds/BuildsEditor"));
const ArtifactsUpload = lazy(() => import("./features/artifacts/ArtifactsUpload"));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    import('./data/presets.json').then((data) => {
      const presets = []
      for (let build of data.default) {
        presets.push(build)
      }
      dispatch(loadPresets(presets))
    })
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="build" element={<BuildEditor />} />
          <Route path="builds" element={<BuildsEditor />} />
          <Route path="artifacts/:artifactsId" element={<ArtifactsUpload />} />
        </Route>
        {/* Place new routes over this */}
        {/* <Route path="/app/*" element={<Layout />} /> */}
        {/* <Route index path="/" exact element={<Navigate to="/login" />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
