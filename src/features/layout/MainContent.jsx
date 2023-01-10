const MainContent = ({ children }) => {
  return (
    <div className="flex overflow-auto flex-auto w-full grow">
      <div className="flex flex-col justify-start items-center w-full h-full lg:container lg:mx-auto">
        {children}
      </div>
    </div>
  );
};

export default MainContent;
