const Memorial = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-base-300 to-base-100 p-8">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="/xigua.jpg"
            alt="西瓜"
            className="w-full h-auto max-w-md object-cover"
          />
        </div>

        <div className="text-center space-y-4 text-base-content/80">
          <h1 className="text-4xl font-bold text-base-content">西瓜</h1>

          <div className="space-y-2 text-lg">
            <p>纪念最好的瓜瓜</p>
            <p>感谢你陪伴我们的每一天</p>
            <p>希望你能每天快乐没有烦恼</p>
            <p className="text-sm opacity-70">2025.11.23</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memorial;
