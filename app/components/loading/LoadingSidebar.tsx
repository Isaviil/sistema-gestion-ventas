import { Spinner } from "./Spinner";

const LoadingSidebar = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Spinner size="md" />
    </div>
  );
};

export default LoadingSidebar;
