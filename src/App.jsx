import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Build } from "./genshin/build"
import { loadPresets } from "./store/reducers/presets";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemedSuspense from "./features/ThemedSuspense";
import { decodeBuild } from "./utils/build";

const Layout = lazy(() => import("./Layout"));
const Main = lazy(() => import("./features/Main"));
const BuildEditor = lazy(() => import("./features/builds/BuildEditor"));
const BuildsEditor = lazy(() => import("./features/builds/BuildsEditor"));
const ArtifactsUpload = lazy(() =>
  import("./features/artifacts/ArtifactsUpload")
);
const Artifact = lazy(() => import("./features/artifacts/Artifact"));
const UploadedArtifacts = lazy(() => import("./features/artifacts/UploadedArtifacts"));
const Config = lazy(() => import("./features/configs/Config"));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    import("./data/presets.js").then((data) => {
      const presets = [];
      // console.log(data.default)
      for (let rawBuild of data.default) {
        try {
          presets.push(decodeBuild(rawBuild));
        } catch (e) {
          console.error(e)
        }
      }
      dispatch(loadPresets(presets));
    });
    
    // import("./data/presets.json").then((data) => {
    //   const presets = [];
    //   for (let build of data.default) {
    //     presets.push(build);
    //     console.log(JSON.stringify(Build.encode(build).finish()))
    //   }
    //   dispatch(loadPresets(presets));
    // });
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <Suspense fallback={<ThemedSuspense />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Main />} />
              <Route path="build" element={<BuildEditor />} />
              <Route path="builds" element={<BuildsEditor />} />
              <Route
                path="uploaded"
                element={<UploadedArtifacts />}
              />
              <Route
                path="artifacts/:artifactsId"
                element={<ArtifactsUpload />}
              />
              <Route path="artifact" element={<Artifact />} />
              <Route path="config" element={<Config />} />
            </Route>
            {/* Place new routes over this */}
            {/* <Route path="/app/*" element={<Layout />} /> */}
            {/* <Route index path="/" exact element={<Navigate to="/login" />} /> */}
          </Routes>
        </Suspense>
      </ThemeProvider>
    </Router>
  );
};

export default App;
