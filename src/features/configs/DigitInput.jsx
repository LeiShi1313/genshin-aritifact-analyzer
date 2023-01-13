import { Plus, Minus } from "phosphor-react";
const DigitInput = ({ value, setValue }) => {
  return (
    <div className="flex flex-row items-center justify-center border-b-2">
      <Minus />
      <input
        type="text"
        placeholder="Type here"
      value={3.2}
        className="input input-ghost w-12 max-w-xs px-0 text-center"
      />
      <Plus />
    </div>
  );
};

export default DigitInput;
