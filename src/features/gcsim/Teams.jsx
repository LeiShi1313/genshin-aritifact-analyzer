import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchGCSimScript } from "../../store/reducers/gcsim";

const Teams = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const gcsimScripts = import.meta.glob("/public/gcsim/scripts/*.txt");
    console.log(gcsimScripts)

    // console.log(gcsimScripts);
    Object.keys(gcsimScripts).forEach((scriptPath) => {
      dispatch(fetchGCSimScript(scriptPath.slice(7)));
      // const scriptName = scriptPath.split("/").pop();
      // // const script = import.meta.glob(f`../../data/gcsim/scripts/${scriptName}`);
      // console.log(scriptPath);
      // fetch(scriptPath).then((response) => {
      //     console.log(response.text());
      // })
    })
  }, []);
  return (
    <div>
      <h1>Teams</h1>
    </div>
  );
};

export default Teams;
