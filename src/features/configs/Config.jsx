import { useTranslation } from "react-i18next";
import DigitInput from "./DigitInput";

const Config = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="my-auto flex h-full w-full flex-col items-center justify-center">
        <div className="tabs tabs-boxed rounded-b-none">
          <a className="tab">Tab 1</a>
          <a className="tab tab-active">Tab 2</a>
          <a className="tab">Tab 3</a>
        </div>
        <div className="flex w-full flex-col items-center justify-center bg-base-200 sm:w-3/4 md:w-1/2">
          <div className="grid grid-cols-5 gap-2">
            {[...Array(25).keys()].map((idx) => (
              <DigitInput />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
