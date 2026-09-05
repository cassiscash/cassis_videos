import { Composition } from "remotion";
import { CassisVideo } from "./CassisVideo";

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={CassisVideo}
      durationInFrames={740}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
